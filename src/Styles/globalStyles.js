// src/Styles/globalStyles.js

// ─── WooSho Design Tokens + Global Styles ────────────────────────────────────
// Refactored to support light/dark modes and reduce harsh gradients
export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500;600&display=swap');

  .ob-root {
    /* Typography */
    --font-d:       'Bricolage Grotesque', sans-serif;
    --font-b:       'DM Sans', sans-serif;
    --font-m:       'JetBrains Mono', monospace;
    
    font-family: var(--font-b);
    min-height: 100vh;
    overflow-x: hidden;
    transition: background 0.3s ease, color 0.3s ease;
  }

  /* ── LIGHT MODE (Default) ── */
  .ob-root {
    --bg:           #F8F9FA;
    --bg-1:         #FFFFFF;
    --bg-2:         #F3F4F6;
    --bg-3:         #F9FAFB;
    --bg-4:         #E5E7EB;
    
    --border:       rgba(0, 0, 0, 0.08);
    --border-2:     rgba(0, 0, 0, 0.12);
    --border-3:     rgba(0, 0, 0, 0.2);
    
    /* Text */
    --text:         #111827;
    --text-2:       #4B5563;
    --text-3:       #6B7280;
    
    /* Semantic */
    --amber:        #EAB308;
    --amber-bg:     rgba(234, 179, 8, 0.1);
    --amber-border: rgba(234, 179, 8, 0.3);
    
    --teal:         #0D9488;
    --teal-bg:      rgba(13, 148, 136, 0.1);
    --teal-border:  rgba(13, 148, 136, 0.3);
    
    --green:        #10B981;
    --green-bg:     rgba(16, 185, 129, 0.1);
    --green-border: rgba(16, 185, 129, 0.3);
    
    --red:          #EF4444;

    background: var(--bg);
    color: var(--text);
  }

  /* ── DARK MODE ── */
  .dark .ob-root {
    --bg:           #0B0E14;
    --bg-1:         #11151E;
    --bg-2:         #181E29;
    --bg-3:         #1F2937;
    --bg-4:         #2B3544;
    
    --border:       rgba(255, 255, 255, 0.08);
    --border-2:     rgba(255, 255, 255, 0.12);
    --border-3:     rgba(255, 255, 255, 0.2);
    
    /* Text */
    --text:         #F3F4F6;
    --text-2:       #9CA3AF;
    --text-3:       #6B7280;
    
    /* Semantic */
    --amber:        #F5A623;
    --amber-bg:     rgba(245, 166, 35, 0.15);
    --amber-border: rgba(245, 166, 35, 0.35);
    
    --teal:         #2DD4BF;
    --teal-bg:      rgba(45, 212, 191, 0.15);
    --teal-border:  rgba(45, 212, 191, 0.35);
  }

  /* ── Form primitives ── */
  .ob-input {
    width: 100%;
    background: var(--bg-1);
    border: 1.5px solid var(--border-2);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--font-b);
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color .18s, box-shadow .18s, background .18s;
    -webkit-appearance: none;
  }
  .ob-input::placeholder { color: var(--text-3); }
  .ob-input:focus {
    border-color: var(--role-accent, var(--amber));
    background: var(--bg-1);
    box-shadow: 0 0 0 3px var(--role-accent-bg, var(--amber-bg));
  }
  .ob-input option { background: var(--bg-1); color: var(--text); }

  .ob-textarea {
    width: 100%;
    background: var(--bg-1);
    border: 1.5px solid var(--border-2);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--font-b);
    font-size: 14px;
    color: var(--text);
    outline: none;
    resize: vertical;
    min-height: 88px;
    line-height: 1.65;
    transition: border-color .18s, box-shadow .18s;
  }
  .ob-textarea::placeholder { color: var(--text-3); }
  .ob-textarea:focus { 
    border-color: var(--role-accent, var(--amber)); 
    box-shadow: 0 0 0 3px var(--role-accent-bg, var(--amber-bg)); 
  }

  .ob-label { display: block; font-size: 12.5px; font-weight: 500; color: var(--text-2); margin-bottom: 6px; font-family: var(--font-b); }
  .ob-label-opt::after { content: ' — optional'; font-weight: 400; color: var(--text-3); font-size: 11px; }
  .ob-error { font-size: 11.5px; color: var(--red); margin-top: 4px; font-weight: 500; }

  /* ── Chips ── */
  .ob-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 13px; border-radius: 99px; font-size: 12.5px; font-weight: 500;
    cursor: pointer; user-select: none; transition: all .15s;
    border: 1.5px solid var(--border-2); background: var(--bg-2); color: var(--text-2);
  }
  .ob-chip:hover { border-color: var(--border-3); color: var(--text); }
  .ob-chip.buyer-selected  { background: var(--teal-bg); border-color: var(--teal-border); color: var(--teal); }
  .ob-chip.seller-selected { background: var(--amber-bg); border-color: var(--amber-border); color: var(--amber); }

  /* ── Toggle cards ── */
  .ob-toggle {
    border: 1.5px solid var(--border-2); border-radius: 12px;
    padding: 14px 16px; cursor: pointer; transition: all .18s; background: var(--bg-1); text-align: left;
    width: 100%;
    color: var(--text);
  }
  .ob-toggle:hover { border-color: var(--border-3); background: var(--bg-2); }
  .ob-toggle.buyer-selected  { border-color: var(--teal-border); background: var(--teal-bg); }
  .ob-toggle.seller-selected { border-color: var(--amber-border); background: var(--amber-bg); }

  /* ── Upload zone ── */
  .ob-drop {
    border: 1.5px dashed var(--border-2); border-radius: 12px; cursor: pointer;
    transition: border-color .2s, background .2s; position: relative; overflow: hidden;
    background: var(--bg-1);
  }
  .ob-drop:hover, .ob-drop.over { border-color: var(--amber); background: var(--amber-bg); }
  .ob-drop.buyer:hover, .ob-drop.buyer.over { border-color: var(--teal); background: var(--teal-bg); }

  /* ── Buttons ── */
  .ob-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border: none; border-radius: 10px; cursor: pointer;
    font-family: var(--font-b); font-size: 13.5px; font-weight: 600;
    transition: filter .15s, transform .1s, opacity .15s; white-space: nowrap;
    background: var(--role-accent, var(--amber)); color: #FFF;
  }
  .ob-btn-primary.buyer  { background: var(--teal); color: #FFF; }
  .ob-btn-primary.seller { background: var(--amber); color: #000; }
  .ob-btn-primary:hover  { filter: brightness(1.12); }
  .ob-btn-primary:active { transform: scale(.97); }
  .ob-btn-primary:disabled { opacity: .45; cursor: not-allowed; transform: none; filter: none; }

  .ob-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; background: transparent; color: var(--text-2);
    border: 1.5px solid var(--border-2); border-radius: 10px;
    font-family: var(--font-b); font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all .15s;
  }
  .ob-btn-ghost:hover { background: var(--bg-2); color: var(--text); border-color: var(--border-3); }

  .ob-btn-skip {
    background: none; border: none; color: var(--text-3);
    font-family: var(--font-b); font-size: 13px; font-weight: 500; cursor: pointer;
    transition: color .15s; padding: 10px 4px;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .ob-btn-skip:hover { color: var(--text-2); }

  /* ── Step cards ── */
  .ob-step-card { 
    border: 1px solid var(--border-2); 
    border-radius: 16px; 
    overflow: hidden; 
    background: var(--bg-1); 
    transition: border-color .25s, box-shadow .25s; 
  }
  .ob-step-card.active.buyer  { border-color: var(--teal-border); box-shadow: 0 4px 12px var(--teal-bg); }
  .ob-step-card.active.seller { border-color: var(--amber-border); box-shadow: 0 4px 12px var(--amber-bg); }
  .ob-step-card.done          { border-color: var(--green-border); }

  /* ── Role selection cards ── */
  .ob-role-card {
    border: 1.5px solid var(--border-2); 
    border-radius: 20px; 
    cursor: pointer;
    background: var(--bg-1); 
    transition: all .22s; 
    position: relative; 
    overflow: hidden;
    padding: 36px 32px 32px;
  }
  .ob-role-card:hover { transform: translateY(-3px); border-color: var(--border-3); box-shadow: 0 8px 24px rgba(0,0,0,0.05); }
  .dark .ob-role-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  
  .ob-role-card.buyer.selected   { border-color: var(--teal); background: var(--teal-bg); }
  .ob-role-card.seller.selected { border-color: var(--amber); background: var(--amber-bg); }
  .ob-role-card.selected { transform: translateY(-5px); }

  /* ── Scrollbar ── */
  .ob-scroll::-webkit-scrollbar { width: 4px; }
  .ob-scroll::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

  /* ── Keyframes ── */
  @keyframes ob-spin   { to { transform: rotate(360deg); } }
  @keyframes ob-pulse  { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes ob-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes ob-check  { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
  @keyframes ob-pop    { 0%{transform:scale(.8);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes ob-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes ob-confetti {
    0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(90px) rotate(540deg); opacity: 0; }
  }

  .ob-spin   { animation: ob-spin .7s linear infinite; }
  .ob-float  { animation: ob-float 3.5s ease-in-out infinite; }
  .ob-pulse-dot { animation: ob-pulse 2s ease-in-out infinite; }

  @media (max-width: 1024px) {
    .ob-page-layout { flex-direction: column !important; }
    .ob-sidebar     { width: 100% !important; position: static !important; }
    .ob-steps-col   { max-width: 100% !important; }
    .ob-role-grid   { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 640px) {
    .ob-role-card   { padding: 28px 24px 24px !important; }
    .ob-role-emoji  { font-size: 40px !important; width: 72px !important; height: 72px !important; }
  }
`;
