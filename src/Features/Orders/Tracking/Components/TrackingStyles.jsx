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
`;
