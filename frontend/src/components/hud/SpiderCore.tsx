import { useState } from "react";
import { motion } from "framer-motion";
import type { CoreState } from "@/types/telemetry";

interface Props {
  state: CoreState;
  label: string;
  sublabel: string;
  load: number; // real CPU 0..100
}

const ACCENT: Record<CoreState, string> = {
  idle: "#2f6bff",
  listening: "#2f6bff",
  thinking: "#2f6bff",
  speaking: "#2f6bff",
  warning: "#e5142a",
};

const R = 96;
const CIRC = 2 * Math.PI * R;

/** The spider emblem: elongated body + 8 fanned legs, drawn as strokes. */
function Emblem({ color }: { color: string }) {
  const legs: string[] = [];
  // 4 legs per side; upper legs angle up, lower legs angle down.
  const config = [
    { rootY: -6, kneeY: -22, tipY: -30 }, // top pair
    { rootY: -2, kneeY: -8, tipY: -6 },
    { rootY: 2, kneeY: 8, tipY: 6 },
    { rootY: 6, kneeY: 22, tipY: 30 }, // bottom pair
  ];
  const spread = [26, 34, 34, 26];
  config.forEach((c, i) => {
    const kx = spread[i];
    const tx = kx + 12;
    // right leg
    legs.push(`M 0 ${c.rootY} Q ${kx} ${c.kneeY} ${tx} ${c.tipY}`);
    // left leg (mirror)
    legs.push(`M 0 ${c.rootY} Q ${-kx} ${c.kneeY} ${-tx} ${c.tipY}`);
  });
  return (
    <g transform="translate(120 120)" stroke={color} fill={color} strokeWidth="2" strokeLinecap="round">
      {legs.map((d, i) => (
        <path key={i} d={d} fill="none" />
      ))}
      {/* body */}
      <ellipse cx="0" cy="2" rx="4.5" ry="15" />
      <circle cx="0" cy="-16" r="3.5" />
    </g>
  );
}

export function SpiderCore({ state, label, sublabel, load }: Props) {
  const accent = ACCENT[state];
  const clamped = Number.isFinite(load) ? Math.max(0, Math.min(load, 100)) : 0;
  const offset = CIRC - (clamped / 100) * CIRC;
  const active = state === "listening" || state === "speaking";
  const [thwips, setThwips] = useState<number[]>([]);

  const fire = () => {
    const id = Date.now();
    setThwips((t) => [...t, id]);
    setTimeout(() => setThwips((t) => t.filter((x) => x !== id)), 600);
  };

  // Concentric web arcs + radial spokes.
  const spokes = Array.from({ length: 12 });
  const webRings = [30, 52, 74, 96];

  return (
    <button
      onClick={fire}
      aria-label="Ping spider-sense"
      className="group relative flex cursor-pointer flex-col items-center justify-center bg-transparent"
    >
      <div className="relative">
        {/* THWIP web-pulse rings on click */}
        {thwips.map((id) => (
          <span
            key={id}
            className="pointer-events-none absolute inset-0 m-auto h-24 w-24 animate-thwip rounded-full border-2"
            style={{ borderColor: accent, top: 0, bottom: 0, left: 0, right: 0 }}
          />
        ))}

        <svg viewBox="0 0 240 240" className="h-full w-full max-h-[46vh]" style={{ maxWidth: 380 }}>
          <defs>
            <radialGradient id="spiderGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
              <stop offset="55%" stopColor={accent} stopOpacity="0.14" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* web spokes */}
          {spokes.map((_, i) => {
            const a = (i / spokes.length) * Math.PI * 2;
            return (
              <line
                key={i}
                x1="120"
                y1="120"
                x2={120 + Math.cos(a) * R}
                y2={120 + Math.sin(a) * R}
                stroke="#20305c"
                strokeWidth="0.75"
              />
            );
          })}
          {/* web rings (subtle catenary look via plain circles) */}
          {webRings.map((r) => (
            <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="#20305c" strokeWidth="0.75" />
          ))}

          {/* radar sweep */}
          <motion.g
            style={{ transformOrigin: "120px 120px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: state === "warning" ? 2.4 : 6, repeat: Infinity, ease: "linear" }}
          >
            <line x1="120" y1="120" x2="120" y2={120 - R} stroke={accent} strokeWidth="1.5" opacity="0.55" />
            <path
              d={`M 120 120 L 120 ${120 - R} A ${R} ${R} 0 0 1 ${120 + R * 0.4} ${120 - R * 0.9} Z`}
              fill={accent}
              opacity="0.06"
            />
          </motion.g>

          {/* real CPU-load gauge */}
          <circle cx="120" cy="120" r={R} fill="none" stroke="#16223f" strokeWidth="3" />
          <circle
            cx="120"
            cy="120"
            r={R}
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 120 120)"
            style={{
              filter: `drop-shadow(0 0 5px ${accent}88)`,
              transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease",
            }}
          />

          {/* center glow */}
          <motion.circle
            cx="120"
            cy="120"
            r="58"
            fill="url(#spiderGlow)"
            animate={
              active
                ? { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }
                : { scale: [1, 1.04, 1], opacity: [0.7, 0.9, 0.7] }
            }
            transition={{ duration: active ? 1 : 3.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "120px 120px" }}
          />

          <Emblem color={accent} />
        </svg>
      </div>

      <div className="-mt-1 text-center">
        <div
          className={`font-display text-lg font-semibold uppercase tracking-widest2 ${
            state === "warning" ? "text-glow-red" : "text-glow-blue"
          }`}
          style={{ color: accent }}
        >
          {label}
        </div>
        <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest2 text-web-faint transition-colors group-hover:text-web-blue">
          {sublabel} · thwip
        </div>
      </div>
    </button>
  );
}
