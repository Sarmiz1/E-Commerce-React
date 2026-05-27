// Shared shimmer animation + skeleton primitives used by all page skeletons
const SKELETON_STYLES = `
  @keyframes sk-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .sk {
    animation: sk-shimmer 1.4s ease-in-out infinite;
    background-size: 800px 100%;
    border-radius: 8px;
  }
  .sk-light {
    background-image: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  }
  .sk-dark {
    background-image: linear-gradient(90deg, #19191C 25%, #2C2C30 50%, #19191C 75%);
  }
`;

/** Inject skeleton CSS once */
export function SkeletonStyles() {
  return <style>{SKELETON_STYLES}</style>;
}

/** Shorthand: returns "sk sk-light" or "sk sk-dark" */
export function skCls(dark = false) {
  return `sk ${dark ? "sk-dark" : "sk-light"}`;
}

/** A single rectangular skeleton block */
export function SkBlock({ w = "100%", h = "16px", rounded = "8px", dark = false, className = "", style = {} }) {
  return (
    <div
      className={`${skCls(dark)} ${className}`}
      style={{ width: w, height: h, borderRadius: rounded, flexShrink: 0, ...style }}
    />
  );
}
