/** Decorative corner brackets that frame the whole viewport. */
export function Reticle() {
  const bracket =
    "pointer-events-none fixed w-8 h-8 border-nexus-cyan/30 z-40";
  return (
    <>
      <div className={`${bracket} top-3 left-3 border-t border-l`} />
      <div className={`${bracket} top-3 right-3 border-t border-r`} />
      <div className={`${bracket} bottom-3 left-3 border-b border-l`} />
      <div className={`${bracket} bottom-3 right-3 border-b border-r`} />
    </>
  );
}
