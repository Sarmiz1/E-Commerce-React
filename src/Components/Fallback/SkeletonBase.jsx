/* eslint-disable react-refresh/only-export-components */
// Shared dark hibernating-wave animation + skeleton primitives used by page skeletons.
const SKELETON_STYLES = `
  @keyframes sk-hibernating-wave {
    0%, 100% { background-position: 140% 0; opacity: .8; }
    50%      { background-position: -40% 0; opacity: 1; }
  }
  .sk {
    animation: sk-hibernating-wave 2.8s ease-in-out infinite;
    background-size: 260% 100%;
    border-radius: 8px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
  }
  .sk-light {
    background-image: linear-gradient(105deg, #101827 8%, #182236 35%, #293952 50%, #182236 65%, #101827 92%);
  }
  .sk-dark {
    background-image: linear-gradient(105deg, #090f1c 8%, #121c2d 35%, #22314a 50%, #121c2d 65%, #090f1c 92%);
  }
  @media (prefers-reduced-motion: reduce) {
    .sk { animation: none; }
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
