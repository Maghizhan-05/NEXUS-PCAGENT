import si from "systeminformation";
import type { BrowserWindow } from "electron";

// Nullable everywhere: a field is null when the machine/driver doesn't expose
// it (e.g. CPU temp without LibreHardwareMonitor). The UI shows "Unavailable"
// rather than a fabricated value.
export interface GpuSensor {
  name: string;
  vendor: string;
  tempC: number | null;
  utilPercent: number | null;
  memUsedMb: number | null;
  memTotalMb: number | null;
  powerW: number | null;
  clockMhz: number | null;
}

export interface SensorSnapshot {
  timestamp: number;
  cpu: { tempC: number | null; clockGhz: number | null };
  gpus: GpuSensor[];
  battery: {
    hasBattery: boolean;
    percent: number | null;
    charging: boolean;
    healthPercent: number | null;
    timeRemainingMin: number | null;
  } | null;
}

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;

export async function readSensors(): Promise<SensorSnapshot> {
  const [temp, clock, battery, graphics] = await Promise.all([
    si.cpuTemperature().catch(() => null),
    si.cpuCurrentSpeed().catch(() => null),
    si.battery().catch(() => null),
    si.graphics().catch(() => null),
  ]);

  const gpus: GpuSensor[] = (graphics?.controllers ?? [])
    // Keep controllers that actually report sensor data (discrete GPUs).
    .filter((c) => num(c.temperatureGpu) != null || num(c.utilizationGpu) != null)
    .map((c) => ({
      name: c.model ?? "GPU",
      vendor: c.vendor ?? "",
      tempC: num(c.temperatureGpu),
      utilPercent: num(c.utilizationGpu),
      memUsedMb: num(c.memoryUsed),
      memTotalMb: num(c.memoryTotal),
      powerW: num(c.powerDraw),
      clockMhz: num(c.clockCore),
    }));

  let bat: SensorSnapshot["battery"] = null;
  if (battery && battery.hasBattery) {
    const health =
      num(battery.maxCapacity) != null && num(battery.designedCapacity) != null
        ? Math.round((battery.maxCapacity / battery.designedCapacity) * 100)
        : null;
    bat = {
      hasBattery: true,
      percent: num(battery.percent),
      charging: !!battery.isCharging,
      healthPercent: health,
      timeRemainingMin: num(battery.timeRemaining),
    };
  }

  return {
    timestamp: Date.now(),
    cpu: { tempC: num(temp?.main), clockGhz: num(clock?.avg) },
    gpus,
    battery: bat,
  };
}

let timer: ReturnType<typeof setInterval> | null = null;
let logged = false;

/** Poll sensors on an interval and push each snapshot to the renderer. */
export function startSensorLoop(getWindow: () => BrowserWindow | null, intervalMs = 2000) {
  stopSensorLoop();
  const tick = async () => {
    try {
      const snapshot = await readSensors();
      if (!logged) {
        logged = true;
        const g = snapshot.gpus[0];
        console.log(
          "[nexus] sensors online:",
          `cpuTemp=${snapshot.cpu.tempC ?? "n/a"}`,
          g ? `gpu=${g.name} ${g.tempC}C ${g.powerW}W vram=${g.memUsedMb}/${g.memTotalMb}MB` : "gpu=none",
          snapshot.battery ? `batt=${snapshot.battery.percent}% health=${snapshot.battery.healthPercent}%` : "batt=none"
        );
      }
      getWindow()?.webContents.send("nexus:sensors", snapshot);
    } catch {
      /* transient sensor read failure — next tick retries */
    }
  };
  tick();
  timer = setInterval(tick, intervalMs);
}

export function stopSensorLoop() {
  if (timer) clearInterval(timer);
  timer = null;
}
