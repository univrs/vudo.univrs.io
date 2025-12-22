/**
 * StaticBackground - CSS-only fallback for mobile devices
 * Used when WebGL/Three.js is not available or on mobile devices
 */
export function StaticBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[var(--bg-primary)]">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-surface)] to-[var(--bg-primary)]" />

      {/* Animated glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-[#00ff88]/5 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 md:w-72 md:h-72 rounded-full bg-[#8b5cf6]/5 blur-3xl animate-pulse-slow animation-delay-1000" />
      <div className="absolute top-1/2 right-1/3 w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#fbbf24]/5 blur-3xl animate-pulse-slow animation-delay-2000" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Top and bottom fades */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[var(--bg-primary)]/60" />
    </div>
  );
}

export default StaticBackground;
