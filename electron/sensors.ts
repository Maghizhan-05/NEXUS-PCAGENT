import si from "systeminformation";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { BrowserWindow } from "electron";

const execp = promisify(exec);

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

// --- Adaptive availability + caches -----------------------------------------
// Each sensor read spawns an OS subprocess (nvidia-smi / wmic / powershell),
// which is expensive. We (a) prefer a single fast nvidia-smi query for the GPU,
// (b) stop polling sensors that consistently return nothing, and (c) refresh
// slow-moving values (battery, CPU temp) on a throttle, reusing the cache in
// between. This keeps steady-state cost to roughly one light spawn per cycle.
let nvidiaOk = true;
let cpuTempOk = true;
let cpuTempMisses = 0;
let tick = 0;

let cachedGpus: GpuSensor[] = [];
let cachedBattery: SensorSnapshot["battery"] = null;
let cachedCpuTemp: number | null = null;

async function readGpuNvidia(): Promise<GpuSensor[] | null> {
  if (!nvidiaOk) return null;
  try {
    const q =
      "nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw,clocks.gr --format=csv,noheader,nounits";
    const { stdout } = await execp(q, { timeout: 4000, windowsHide: true });
    const gpus = stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, temp, util, memU, memT, power, clock] = line.split(",").map((s) => s.trim());
        return {
          name: name || "NVIDIA GPU",
          vendor: "NVIDIA",
          tempC: num(Number(temp)),
          utilPercent: num(Number(util)),
          memUsedMb: num(Number(memU)),
          memTotalMb: num(Number(memT)),
          powerW: num(Number(power)),
          clockMhz: num(Number(clock)),
        } as GpuSensor;
      });
    return gpus;
  } catch {
    nvidiaOk = false; // no nvidia-smi on PATH — fall back to systeminformation
    return null;
  }
}

async function readGpuFallback(): Promise<GpuSensor[]> {
  const graphics = await si.graphics().catch(() => null);
  return (graphics?.controllers ?? [])
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
}

async function readBattery(): Promise<SensorSnapshot["battery"]> {
  const b = await si.battery().catch(() => null);
  if (!b || !b.hasBattery) return null;
  const health =
    num(b.maxCapacity) != null && num(b.designedCapacity) != null
      ? Math.round((b.maxCapacity / b.designedCapacity) * 100)
      : null;
  return {
    hasBattery: true,
    percent: num(b.percent),
    charging: !!b.isCharging,
    healthPercent: health,
    timeRemainingMin: num(b.timeRemaining),
  };
}

export async function readSensors(): Promise<SensorSnapshot> {
  tick += 1;

  // GPU + CPU clock every cycle (both cheap now: one nvidia-smi spawn, clock is
  // in-proc). GPU falls back to the heavier si.graphics only if nvidia-smi is
  // absent, and then only every 3rd cycle.
  const clock = await si.cpuCurrentSpeed().catch(() => null);

  let gpus = await readGpuNvidia();
  if (gpus == null) {
    gpus = tick % 3 === 1 ? await readGpuFallback() : cachedGpus;
  }
  cachedGpus = gpus;

  // CPU temp is null without LibreHardwareMonitor; stop probing after a few
  // misses so we don't spawn wmic forever for nothing. Otherwise refresh ~12s.
  if (cpuTempOk && tick % 3 === 1) {
    const t = await si.cpuTemperature().catch(() => null);
    cachedCpuTemp = num(t?.main);
    if (cachedCpuTemp == null && ++cpuTempMisses >= 3) cpuTempOk = false;
    else if (cachedCpuTemp != null) cpuTempMisses = 0;
  }

  // Battery moves slowly — refresh ~20s, reuse cache otherwise.
  if (tick % 5 === 1) cachedBattery = await readBattery();

  return {
    timestamp: Date.now(),
    cpu: { tempC: cachedCpuTemp, clockGhz: num(clock?.avg) },
    gpus,
    battery: cachedBattery,
  };
}

// --- Loop -------------------------------------------------------------------
let timer: ReturnType<typeof setInterval> | null = null;
let logged = false;

/**
 * Poll sensors on an interval and push each snapshot to the renderer. Skips the
 * (expensive) read entirely while the window is hidden/minimized — no point
 * spawning nvidia-smi for a window nobody is looking at.
 */
export function startSensorLoop(getWindow: () => BrowserWindow | null, intervalMs = 4000) {
  stopSensorLoop();
  const tickFn = async () => {
    const win = getWindow();
    if (!win || win.isDestroyed() || !win.isVisible()) return;
    try {
      const snapshot = await readSensors();
      if (!logged) {
        logged = true;
        const g = snapshot.gpus[0];
        console.log(
          "[nexus] sensors online:",
          `cpuTemp=${snapshot.cpu.tempC ?? "n/a"}`,
          g ? `gpu=${g.name} ${g.tempC}C ${g.powerW}W` : "gpu=none",
          snapshot.battery ? `batt=${snapshot.battery.percent}% health=${snapshot.battery.healthPercent}%` : "batt=none"
        );
      }
      if (!win.isDestroyed()) win.webContents.send("nexus:sensors", snapshot);
    } catch {
      /* transient sensor read failure — next tick retries */
    }
  };
  tickFn();
  timer = setInterval(tickFn, intervalMs);
}

export function stopSensorLoop() {
  if (timer) clearInterval(timer);
  timer = null;
}
