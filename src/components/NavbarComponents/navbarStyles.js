export const NAVBAR_STYLES = `
  .nb-pill {
    transition: none;
    will-change: background, box-shadow, border-color, margin-top;
  }

  .nb-icon-btn {
    display:flex;align-items:center;justify-content:center;
    width:38px;height:38px;border-radius:9999px;
    transition:transform 0.14s;
    cursor:pointer;border:none;outline:none;position:relative;flex-shrink:0;
  }

  .nb-icon-btn:hover  { transform:scale(1.09); }
  .nb-icon-btn:active { transform:scale(0.94); }

  .nb-icon-btn.hidden { display:none; }
  @media (min-width:1024px) {
    .nb-icon-btn.lg\\:hidden { display:none; }
  }

  .nb-navlink {
    position:relative;font-size:0.8125rem;font-weight:600;letter-spacing:0.03em;
    padding:6px 12px;border-radius:9999px;white-space:nowrap;
    transition:none;cursor:pointer;border:none;outline:none;
    display:flex;align-items:center;gap:4px;
  }

  .nb-cart-panel {
    position:absolute;top:calc(100% + 14px);right:0;
    width:360px;max-height:480px;
    border-radius:24px;overflow:hidden;
    background:rgba(255,255,255,0.98);
    backdrop-filter:blur(24px);
    box-shadow:0 24px 80px rgba(0,0,0,0.18),0 4px 16px rgba(0,0,0,0.08);
    border:1px solid rgba(0,0,0,0.06);
  }

  .dark .nb-cart-panel {
    background:rgba(18,18,20,0.95);
    border:1px solid rgba(255,255,255,0.08);
    box-shadow:0 24px 80px rgba(0,0,0,0.4);
  }

  @keyframes nb-pop { 0%{transform:scale(1)} 40%{transform:scale(1.6)} 70%{transform:scale(0.85)} 100%{transform:scale(1)} }
  .nb-pop { animation: nb-pop 0.45s cubic-bezier(0.36,0.07,0.19,0.97) }

  .nb-mega-link {
    display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;
    font-size:0.8125rem;font-weight:500;color:#4b5563;
    transition:background 0.15s,color 0.15s,transform 0.15s;cursor:pointer;
    border:none;outline:none;width:100%;text-align:left;
  }

  .nb-mega-link:hover { background:#f5f3ff;color:#4f46e5;transform:translateX(3px); }
  .nb-search-input:focus { outline:none; }
  .nb-cart-scroll::-webkit-scrollbar { width:4px; }
  .nb-cart-scroll::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.12);border-radius:9999px; }
`;
