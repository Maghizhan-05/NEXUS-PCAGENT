interface Props {
  /** 0 = calm, 1 = spider-sense (red edge tingle). */
  sense: number;
}

/** Web strands anchored to opposite corners + a spider-sense edge vignette. */
export function WebBackground({ sense }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-web-void">
      {/* depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 40%, rgba(47,107,255,0.10), transparent 70%)",
        }}
      />

      {/* web strands, top-left anchor */}
      <svg
        className="absolute -left-24 -top-24 h-[60vh] w-[60vh] opacity-[0.16]"
        viewBox="0 0 400 400"
        fill="none"
        stroke="#2f6bff"
        strokeWidth="0.7"
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * (Math.PI / 2);
          return <line key={i} x1="0" y1="0" x2={Math.cos(a) * 460} y2={Math.sin(a) * 460} />;
        })}
        {[70, 140, 210, 280, 350].map((r) => (
          <path key={r} d={`M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}`} />
        ))}
      </svg>

      {/* web strands, bottom-right anchor */}
      <svg
        className="absolute -bottom-24 -right-24 h-[52vh] w-[52vh] opacity-[0.12]"
        viewBox="0 0 400 400"
        fill="none"
        stroke="#2f6bff"
        strokeWidth="0.7"
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * (Math.PI / 2);
          return (
            <line key={i} x1="400" y1="400" x2={400 - Math.cos(a) * 440} y2={400 - Math.sin(a) * 440} />
          );
        })}
        {[80, 170, 260, 350].map((r) => (
          <path key={r} d={`M ${400 - r} 400 A ${r} ${r} 0 0 1 400 ${400 - r}`} />
        ))}
      </svg>

      {/* spider-sense edge tingle */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: sense,
          boxShadow: "inset 0 0 160px 20px rgba(229,20,42,0.35)",
          animation: sense ? "senseP 1.4s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}
