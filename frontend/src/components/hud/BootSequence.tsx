import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ENGINES = [
  "TELEMETRY ENGINE",
  "PROCESS ENGINE",
  "NETWORK ENGINE",
  "ALERT ENGINE",
  "VOICE INTERFACE",
];

interface Props {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count >= ENGINES.length) {
      const t = setTimeout(onComplete, 550);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c + 1), 260);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nexus-bg"
    >
      <div className="mb-8 text-center">
        <div className="text-4xl tracking-[0.6em] text-glow text-nexus-cyan">NEXUS</div>
        <div className="mt-2 text-[10px] tracking-[0.4em] text-nexus-mute">
          NEXUS INITIALIZATION
        </div>
      </div>

      <div className="w-72 space-y-2">
        {ENGINES.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: i < count ? 1 : 0.15 }}
            className="flex items-center justify-between text-[11px] tracking-[0.15em]"
          >
            <span className="text-nexus-white/70">{name}</span>
            <span className={i < count ? "text-nexus-cyan" : "text-nexus-mute"}>
              {i < count ? (name === "VOICE INTERFACE" ? "READY" : "ONLINE") : "…"}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: count >= ENGINES.length ? 1 : 0 }}
        className="mt-8 text-center"
      >
        <div className="text-lg tracking-[0.4em] text-nexus-cyan">SYSTEM ONLINE</div>
      </motion.div>
    </motion.div>
  );
}
