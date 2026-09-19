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
