/**
 * Decorative stage environment. Three static planes sit behind the reading
 * object: a warm wash behind the active idea, a fine dot field, and a
 * perspective grid that only shows near the horizon. Nothing here animates, so
 * the page rests still and reduced motion needs no special case.
 */
export function KnowledgeAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(1180px,150vh)] overflow-hidden"
    >
      <div className="hansa-wash absolute inset-0" />
      <div className="hansa-dots absolute inset-x-0 top-0 h-[720px]" />
      <div className="hansa-floor absolute inset-x-0 bottom-0 h-[420px]" />
    </div>
  );
}
