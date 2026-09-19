import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { WebBackground } from "@/components/hud/WebBackground";
import { Header } from "@/components/hud/Header";
import { Footer } from "@/components/hud/Footer";
import { BootSequence } from "@/components/hud/BootSequence";
import { SpiderCore } from "@/components/hud/SpiderCore";

import { CpuPanel } from "@/components/telemetry/CpuPanel";
import { MemoryPanel } from "@/components/telemetry/MemoryPanel";
import { NetworkPanel } from "@/components/telemetry/NetworkPanel";
import { DiskPanel } from "@/components/telemetry/DiskPanel";
import { GpuPanel } from "@/components/telemetry/GpuPanel";
import { BatteryPanel } from "@/components/telemetry/BatteryPanel";
import { SystemStatusPanel } from "@/components/telemetry/SystemStatusPanel";
import { ProcessPanel } from "@/components/processes/ProcessPanel";
import { AlertPanel } from "@/components/alerts/AlertPanel";
import { VoiceInterface } from "@/components/voice/VoiceInterface";
import { CommandConsole } from "@/components/common/CommandConsole";

import { useTelemetry } from "@/hooks/useTelemetry";
import { useSensors } from "@/hooks/useSensors";
import { useDisplayScale } from "@/hooks/useDisplayScale";
import { api } from "@/lib/api";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useVoiceStore } from "@/stores/voiceStore";
import { useAlertStore } from "@/stores/alertStore";
import { overallStatus } from "@/lib/status";
import type { CoreState } from "@/types/telemetry";

export default function App() {
  const [booting, setBooting] = useState(true);
  useTelemetry();
  useSensors();
  useDisplayScale();

  const latest = useTelemetryStore((s) => s.latest);
  const status = useTelemetryStore((s) => s.status);
  const voiceState = useVoiceStore((s) => s.state);
  const setVoiceAvailable = useVoiceStore((s) => s.setAvailable);
  const alertCount = useAlertStore((s) => s.active.length);

  useEffect(() => {
    api
      .capabilities()
      .then((c) => setVoiceAvailable(c.voice))
      .catch(() => setVoiceAvailable(false));
  }, [setVoiceAvailable]);

  const cpu = latest?.cpu ?? status?.cpu.usage_percent ?? 0;
  const mem = latest?.memory ?? status?.memory.percent ?? 0;
  const disk = status?.disk.percent ?? 0;
  const overall = useMemo(() => overallStatus(cpu, mem, disk), [cpu, mem, disk]);

  const coreState: CoreState = useMemo(() => {
    if (voiceState === "listening") return "listening";
    if (voiceState === "thinking") return "thinking";
    if (voiceState === "speaking") return "speaking";
    if (overall.level === "WARNING" || overall.level === "CRITICAL") return "warning";
    return "idle";
  }, [voiceState, overall.level]);

  const coreLabel =
    coreState === "listening"
      ? "LISTENING"
      : coreState === "thinking"
        ? "CONNECTING"
        : coreState === "speaking"
          ? "RESPONDING"
          : coreState === "warning"
            ? overall.level
            : `${cpu.toFixed(0)}% CPU`;

  // Spider-sense fires on a warning/critical system state or any active alert.
  const sense =
    overall.level === "WARNING" || overall.level === "CRITICAL" || alertCount > 0 ? 1 : 0;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-web-void text-web-text">
      <WebBackground sense={sense} />

      <AnimatePresence>
        {booting && <BootSequence onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      <Header />

      <main
        className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden"
        style={{ zoom: "var(--nexus-scale)" } as React.CSSProperties}
      >
        <div className="flex min-h-full flex-col gap-2 p-2 lg:h-full lg:gap-3 lg:p-3">
          {/* Primary region: telemetry / core / telemetry */}
          <div className="grid grid-cols-1 gap-2 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(200px,1fr)_minmax(0,1.5fr)_minmax(200px,1fr)] lg:gap-3 xl:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.7fr)_minmax(220px,0.9fr)]">
            <section className="flex min-h-0 flex-col gap-2 lg:gap-3 lg:overflow-y-auto">
              <CpuPanel />
              <MemoryPanel />
              <GpuPanel />
              <SystemStatusPanel />
            </section>

            <section className="flex min-h-[280px] items-center justify-center lg:min-h-0">
              <SpiderCore state={coreState} label={coreLabel} sublabel="SPIDER CORE" load={cpu} />
            </section>

            <section className="flex min-h-0 flex-col gap-2 lg:gap-3 lg:overflow-y-auto">
              <NetworkPanel />
              <DiskPanel />
              <BatteryPanel />
              <AlertPanel />
            </section>
          </div>

          {/* Secondary region: process / voice / console */}
          <div className="grid shrink-0 grid-cols-1 gap-2 md:grid-cols-[1.5fr_1fr_1fr] lg:h-[clamp(160px,24vh,230px)] lg:gap-3 [&>*]:min-h-[150px] lg:[&>*]:min-h-0">
            <ProcessPanel />
            <VoiceInterface />
            <CommandConsole />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
