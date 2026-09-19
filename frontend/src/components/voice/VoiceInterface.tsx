import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { Transcript } from "./Transcript";
import type { VoiceState } from "@/types/telemetry";

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "READY",
  listening: "LISTENING",
  thinking: "CONNECTING",
  speaking: "RESPONDING",
  error: "ERROR",
};

const STATE_TONE: Record<VoiceState, string> = {
  idle: "#7a88ab",
  listening: "#2f6bff",
  thinking: "#5b8cff",
  speaking: "#2f6bff",
  error: "#e5142a",
};

export function VoiceInterface() {
  const { start, stop, available, connected, state, error } = useVoice();
  const tone = STATE_TONE[state];

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Voice</span>
        <span className="font-mono text-[9px] tracking-widest2" style={{ color: tone }}>
          {available ? STATE_LABEL[state] : "OFFLINE"}
        </span>
      </div>

      <div className="panel-body flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={connected ? stop : start}
            disabled={!available}
            aria-label={connected ? "Stop voice session" : "Start voice session"}
            title={available ? "Talk to NEXUS" : "Voice not configured"}
            className="flex h-9 w-9 shrink-0 items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              borderColor: connected ? tone : "#19222d",
              backgroundColor: connected ? `${tone}22` : "transparent",
            }}
          >
            {state === "thinking" ? (
              <Loader2 size={15} className="animate-spin" style={{ color: tone }} />
            ) : connected ? (
              <Mic size={15} style={{ color: tone }} />
            ) : (
              <MicOff size={15} className="text-nexus-faint" />
            )}
          </button>
          <div className="flex-1">
            <VoiceVisualizer state={state} />
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <Transcript />
        </div>

        {!available && (
          <p className="font-mono text-[9px] leading-relaxed text-nexus-faint">
            Set ElevenLabs keys in backend/.env to enable voice control.
          </p>
        )}
        {error && <p className="font-mono text-[9px] text-nexus-red">{error}</p>}
      </div>
    </div>
  );
}
