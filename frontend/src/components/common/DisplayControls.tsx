import { Maximize2, Minimize2 } from "lucide-react";
import { SCALE_STEPS, useDisplayScale, useFullscreen } from "@/hooks/useDisplayScale";

export function DisplayControls() {
  const { scale, setScale } = useDisplayScale();
  const fs = useFullscreen();

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center gap-0.5 border border-nexus-line"
        role="group"
        aria-label="Display scale"
      >
        {SCALE_STEPS.map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            aria-pressed={scale === s}
            className={`px-2 py-1 font-mono text-[10px] tracking-wide transition-colors ${
              scale === s
                ? "bg-nexus-cyan/15 text-nexus-cyan"
                : "text-nexus-faint hover:text-nexus-mute"
            }`}
          >
            {Math.round(s * 100)}
          </button>
        ))}
      </div>

      {fs.supported && (
        <button
          onClick={fs.toggle}
          aria-label={fs.active ? "Exit fullscreen" : "Enter fullscreen"}
          title={fs.active ? "Exit fullscreen" : "Fullscreen"}
          className="flex h-6 w-6 items-center justify-center border border-nexus-line text-nexus-mute transition-colors hover:text-nexus-cyan"
        >
          {fs.active ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
      )}
    </div>
  );
}
