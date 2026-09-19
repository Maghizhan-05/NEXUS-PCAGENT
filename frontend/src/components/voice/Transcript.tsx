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
      <p className="font-mono text-[10px] leading-relaxed text-nexus-faint">
        “How is my system?” · “What's using the most memory?”
      </p>
    );
  }

  return (
    <div className="max-h-full space-y-1.5 overflow-y-auto pr-1">
      {transcript.map((entry) => (
        <div key={entry.id} className="flex gap-2">
          <span
            className={`shrink-0 font-mono text-[9px] tracking-wider ${
              entry.role === "user" ? "text-nexus-faint" : "text-nexus-cyan"
            }`}
          >
            {entry.role === "user" ? "YOU" : "NX"}
          </span>
          <span className="font-mono text-[11px] leading-snug text-nexus-text/85">{entry.text}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
