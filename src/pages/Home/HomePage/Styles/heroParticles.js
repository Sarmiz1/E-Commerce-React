// ─── Module-level constants (Math.random NEVER inside components) ─────────────
export const HERO_PARTICLES = Array.from({ length: 50 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 2 + 0.4,
  vx: (Math.random() - 0.5) * 0.3,
  vy: (Math.random() - 0.5) * 0.3,
  opacity: Math.random() * 0.45 + 0.08,
}));