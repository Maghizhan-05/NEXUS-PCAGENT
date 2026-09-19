import { useEffect, useRef } from "react";
import { useVoiceStore } from "@/stores/voiceStore";

export function Transcript() {
  const transcript = useVoiceStore((s) => s.transcript);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  if (transcript.length === 0) {
    return (
      <div className="text-[10px] text-nexus-mute">
        Transcript will appear here once you speak with NEXUS.
      </div>
    );
  }

  return (
    <div className="max-h-24 space-y-2 overflow-y-auto pr-1">
      {transcript.map((entry) => (
        <div key={entry.id}>
          <div
            className={`text-[9px] tracking-[0.25em] ${
              entry.role === "user" ? "text-nexus-mute" : "text-nexus-cyan"
            }`}
          >
            {entry.role === "user" ? "YOU" : "NEXUS"}
          </div>
          <div className="text-[11px] text-nexus-white/85">{entry.text}</div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
