import { motion } from "framer-motion";
import type { VoiceState } from "@/types/telemetry";

interface Props {
  state: VoiceState;
}

const BARS = 24;

export function VoiceVisualizer({ state }: Props) {
  const active = state === "listening" || state === "speaking";
  const color = state === "speaking" ? "#5eead4" : state === "error" ? "#f04a4a" : "#22d3ee";

  return (
    <div className="flex h-8 items-center justify-center gap-[3px]">
      {Array.from({ length: BARS }).map((_, i) => {
        const base = 3;
        const peak = active ? 4 + Math.abs(Math.sin(i * 0.9)) * 20 : base;
        return (
          <motion.span
            key={i}
            className="w-[2px] rounded-full"
            style={{ backgroundColor: color }}
            animate={{ height: active ? [base, peak, base] : base }}
            transition={{
              duration: 0.6 + (i % 5) * 0.08,
              repeat: active ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
