import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { HudBackground } from "@/components/hud/HudBackground";
import { Scanlines } from "@/components/hud/Scanlines";
import { Reticle } from "@/components/hud/Reticle";
import { Header } from "@/components/hud/Header";
import { BootSequence } from "@/components/hud/BootSequence";
import { NexusCore } from "@/components/hud/NexusCore";

import { CpuPanel } from "@/components/telemetry/CpuPanel";
import { MemoryPanel } from "@/components/telemetry/MemoryPanel";
import { NetworkPanel } from "@/components/telemetry/NetworkPanel";
import { DiskPanel } from "@/components/telemetry/DiskPanel";
import { SystemStatusPanel } from "@/components/telemetry/SystemStatusPanel";
import { ProcessPanel } from "@/components/processes/ProcessPanel";
import { AlertPanel } from "@/components/alerts/AlertPanel";
import { VoiceInterface } from "@/components/voice/VoiceInterface";
import { CommandConsole } from "@/components/common/CommandConsole";

import { useTelemetry } from "@/hooks/useTelemetry";
import { api } from "@/lib/api";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useVoiceStore } from "@/stores/voiceStore";
import { overallStatus } from "@/lib/status";
import type { CoreState } from "@/types/telemetry";

export default function App() {
  const [booting, setBooting] = useState(true);
  useTelemetry();

  const latest = useTelemetryStore((s) => s.latest);
  const status = useTelemetryStore((s) => s.status);
  const voiceState = useVoiceStore((s) => s.state);
  const setVoiceAvailable = useVoiceStore((s) => s.setAvailable);

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

  // Voice state takes priority; otherwise reflect system health.
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
        ? "ANALYZING"
        : coreState === "speaking"
          ? "RESPONDING"
          : coreState === "warning"
            ? overall.level
            : "ONLINE";

  return (
    <>
      <HudBackground />
      <Scanlines />
      <Reticle />

      <AnimatePresence>
        {booting && <BootSequence onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      {!booting && (
        <div className="flex h-screen flex-col">
          <Header />

          <main className="grid flex-1 grid-cols-12 gap-3 overflow-hidden p-3">
            {/* Left column */}
            <section className="col-span-3 flex flex-col gap-3 overflow-y-auto">
              <CpuPanel />
              <MemoryPanel />
              <SystemStatusPanel />
            </section>

            {/* Center */}
            <section className="col-span-6 flex flex-col items-center justify-between gap-3">
              <div className="flex flex-1 items-center justify-center">
                <NexusCore
                  state={coreState}
                  label={coreLabel}
                  sublabel="NEXUS CORE"
                  intensity={cpu}
                />
              </div>
              <div className="grid w-full grid-cols-2 gap-3">
                <ProcessPanel />
                <VoiceInterface />
              </div>
            </section>

            {/* Right column */}
            <section className="col-span-3 flex flex-col gap-3 overflow-y-auto">
              <NetworkPanel />
              <DiskPanel />
              <AlertPanel />
              <div className="min-h-[160px] flex-1">
                <CommandConsole />
              </div>
            </section>
          </main>
        </div>
      )}
    </>
  );
}
