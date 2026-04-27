export const PG_STYLES = `
  /* ── Global custom scrollbar ── */
  html { scrollbar-width: thin; scrollbar-color: var(--woo-border-default, #d1d5db) transparent; }
  *::-webkit-scrollbar { width: 6px; height: 6px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: var(--woo-border-default, #d1d5db); border-radius: 9999px; }
  *::-webkit-scrollbar-thumb:hover { background: var(--woo-border-strong, #9ca3af); }

  /* ── Animations ── */
  @keyframes pg-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .pg-ticker { animation: pg-ticker 35s linear infinite; }
  .pg-ticker:hover { animation-play-state: paused; }

  @keyframes pg-dot { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)} 55%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
  .pg-dot { animation: pg-dot 2s ease-out infinite; }

  @keyframes pg-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .pg-skeleton { animation: pg-shimmer 1.4s ease-in-out infinite; background-size: 800px 100%; }
  .pg-skeleton-light { background-image: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); }
  .pg-skeleton-dark { background-image: linear-gradient(90deg, #19191C 25%, #2C2C30 50%, #19191C 75%); }

  .pg-range { -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; width:100%; }
  .pg-range::-webkit-slider-runnable-track { height:3px; border-radius:9999px; background:var(--woo-border-default, #e5e7eb); }
  .pg-range::-webkit-slider-thumb {
    -webkit-appearance:none; width:16px; height:16px; border-radius:50%;
    background:var(--woo-brand-electric-blue, #111827); margin-top:-6.5px;
    border:2px solid var(--woo-surface-primary, #fff);
    box-shadow:0 1px 4px rgba(0,0,0,.35);
  }

  .pg-cart-btn {
    display:flex; align-items:center; justify-content:center;
    width:32px; height:32px; border-radius:8px;
    border:1.5px solid var(--woo-border-default, #e5e7eb);
    background:var(--woo-surface-primary, #fff);
    color:var(--woo-text-secondary, #6b7280);
    cursor:pointer; transition:all 0.2s;
  }
  .pg-cart-btn:hover { background:var(--woo-brand-electric-blue, #0050d4); border-color:var(--woo-brand-electric-blue, #0050d4); color:var(--woo-text-inverse, #fff); transform: translateY(-2px); }

  @keyframes pg-ad-slide { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .pg-ad-strip { animation: pg-ad-slide 22s linear infinite; }
  .pg-ad-strip:hover { animation-play-state: paused; }

  .pg-slim::-webkit-scrollbar { width:4px; height:4px; }
  .pg-slim::-webkit-scrollbar-thumb { background:var(--woo-border-default,#e5e7eb); border-radius:9999px; }
`;
