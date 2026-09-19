import { motion } from "framer-motion";
import type { VoiceState } from "@/types/telemetry";

interface Props {
  state: VoiceState;
}

const BARS = 24;

export function VoiceVisualizer({ state }: Props) {
  const active = state === "listening" || state === "speaking";
  const color = state === "speaking" ? "#5b8cff" : state === "error" ? "#e5142a" : "#2f6bff";

  return (
    <div className="flex h-6 items-center justify-center gap-[3px]">
      {Array.from({ length: BARS }).map((_, i) => {
        const base = 2;
        const peak = active ? 3 + Math.abs(Math.sin(i * 0.9)) * 16 : base;
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
