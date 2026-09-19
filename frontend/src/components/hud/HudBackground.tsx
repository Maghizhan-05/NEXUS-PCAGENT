export function HudBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-nexus-bg">
      {/* radial depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(14,116,144,0.16), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 120%, rgba(34,211,238,0.08), transparent 45%)",
        }}
      />
      {/* fine grid */}
      <div className="hud-grid absolute inset-0" />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 40%, rgba(5,7,10,0.85) 100%)",
        }}
      />
    </div>
  );
}
