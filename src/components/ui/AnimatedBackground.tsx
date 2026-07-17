/**
 * Subtle animated background shapes. Purely decorative (aria-hidden), sits
 * behind content. Respects prefers-reduced-motion via the global CSS.
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[var(--decor-opacity)]"
    >
      <div
        className="animate-float absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--rf-magenta) 45%, transparent), transparent 70%)",
        }}
      />
      <div
        className="animate-float-slow absolute -left-32 top-1/3 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--rf-purple) 45%, transparent), transparent 70%)",
        }}
      />
      <div
        className="animate-float absolute bottom-0 right-1/4 h-64 w-64 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--rf-cyan) 35%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
