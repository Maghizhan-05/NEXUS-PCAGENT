import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ENGINES = ["telemetry", "processes", "network", "spider-sense", "web-shooter"];

interface Props {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: Props) {
  const [count, setCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Run the sequence exactly once on mount, independent of parent re-renders.
  useEffect(() => {
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      if (i >= ENGINES.length) {
        setTimeout(() => !cancelled && onCompleteRef.current(), 420);
        return;
      }
      i += 1;
      setCount(i);
      setTimeout(tick, 200);
    };
    const start = setTimeout(tick, 200);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, []);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-web-void"
    >
      <div className="mb-7 font-display text-4xl font-bold uppercase tracking-[0.3em] text-web-text text-glow-blue">
        NE<span className="text-web-red">X</span>US
      </div>
      <div className="w-60 space-y-1.5">
        {ENGINES.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0.12 }}
            animate={{ opacity: i < count ? 1 : 0.12 }}
            className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest2"
          >
            <span className="text-web-mute">{name}</span>
            <span className={i < count ? "text-web-blue" : "text-web-faint"}>
              {i < count ? "online" : "…"}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
