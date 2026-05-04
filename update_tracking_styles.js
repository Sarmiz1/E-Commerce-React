const fs = require('fs');
const path = require('path');

const content = \`
export const FONTS_AND_KEYFRAMES = \\\`
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pd-root {
    --amber:   #E08E00;
    --amber-d: #B57100;
    --amber-l: #F5A623;
    --cyan:    #0098CC;
    --cyan-d:  #007BA6;
    --bg:      #F8FAFC;
    --bg-1:    #FFFFFF;
    --bg-2:    #F1F5F9;
    --bg-3:    #E2E8F0;
    --text:    #0F172A;
    --text-2:  #334155;
    --text-3:  #64748B;
    --border:  rgba(0,0,0,0.08);
    --border-2:rgba(0,0,0,0.12);
    --border-3:rgba(0,0,0,0.18);
    --font-d:  'Bricolage Grotesque', sans-serif;
    --font-b:  'DM Sans', sans-serif;
    --font-m:  'JetBrains Mono', monospace;

    font-family: var(--font-b);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .dark .pd-root, @media (prefers-color-scheme: dark) {
    .pd-root {
      --amber:   #F5A623;
      --amber-d: #C47E0A;
      --amber-l: #FFC85C;
      --cyan:    #00C2FF;
      --cyan-d:  #0098CC;
      --bg:      #060B14;
      --bg-1:    #0D1421;
      --bg-2:    #111B2E;
      --bg-3:    #18243A;
      --text:    #E8E4DA;
      --text-2:  #9CA3AF;
      --text-3:  #4B5563;
      --border:  rgba(255,255,255,0.06);
      --border-2:rgba(255,255,255,0.10);
      --border-3:rgba(255,255,255,0.16);
    }
  }

  @keyframes pd-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes pd-orbit {
    to { transform: rotate(360deg); }
  }
  @keyframes pd-scan {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes pd-ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes pd-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes pd-fill {
    from { width: 0; }
    to   { width: var(--w, 0%); }
  }
  @keyframes pd-slide-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pd-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes pd-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pd-heartbeat {
    0%   { transform: scaleX(0); opacity: 0; }
    10%  { opacity: 1; }
    100% { transform: scaleX(1); opacity: 0.6; }
  }
  @keyframes pd-count {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pd-animate-up {
    animation: pd-slide-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .pd-input-wrap input {
    width: 100%;
    background: var(--bg-2);
    border: 1px solid var(--border-2);
    border-radius: 12px;
    padding: 14px 16px 14px 48px;
    font-size: 15px;
    font-family: var(--font-m);
    font-weight: 500;
    color: var(--text);
    outline: none;
    letter-spacing: 0.02em;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .pd-input-wrap input::placeholder {
    font-family: var(--font-b);
    font-weight: 300;
    letter-spacing: 0;
    color: var(--text-3);
    font-size: 14px;
  }
  .pd-input-wrap input:focus {
    border-color: var(--amber);
    background: var(--bg-3);
    box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
  }

  .pd-btn-primary {
    background: var(--amber);
    color: #0D0800;
    border: none;
    border-radius: 10px;
    padding: 14px 24px;
    font-family: var(--font-b);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  .pd-btn-primary:hover { background: var(--amber-l); }
  .pd-btn-primary:active { transform: scale(0.97); }
  .pd-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .pd-btn-ghost {
    background: var(--bg-2);
    color: var(--text-2);
    border: 1px solid var(--border-2);
    border-radius: 8px;
    padding: 8px 14px;
    font-family: var(--font-b);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .pd-btn-ghost:hover { background: var(--bg-3); color: var(--text); border-color: var(--border-3); }

  .pd-card {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .pd-label {
    font-family: var(--font-m);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .pd-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .pd-scroll::-webkit-scrollbar-track { background: transparent; }
  .pd-scroll::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 99px; }

  .pd-pill-active {
    background: rgba(245,166,35,0.12) !important;
    color: var(--amber) !important;
    border-color: rgba(245,166,35,0.3) !important;
  }

  .pd-textarea {
    width: 100%;
    background: var(--bg-2);
    border: 1px solid var(--border-2);
    border-radius: 12px;
    padding: 12px 14px;
    font-family: var(--font-b);
    font-size: 13px;
    color: var(--text);
    outline: none;
    resize: none;
    transition: border-color 0.2s;
    line-height: 1.6;
  }
  .pd-textarea::placeholder { color: var(--text-3); }
  .pd-textarea:focus { border-color: rgba(245,166,35,0.4); }

  @media (max-width: 900px) {
    .pd-result-grid { grid-template-columns: 1fr !important; }
    .pd-hero-title  { font-size: clamp(52px, 12vw, 96px) !important; }
    .pd-steps-row   { flex-direction: column !important; }
  }
\\\`;
\`;

fs.writeFileSync('src/Features/Orders/Tracking/Components/TrackingStyles.jsx', content);
