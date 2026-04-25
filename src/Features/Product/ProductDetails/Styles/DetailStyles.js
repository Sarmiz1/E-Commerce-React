export const FONT_LINK = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');
`;

// ─── Dual-mode CSS ────────────────────────────────────────────────────────────
export const DETAIL_STYLES = `
  ${FONT_LINK}

  /* ── Gold / accent — unchanged in both modes ── */
  :root {
    --gold: #C9A96E;
    --gold-light: #E2C99A;
    --gold-dim: rgba(201,169,110,0.15);
  }

  /* ── DARK mode (default) ── */
  .pd-root {
    --obsidian: #0A0A0B;
    --ink:      #111114;
    --smoke:    #1C1C20;
    --ash:      #2A2A30;
    --mist:     #3D3D45;
    --silver:   #8A8A95;
    --platinum: #C8C8D0;
    --cream:    #F2EDE6;
    --paper:    #FAF8F4;
    --white:    #FFFFFF;

    /* semantic */
    --pd-page:          #0A0A0B;
    --pd-section:       #111114;
    --pd-overlay:       #141416;
    --pd-overlay-2:     #0e0e10;
    --pd-hero-grad:     linear-gradient(180deg,#0f0f11 0%,#0A0A0B 100%);
    --pd-intel-grad:    linear-gradient(160deg,#141416 0%,#0e0e10 100%);

    /* surfaces */
    --pd-s1: rgba(255,255,255,0.025);
    --pd-s2: rgba(255,255,255,0.04);
    --pd-s3: rgba(255,255,255,0.06);
    --pd-s4: rgba(255,255,255,0.03);

    /* borders */
    --pd-b1: rgba(255,255,255,0.05);
    --pd-b2: rgba(255,255,255,0.07);
    --pd-b3: rgba(255,255,255,0.08);
    --pd-b4: rgba(255,255,255,0.10);
    --pd-b5: rgba(255,255,255,0.12);

    /* input */
    --pd-input-bg:  rgba(255,255,255,0.04);
    --pd-input-bdr: rgba(255,255,255,0.08);
    --pd-input-fcs: rgba(201,169,110,0.5);

    /* text via semantic vars */
    --pd-heading: #F2EDE6;
    --pd-body:    #8A8A95;
    --pd-body-2:  #C8C8D0;
    --pd-muted:   #3D3D45;

    /* grain */
    --pd-grain-op: 0.35;

    /* thumb strip scrollbar */
    --pd-thumb-clr: rgba(201,169,110,0.3);

    /* pairings section */
    --pd-pair-bg: #111114;
    --pd-pair-bdr: rgba(255,255,255,0.05);
  }

  /* ── LIGHT mode ── */
  .pd-root[data-theme="light"] {
    --obsidian: #FAF8F4;
    --ink:      #F2EDE6;
    --smoke:    #EEEAE3;
    --ash:      #D4D0C8;
    --mist:     #9A9A9A;
    --silver:   #6A6A72;
    --platinum: #3A3A44;
    --cream:    #111114;
    --paper:    #FAF8F4;
    --white:    #FFFFFF;

    --pd-page:       #FAF8F4;
    --pd-section:    #F2EDE6;
    --pd-overlay:    #FFFFFF;
    --pd-overlay-2:  #F8F5F0;
    --pd-hero-grad:  linear-gradient(180deg,#EEEBE5 0%,#FAF8F4 100%);
    --pd-intel-grad: linear-gradient(160deg,#FFFFFF 0%,#F8F5F0 100%);

    --pd-s1: rgba(0,0,0,0.025);
    --pd-s2: rgba(0,0,0,0.04);
    --pd-s3: rgba(0,0,0,0.06);
    --pd-s4: rgba(0,0,0,0.02);

    --pd-b1: rgba(0,0,0,0.07);
    --pd-b2: rgba(0,0,0,0.09);
    --pd-b3: rgba(0,0,0,0.11);
    --pd-b4: rgba(0,0,0,0.13);
    --pd-b5: rgba(0,0,0,0.15);

    --pd-input-bg:  rgba(0,0,0,0.04);
    --pd-input-bdr: rgba(0,0,0,0.12);
    --pd-input-fcs: rgba(201,169,110,0.6);

    --pd-heading: #111114;
    --pd-body:    #6A6A72;
    --pd-body-2:  #3A3A44;
    --pd-muted:   #9A9A9A;

    --pd-grain-op: 0.08;

    --pd-thumb-clr: rgba(201,169,110,0.4);

    --pd-pair-bg:  #F2EDE6;
    --pd-pair-bdr: rgba(0,0,0,0.07);
  }

  .pd-root { font-family: 'Jost', sans-serif; }
  .pd-display { font-family: 'Cormorant Garamond', serif; }

  /* ── IMPORTANT: use clip not hidden so position:sticky works ── */
  .pd-root { overflow-x: clip; }

  /* ── Grain overlay ── */
  .pd-grain::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: var(--pd-grain-op, 0.35);
    mix-blend-mode: overlay;
  }

  /* ── Reveal animations ── */
  @keyframes pd-rise { from { transform: translateY(28px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes pd-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pd-draw-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes pd-spin { to { transform: rotate(360deg); } }
  @keyframes pd-pulse-gold {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.4); }
    50% { box-shadow: 0 0 0 8px rgba(201,169,110,0); }
  }
  @keyframes pd-live-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
    55% { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
  }
  @keyframes pd-gauge { from { stroke-dashoffset: var(--pd-start); } to { stroke-dashoffset: var(--pd-end); } }
  @keyframes pd-spark { from { stroke-dashoffset: var(--pd-len); } to { stroke-dashoffset: 0; } }
  @keyframes pd-atc-rise { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .pd-rise-1 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
  .pd-rise-2 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
  .pd-rise-3 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.19s both; }
  .pd-rise-4 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.26s both; }
  .pd-rise-5 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.33s both; }
  .pd-rise-6 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.40s both; }
  .pd-rise-7 { animation: pd-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.47s both; }

  .pd-fade-in { animation: pd-fade 0.9s ease 0.1s both; }
  .pd-spin-anim { animation: pd-spin 0.8s linear infinite; }

  .pd-gauge-arc { animation: pd-gauge 1.3s cubic-bezier(0.22,1,0.36,1) 0.4s forwards; }
  .pd-sparkline { animation: pd-spark 1.5s ease-out 0.7s forwards; stroke-dasharray: var(--pd-len); stroke-dashoffset: var(--pd-len); }
  .pd-live-dot { animation: pd-live-dot 2s ease-out infinite; }
  .pd-pulse-gold { animation: pd-pulse-gold 2.5s ease-out infinite; }

  /* ── Image zoom ── */
  .pd-img-zoom { transition: transform 0.8s cubic-bezier(0.32,0.72,0,1); }
  .pd-img-wrap:hover .pd-img-zoom { transform: scale(1.04); }

  /* ── Hairline divider ── */
  .pd-rule {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0.3;
  }

  /* ── Gold underline for active tab ── */
  .pd-tab-on::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    transform-origin: left;
    animation: pd-draw-line 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* ── ATC bar entrance ── */
  .pd-atc-bar { animation: pd-atc-rise 0.38s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* ── Thumb strip ── */
  .pd-thumbs::-webkit-scrollbar { width: 2px; }
  .pd-thumbs::-webkit-scrollbar-thumb { background: var(--pd-thumb-clr); border-radius: 9999px; }

  /* ── Number chip ── */
  .pd-chip {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  /* ── Premium range input ── */
  input[type=range].pd-range { -webkit-appearance: none; appearance: none; height: 1px; background: var(--ash); outline: none; }
  input[type=range].pd-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--gold); cursor: pointer; }

  /* ── Hover reveal underline ── */
  .pd-link-hover { position: relative; }
  .pd-link-hover::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 0; height: 1px; background: var(--gold); transition: width 0.3s ease; }
  .pd-link-hover:hover::after { width: 100%; }

  /* ── Magnifier lens cursor ── */
  .pd-img-wrap { cursor: crosshair; }

  /* ── Lens circle ── */
  .pd-lens {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
    overflow: hidden;
    z-index: 50;
    border: 1.5px solid rgba(201,169,110,0.55);
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.08);
  }
`;