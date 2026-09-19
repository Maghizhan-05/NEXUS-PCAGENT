export interface CpuTelemetry {
  usage_percent: number;
  core_count: number;
  logical_core_count: number;
  frequency_mhz: number | null;
}

export interface MemoryTelemetry {
  total: number;
  used: number;
  available: number;
  percent: number;
}

export interface DiskTelemetry {
  total: number;
  used: number;
  free: number;
  percent: number;
  read_bytes: number | null;
  write_bytes: number | null;
}

export interface NetworkTelemetry {
  bytes_sent: number;
  bytes_received: number;
  upload_rate: number;
  download_rate: number;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  cpu_model: string;
  boot_time: number;
  uptime: number;
}

export interface GpuTelemetry {
  available: boolean;
  name: string | null;
  load_percent: number | null;
  memory_percent: number | null;
}

export interface SystemStatus {
  cpu: CpuTelemetry;
  memory: MemoryTelemetry;
  disk: DiskTelemetry;
  network: NetworkTelemetry;
  system: SystemInfo;
  gpu: GpuTelemetry;
}

export interface TelemetrySnapshot {
  timestamp: number;
  cpu: number;
  memory: number;
  upload: number;
  download: number;
  disk: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_percent: number;
  memory_bytes: number;
  status: string;
}

export interface ProcessList {
  sort: string;
  count: number;
  processes: ProcessInfo[];
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: number;
}

export type StatusLevel = "OPTIMAL" | "NORMAL" | "ELEVATED" | "WARNING" | "CRITICAL";
export type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "error";
export type CoreState = "idle" | "listening" | "thinking" | "speaking" | "warning";
