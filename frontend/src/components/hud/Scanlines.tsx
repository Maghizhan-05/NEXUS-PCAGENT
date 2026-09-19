export function Scanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.06]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.6) 3px, transparent 4px)",
      }}
    />
  );
}
