import { motion } from "framer-motion";
import { useMemo } from "react";
import type { CoreState } from "@/types/telemetry";

interface Props {
  state: CoreState;
  label: string;
  sublabel: string;
  /** 0..100 drives the reactor intensity (e.g. CPU load or voice level). */
  intensity: number;
}

const COLORS: Record<CoreState, string> = {
  idle: "#22d3ee",
  listening: "#38bdf8",
  thinking: "#22d3ee",
  speaking: "#5eead4",
  warning: "#f5b642",
};

function ticks(count: number, radius: number, len: number, color: string) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const x1 = 150 + Math.cos(angle) * radius;
    const y1 = 150 + Math.sin(angle) * radius;
    const x2 = 150 + Math.cos(angle) * (radius + len);
    const y2 = 150 + Math.sin(angle) * (radius + len);
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1}
        opacity={i % 4 === 0 ? 0.7 : 0.25}
      />
    );
  });
}

export function NexusCore({ state, label, sublabel, intensity }: Props) {
  const color = COLORS[state];
  const pulseDur = state === "listening" || state === "speaking" ? 1.1 : state === "warning" ? 0.8 : 2.6;
  const ringSpin = state === "thinking" ? 4 : 22;
  const tickMarks = useMemo(() => ticks(48, 128, 8, color), [color]);
  const coreScale = 0.9 + Math.min(intensity, 100) / 100 * 0.25;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg viewBox="0 0 300 300" className="w-[300px] h-[300px] md:w-[360px] md:h-[360px]">
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="45%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* tick ring */}
        <g>{tickMarks}</g>

        {/* outer rotating ring */}
        <motion.circle
          cx="150"
          cy="150"
          r="112"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="4 10"
          opacity="0.5"
          style={{ transformOrigin: "150px 150px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: ringSpin, repeat: Infinity, ease: "linear" }}
        />

        {/* inner counter-rotating ring with a bright arc */}
        <motion.g
          style={{ transformOrigin: "150px 150px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: ringSpin * 1.6, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="150" cy="150" r="92" fill="none" stroke={color} strokeWidth="1" opacity="0.18" />
          <path
            d="M 150 58 A 92 92 0 0 1 234 118"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#soft)"
          />
        </motion.g>

        {/* orbiting elements */}
        <motion.g
          style={{ transformOrigin: "150px 150px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="150" cy="42" r="3" fill={color} />
          <circle cx="150" cy="258" r="2" fill={color} opacity="0.6" />
        </motion.g>

        {/* glow halo */}
        <motion.circle
          cx="150"
          cy="150"
          r="70"
          fill="url(#coreGlow)"
          animate={{ scale: [coreScale, coreScale + 0.06, coreScale], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: pulseDur, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "150px 150px" }}
        />

        {/* pulsing center */}
        <motion.circle
          cx="150"
          cy="150"
          r="30"
          fill={color}
          fillOpacity="0.9"
          animate={{ scale: [coreScale, coreScale + 0.12, coreScale] }}
          transition={{ duration: pulseDur, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "150px 150px", filter: "url(#soft)" }}
        />
        <circle cx="150" cy="150" r="14" fill="#e6f1f5" fillOpacity="0.85" />
      </svg>

      <div className="mt-2 text-center">
        <div className="text-lg tracking-[0.4em] text-glow" style={{ color }}>
          {label}
        </div>
        <div className="mt-1 text-[10px] tracking-[0.3em] text-nexus-mute uppercase">
          {sublabel}
        </div>
      </div>
    </div>
  );
}
