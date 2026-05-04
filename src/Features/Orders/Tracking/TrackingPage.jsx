// src/Pages/Tracking/TrackingPage.jsx
//
// ── REDESIGN: "Precision Dispatch" editorial dark theme ──────────────────────
//  Fonts: Bricolage Grotesque (display) + JetBrains Mono (data) + DM Sans (body)
//  Palette: Deep navy #060B14 · Amber #F5A623 · Cyan #00C2FF · Warm white #E8E4DA
//
// ── API contract (unchanged) ──────────────────────────────────────────────────
//  All orders:  GET /api/orders                  → array (loader via useLoaderData)
//  Support:     POST /api/support/tracking       → { message, orderId }
//
// ── Smart logic (unchanged) ──────────────────────────────────────────────────
//  • URL param   ?id=SE-12345  deep-links from email CTAs
//  • sessionStorage persists last-tracked ID across refreshes
//  • Auto-poll every 30 s while in-transit
//  • ETA calculation from status + createdAt
//  • "X minutes ago" live timestamp, re-renders every 60 s
//  • Fuzzy search — partial order ID or product name
//  • Copy-to-clipboard on tracking ID
//  • Recent orders quick-select
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, useNavigation, useLoaderData } from "react-router-dom";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";

// ─── Font injection + global animation keyframes ──────────────────────────────
const FONTS_AND_KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
    --font-d:  'Bricolage Grotesque', sans-serif;
    --font-b:  'DM Sans', sans-serif;
    --font-m:  'JetBrains Mono', monospace;

    font-family: var(--font-b);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
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
`;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  processing: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "Processing",  icon: "◎", pct: 28 },
  shipped:    { color: "#00C2FF", bg: "rgba(0,194,255,0.08)",  label: "In Transit",  icon: "◉", pct: 62 },
  delivered:  { color: "#10B981", bg: "rgba(16,185,129,0.08)", label: "Delivered",   icon: "●", pct: 100 },
  cancelled:  { color: "#EF4444", bg: "rgba(239,68,68,0.08)",  label: "Cancelled",   icon: "✕", pct: 12 },
};

const MILESTONES = [
  { id: "placed",   label: "Placed" },
  { id: "cleared",  label: "Cleared" },
  { id: "packed",   label: "Packed" },
  { id: "shipped",  label: "Shipped" },
  { id: "transit",  label: "Transit" },
  { id: "local",    label: "Local" },
  { id: "delivered",label: "Delivered" },
];

const MILESTONE_IDX = { processing: 2, shipped: 4, delivered: 6, cancelled: 1 };

function statusColor(s) { return STATUS_CFG[s]?.color ?? "#6366F1"; }
function statusPct(s)   { return STATUS_CFG[s]?.pct   ?? 28; }

function computeETA(status, created_at) {
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  const base = created_at ? new Date(created_at) : new Date();
  const fmt = (d) => new Date(base.getTime() + d * 86400000)
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  if (status === "shipped") return `Today – ${fmt(1)}`;
  return `${fmt(2)} – ${fmt(5)}`;
}

function timeAgo(isoStr) {
  if (!isoStr) return "just now";
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ic = {
  Search:  (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  X:       (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Truck:   (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Box:     (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Map:     (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Chat:    (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Copy:    (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Check:   (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>,
  Refresh: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Bag:     (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Phone:   (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l.72-.72a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Arrow:   (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  Signal:  (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 6C4.6 2.4 9.1 0.5 12 0.5s7.4 1.9 11 5.5"/><path d="M5 10C7.3 7.7 9.5 6.5 12 6.5s4.7 1.2 7 3.5"/><path d="M9 14c.9-.9 1.9-1.5 3-1.5s2.1.6 3 1.5"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg>,
};

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "pd-spin 0.65s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity="0.75"/>
    </svg>
  );
}

// ─── Live Ticker ──────────────────────────────────────────────────────────────
function Ticker({ order }) {
  const items = useMemo(() => {
    const base = [
      `ORDER ${(order?.id || "").slice(0, 12).toUpperCase()}`,
      `STATUS: ${(order?.status || "").toUpperCase()}`,
      `ETA: ${computeETA(order?.status, order?.created_at)}`,
      `${order?.order_items?.length ?? 0} ITEM${(order?.order_items?.length ?? 0) !== 1 ? "S" : ""} TRACKED`,
      `VALUE: ${formatMoneyCents(order?.total_cents ?? 0)}`,
      `AUTO-REFRESH ACTIVE · 30s INTERVAL`,
      `24/7 SUPPORT AVAILABLE`,
    ];
    return [...base, ...base];
  }, [order]);

  return (
    <div style={{
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      padding: "10px 0",
      overflow: "hidden",
      background: "rgba(0,0,0,0.25)",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", animation: "pd-ticker 28s linear infinite" }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-m)", fontSize: "10px", fontWeight: 500,
            letterSpacing: "0.12em", color: "var(--text-3)",
            padding: "0 32px", flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--amber)", display: "inline-block", opacity: 0.7 }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Signal / Status Orb ─────────────────────────────────────────────────────
function StatusOrb({ status, size = 140 }) {
  const col = statusColor(status);
  const active = !["delivered", "cancelled"].includes(status);
  const r = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Outer ring orbiting */}
      {active && (
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: `1px dashed ${col}30`,
          animation: "pd-orbit 8s linear infinite",
        }}>
          <div style={{
            position: "absolute", top: -4, left: "50%",
            width: 8, height: 8, borderRadius: "50%",
            background: col, transform: "translateX(-50%)",
            boxShadow: `0 0 10px ${col}`,
          }} />
        </div>
      )}
      {/* Concentric circles */}
      {[0.9, 0.65, 0.42].map((scale, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${(1 - scale) / 2 * 100}%`,
          left: `${(1 - scale) / 2 * 100}%`,
          width: `${scale * 100}%`,
          height: `${scale * 100}%`,
          borderRadius: "50%",
          border: `1px solid ${col}${i === 0 ? "18" : i === 1 ? "25" : "35"}`,
        }} />
      ))}
      {/* Core */}
      <div style={{
        position: "absolute", inset: "35%",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${col}30 0%, ${col}08 100%)`,
        border: `2px solid ${col}60`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "42%", height: "42%", borderRadius: "50%",
          background: col,
          boxShadow: `0 0 20px ${col}80`,
          animation: active ? "pd-pulse 2s ease-in-out infinite" : "none",
        }} />
      </div>
    </div>
  );
}

// ─── Flight Timeline ──────────────────────────────────────────────────────────
function FlightTimeline({ status }) {
  const currentIdx = MILESTONE_IDX[status] ?? 2;
  const col = statusColor(status);

  return (
    <div style={{ padding: "4px 0" }}>
      {/* Progress track */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: 12 }}>
        {/* Background rail */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: "var(--border-2)", borderRadius: 99,
        }} />
        {/* Filled portion */}
        <div style={{
          position: "absolute", left: 0, height: 2, borderRadius: 99,
          background: `linear-gradient(90deg, ${col}, ${col}80)`,
          width: `${Math.min((currentIdx / (MILESTONES.length - 1)) * 100, 100)}%`,
          transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
        {/* Nodes */}
        {MILESTONES.map((step, i) => {
          const done = i <= currentIdx;
          const now = i === currentIdx;
          const pctLeft = `${(i / (MILESTONES.length - 1)) * 100}%`;
          return (
            <div key={step.id} style={{
              position: "absolute",
              left: pctLeft,
              transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: now ? 14 : done ? 10 : 8,
                height: now ? 14 : done ? 10 : 8,
                borderRadius: "50%",
                background: done ? col : "var(--bg-3)",
                border: `2px solid ${done ? col : "var(--border-2)"}`,
                boxShadow: now ? `0 0 12px ${col}80` : "none",
                transition: "all 0.4s",
                zIndex: 1,
                position: "relative",
              }}>
                {now && status !== "cancelled" && (
                  <div style={{
                    position: "absolute", inset: -5,
                    borderRadius: "50%",
                    border: `1px solid ${col}40`,
                    animation: "pd-pulse 1.8s ease-in-out infinite",
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        {MILESTONES.map((step, i) => {
          const done = i <= currentIdx;
          const now = i === currentIdx;
          return (
            <div key={step.id} style={{
              fontFamily: "var(--font-m)", fontSize: "9px", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: now ? col : done ? "var(--text-2)" : "var(--text-3)",
              textAlign: "center", flex: 1,
              transition: "color 0.4s",
            }}>
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Key Stat Block ───────────────────────────────────────────────────────────
function StatBlock({ label, value, accent = false, mono = false }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-m)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{
        fontFamily: mono ? "var(--font-m)" : "var(--font-d)",
        fontSize: mono ? 14 : 16, fontWeight: 700,
        color: accent ? "var(--amber)" : "var(--text)",
        letterSpacing: mono ? "0.04em" : "-0.01em",
      }}>
        {value}
      </div>
    </div>
  );
}

// ─── Copy Badge ───────────────────────────────────────────────────────────────
function CopyBadge({ text }) {
  const [copied, setCopied] = useState(false);
  const doCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      Object.assign(ta.style, { position: "fixed", opacity: "0" });
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button onClick={doCopy} className="pd-btn-ghost" style={{
      padding: "5px 10px",
      color: copied ? "#10B981" : "var(--text-3)",
      borderColor: copied ? "rgba(16,185,129,0.3)" : undefined,
      background: copied ? "rgba(16,185,129,0.08)" : undefined,
    }}>
      {copied
        ? <><Ic.Check style={{ width: 12, height: 12 }} /> Copied</>
        : <><Ic.Copy style={{ width: 12, height: 12 }} /> Copy</>
      }
    </button>
  );
}

// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock({ ts }) {
  const [label, setLabel] = useState(() => timeAgo(ts));
  useEffect(() => {
    setLabel(timeAgo(ts));
    const id = setInterval(() => setLabel(timeAgo(ts)), 60000);
    return () => clearInterval(id);
  }, [ts]);
  return <>{label}</>;
}

// ─── Auto-Poll Hook ───────────────────────────────────────────────────────────
function useAutoPoll(status, cb, ms = 30000) {
  useEffect(() => {
    if (["delivered", "cancelled", null, undefined].includes(status)) return;
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  }, [status, cb, ms]);
}

// ─── Status Sidebar Panel ────────────────────────────────────────────────────
function StatusPanel({ order, updatedAt, onRefresh }) {
  const status = order?.status;
  const cfg = STATUS_CFG[status] || STATUS_CFG.processing;
  const col = cfg.color;

  return (
    <div className="pd-card" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Status badge */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span className="pd-label">Live Status</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: col, animation: status !== "delivered" && status !== "cancelled" ? "pd-pulse 2s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: col, fontWeight: 600, letterSpacing: "0.1em" }}>
              {status !== "delivered" && status !== "cancelled" ? "LIVE" : "FINAL"}
            </span>
          </div>
        </div>
        {/* Orb centred */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <StatusOrb status={status} size={120} />
        </div>
        {/* Status text */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-d)", fontSize: 28, fontWeight: 800,
            color: col, letterSpacing: "-0.02em", lineHeight: 1,
          }}>
            {cfg.label}
          </div>
          <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)", marginTop: 8 }}>
            {computeETA(status, order?.created_at)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-m)", fontSize: 9, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Journey</span>
          <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: col, fontWeight: 700 }}>{statusPct(status)}%</span>
        </div>
        <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, ${col}, ${col}80)`,
            width: `${statusPct(status)}%`,
            animation: "pd-fill 1.4s cubic-bezier(0.16,1,0.3,1) both 0.3s",
            "--w": `${statusPct(status)}%`,
          }} />
        </div>
      </div>

      {/* Key stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
        <StatBlock label="Order ID" value={`#${(order?.id || "—").slice(0, 8).toUpperCase()}`} mono />
        <StatBlock label="Courier" value="WooSho Xpress" />
        <StatBlock label="Items" value={`${order?.order_items?.length ?? 0} item${(order?.order_items?.length ?? 0) !== 1 ? "s" : ""}`} />
        <StatBlock label="Value" value={formatMoneyCents(order?.total_cents ?? 0)} accent />
      </div>

      {/* Refresh / updated */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {updatedAt && (
          <span style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}>
            <Ic.Refresh style={{ width: 11, height: 11 }} />
            <LiveClock ts={updatedAt} />
          </span>
        )}
        <button className="pd-btn-ghost" style={{ padding: "6px 12px", marginLeft: "auto" }} onClick={onRefresh}>
          <Ic.Refresh style={{ width: 12, height: 12 }} />
          Refresh
        </button>
      </div>
    </div>
  );
}

// ─── Item List ────────────────────────────────────────────────────────────────
function ItemList({ items }) {
  if (!items?.length) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-3)" }}>
      <Ic.Box style={{ width: 32, height: 32, margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
      <p style={{ fontSize: 13, fontFamily: "var(--font-b)" }}>No item details available</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <motion.div key={item.id || i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex", gap: 14, alignItems: "center",
            background: "var(--bg-2)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 14px",
          }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8, overflow: "hidden",
            background: "var(--bg-3)", border: "1px solid var(--border)", flexShrink: 0,
          }}>
            {item.product?.image && (
              <img src={item.product.image} alt={item.products?.name || ""}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=—"; }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-b)", fontWeight: 500, fontSize: 13, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.products?.name || "Product"}
            </p>
            <p style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "var(--text-3)", marginTop: 3, letterSpacing: "0.06em" }}>
              QTY: {item.quantity}
            </p>
          </div>
          <p style={{ fontFamily: "var(--font-m)", fontSize: 13, fontWeight: 600, color: "var(--text-2)", flexShrink: 0 }}>
            {formatMoneyCents(item.total_cents)}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Support Form ─────────────────────────────────────────────────────────────
function SupportForm({ orderId }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = useCallback(async () => {
    if (!msg.trim()) { setError("Please enter a message."); return; }
    setLoading(true); setError("");
    try {
      // Replace with: await fetch("/api/support/tracking", { method: "POST", headers: {...}, body: JSON.stringify({ message: msg, orderId }) });
      console.log("Support:", { message: msg, orderId });
      await new Promise((r) => setTimeout(r, 700));
      setSent(true);
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [msg, orderId]);

  if (sent) return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <Ic.Check style={{ width: 20, height: 20, color: "#10B981" }} />
      </div>
      <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>Message Sent</p>
      <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)" }}>We'll reply within 2 hours.</p>
    </motion.div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="pd-textarea"
        placeholder="Describe your issue with this delivery…" />
      {error && <p style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "#EF4444", fontWeight: 500 }}>{error}</p>}
      <button className="pd-btn-primary" onClick={handleSend} disabled={loading || !msg.trim()}
        style={{ justifyContent: "center", width: "100%" }}>
        {loading ? <><Spinner size={14} /> Sending…</> : <><Ic.Chat style={{ width: 14, height: 14 }} /> Send Message</>}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", paddingTop: 4 }}>
        <Ic.Phone style={{ width: 12, height: 12, flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-b)", fontSize: 11 }}>
          Or call: <span style={{ color: "var(--text-2)", fontWeight: 500 }}>1-800-WooSho</span>
        </span>
      </div>
    </div>
  );
}

// ─── Scanning State ───────────────────────────────────────────────────────────
function ScanningState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", gap: 24 }}>
      {/* Animated orb */}
      <div style={{ position: "relative", width: 100, height: 100, animation: "pd-float 3s ease-in-out infinite" }}>
        <StatusOrb status="shipped" size={100} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 6 }}>
          Scanning Network
        </p>
        <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <Spinner size={12} /> Connecting to tracking servers…
        </p>
      </div>
    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFound({ trackedId, onClear }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24, fontSize: 24, animation: "pd-float 4s ease-in-out infinite",
      }}>🔍</div>
      <h2 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
        Order Not Found
      </h2>
      <p style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--text-3)", maxWidth: 300, lineHeight: 1.6, marginBottom: 28 }}>
        No order matching <span style={{ color: "var(--text-2)", fontWeight: 500 }}>"{trackedId}"</span> was found in our system.
      </p>
      <button className="pd-btn-primary" onClick={onClear}>
        <Ic.X style={{ width: 14, height: 14 }} /> Try Again
      </button>
    </motion.div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: "01", icon: "🔍", title: "Enter Your ID", desc: "Paste the order number from your confirmation email, or pick a recent order above." },
    { num: "02", icon: "📡", title: "Live Intelligence", desc: "See your package's exact position, route, and ETA — refreshed every 30 seconds automatically." },
    { num: "03", icon: "📬", title: "Stay Informed", desc: "Know the moment your order is out for delivery or safely in your hands." },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
      <p className="pd-label" style={{ textAlign: "center", marginBottom: 36 }}>How It Works</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {steps.map((s, i) => (
          <motion.div key={s.num}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="pd-card"
            style={{ padding: "24px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 28, animation: `pd-float ${3 + i * 0.5}s ease-in-out infinite`, display: "block" }}>{s.icon}</span>
              <span style={{ fontFamily: "var(--font-m)", fontSize: 10, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.12em" }}>
                {s.num}
              </span>
            </div>
            <h3 style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>{s.title}</h3>
            <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)", lineHeight: 1.65 }}>{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function TrackingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const navigation = useNavigation();
  const ordersLoading = navigation.state === "loading";

  // ── Orders from loader ────────────────────────────────────────────────────
  const ordersData = useLoaderData();
  const orders = useMemo(() => ordersData || [], [ordersData]);

  // ── Search state ──────────────────────────────────────────────────────────
  const initialId = params.get("id") || sessionStorage.getItem("tr-last-id") || "";
  const [inputVal, setInputVal]   = useState(initialId);
  const [trackedId, setTrackedId] = useState(initialId || null);
  const [isSearching, setIsSearching] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const inputRef = useRef(null);

  // ── Derive tracked order ──────────────────────────────────────────────────
  const trackedOrder = useMemo(() => {
    if (!trackedId || !orders.length) return null;
    const q = trackedId.toLowerCase();
    return orders.find((o) =>
      o.id?.toLowerCase().includes(q) ||
      (o.order_items || []).some((i) => i.products?.name?.toLowerCase().includes(q))
    ) ?? null;
  }, [trackedId, orders]);

  // ── Auto-poll ─────────────────────────────────────────────────────────────
  useAutoPoll(trackedOrder?.status, () => setUpdatedAt(new Date().toISOString()));

  // ── Search action ─────────────────────────────────────────────────────────
  const doSearch = useCallback((idOverride) => {
    const id = (idOverride ?? inputVal).trim();
    if (!id) return;
    setIsSearching(true);
    setTrackedId(id);
    sessionStorage.setItem("tr-last-id", id);
    setUpdatedAt(new Date().toISOString());
    setTimeout(() => setIsSearching(false), 800);
  }, [inputVal]);

  const doClear = useCallback(() => {
    setTrackedId(null);
    setInputVal("");
    sessionStorage.removeItem("tr-last-id");
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const notFound = trackedId && !isSearching && !trackedOrder;

  return (
    <div className="pd-root">
      <style>{FONTS_AND_KEYFRAMES}</style>

      {/* ════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(180deg, #080D1C 0%, var(--bg) 100%)",
        borderBottom: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
          backgroundSize: "48px 48px", pointerEvents: "none",
        }} />
        {/* Amber glow */}
        <div style={{
          position: "absolute", top: "-30%", right: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 700, margin: "0 auto", padding: "72px 24px 56px", position: "relative", zIndex: 1 }}>
          {/* Eyebrow */}
          <div className="pd-animate-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: "var(--amber)", opacity: 0.5 }} />
            <span style={{ fontFamily: "var(--font-m)", fontSize: 10, letterSpacing: "0.2em", color: "var(--amber)", fontWeight: 600, textTransform: "uppercase" }}>
              Precision Logistics
            </span>
            <div style={{ height: 1, width: 32, background: "var(--amber)", opacity: 0.5 }} />
          </div>

          {/* Main headline */}
          <h1 className="pd-animate-up pd-hero-title" style={{
            fontFamily: "var(--font-d)", fontSize: "clamp(64px, 10vw, 96px)",
            fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.95,
            color: "var(--text)", textAlign: "center", marginBottom: 8,
            animationDelay: "0.05s",
          }}>
            Track Your
          </h1>
          <h1 className="pd-animate-up pd-hero-title" style={{
            fontFamily: "var(--font-d)", fontSize: "clamp(64px, 10vw, 96px)",
            fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.95,
            color: "var(--amber)", textAlign: "center", marginBottom: 36,
            animationDelay: "0.12s",
          }}>
            Delivery
            <span style={{ animation: "pd-blink 1.1s step-end infinite", color: "var(--text-3)" }}>_</span>
          </h1>

          {/* Search bar */}
          <div className="pd-animate-up" style={{ animationDelay: "0.2s" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div className="pd-input-wrap" style={{ flex: 1, position: "relative" }}>
                <Ic.Search style={{ width: 16, height: 16, position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  placeholder="Paste order ID — e.g. SE-20481234"
                />
                {inputVal && (
                  <button onClick={doClear} style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 4,
                    display: "flex", alignItems: "center", transition: "color 0.15s",
                  }}>
                    <Ic.X style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
              <button className="pd-btn-primary" onClick={() => doSearch()} disabled={!inputVal.trim() || isSearching}>
                {isSearching ? <Spinner size={14} /> : <Ic.Search style={{ width: 14, height: 14 }} />}
                <span>{isSearching ? "Scanning…" : "Track"}</span>
              </button>
            </div>

            {/* Recent order pills */}
            {!ordersLoading && orders.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <p className="pd-label" style={{ marginBottom: 10 }}>Recent Orders</p>
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }} className="pd-scroll">
                  {orders.slice(0, 8).map((o) => (
                    <button key={o.id}
                      onClick={() => { setInputVal(o.id); doSearch(o.id); }}
                      style={{
                        flexShrink: 0, padding: "7px 14px", borderRadius: 99,
                        fontFamily: "var(--font-m)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                        cursor: "pointer", transition: "all 0.15s",
                        background: trackedId === o.id ? "rgba(245,166,35,0.12)" : "var(--bg-2)",
                        color: trackedId === o.id ? "var(--amber)" : "var(--text-3)",
                        border: `1px solid ${trackedId === o.id ? "rgba(245,166,35,0.3)" : "var(--border-2)"}`,
                      }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Live ticker when order loaded */}
        {trackedOrder && <Ticker order={trackedOrder} />}
      </div>

      {/* ════════════════════════════════════════════════════════
          SCANNING STATE
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScanningState />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          NOT FOUND
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {notFound && !isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NotFound trackedId={trackedId} onClear={doClear} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          TRACKING RESULT
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {trackedOrder && !isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 64px" }}>

              {/* ── Top bar: ID + controls ── */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <span className="pd-label" style={{ display: "block", marginBottom: 4 }}>Tracking ID</span>
                    <span style={{ fontFamily: "var(--font-m)", fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "0.04em" }}>
                      #{trackedOrder.id.toUpperCase()}
                    </span>
                  </div>
                  <CopyBadge text={trackedOrder.id} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="pd-btn-ghost" onClick={() => setUpdatedAt(new Date().toISOString())}>
                    <Ic.Refresh style={{ width: 12, height: 12 }} /> Refresh
                  </button>
                  <button className="pd-btn-ghost" onClick={() => navigate("/orders")}>
                    <Ic.Bag style={{ width: 12, height: 12 }} /> My Orders
                  </button>
                  <button className="pd-btn-ghost" onClick={doClear}>
                    <Ic.X style={{ width: 12, height: 12 }} /> Clear
                  </button>
                </div>
              </motion.div>

              {/* ── Main grid ── */}
              <div className="pd-result-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

                {/* LEFT: Status sidebar */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                  <StatusPanel
                    order={trackedOrder}
                    updatedAt={updatedAt}
                    onRefresh={() => setUpdatedAt(new Date().toISOString())}
                  />
                </motion.div>

                {/* RIGHT: Detail scroll */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* ── Flight Timeline ── */}
                  <motion.div className="pd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                      <Ic.Truck style={{ width: 15, height: 15, color: "var(--amber)", flexShrink: 0 }} />
                      <span className="pd-label">Delivery Milestones</span>
                    </div>
                    <FlightTimeline status={trackedOrder.status} />

                    {/* Sub-detail row */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                      gap: 16, marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)",
                    }}>
                      {[
                        ["Status", (trackedOrder.status || "").charAt(0).toUpperCase() + (trackedOrder.status || "").slice(1), statusColor(trackedOrder.status)],
                        ["ETA", computeETA(trackedOrder.status, trackedOrder.created_at), null],
                        ["Ordered", new Date(trackedOrder.created_at || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), null],
                        ["Courier", "WooSho Express", null],
                      ].map(([k, v, accent]) => (
                        <div key={k}>
                          <p className="pd-label" style={{ marginBottom: 5 }}>{k}</p>
                          <p style={{ fontFamily: "var(--font-b)", fontWeight: 500, fontSize: 14, color: accent || "var(--text)" }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* ── Items + Delivery Address in 2-col ── */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                    {/* Items */}
                    <motion.div className="pd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      style={{ padding: "22px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Ic.Box style={{ width: 14, height: 14, color: "var(--cyan)", flexShrink: 0 }} />
                          <span className="pd-label">Items ({trackedOrder.order_items?.length ?? 0})</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-m)", fontWeight: 700, fontSize: 13, color: "var(--amber)" }}>
                          {formatMoneyCents(trackedOrder.total_cents ?? 0)}
                        </span>
                      </div>
                      <ItemList items={trackedOrder.order_items} />
                    </motion.div>

                    {/* Delivery address + CTAs */}
                    <motion.div className="pd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                      style={{ padding: "22px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                          <Ic.Map style={{ width: 14, height: 14, color: "#10B981", flexShrink: 0 }} />
                          <span className="pd-label">Delivery Address</span>
                        </div>
                        {trackedOrder.shipping ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <p style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                              {trackedOrder.shipping.name}
                            </p>
                            {["address", "city", "country"].map((k) => trackedOrder.shipping[k] && (
                              <p key={k} style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)" }}>
                                {k === "city"
                                  ? `${trackedOrder.shipping.city}${trackedOrder.shipping.state ? `, ${trackedOrder.shipping.state}` : ""} ${trackedOrder.shipping.zip || ""}`
                                  : trackedOrder.shipping[k]}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)" }}>Address not on record</p>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                        {[
                          { label: "All Orders", icon: <Ic.Bag style={{ width: 13, height: 13 }} />, path: "/orders" },
                          { label: "Keep Shopping", icon: <Ic.Arrow style={{ width: 13, height: 13 }} />, path: "/products", primary: true },
                        ].map((b) => (
                          <button key={b.label}
                            className={b.primary ? "pd-btn-primary" : "pd-btn-ghost"}
                            onClick={() => navigate(b.path)}
                            style={b.primary ? { justifyContent: "center", width: "100%" } : { justifyContent: "flex-start", width: "100%" }}>
                            {b.icon} {b.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* ── Support ── */}
                  <motion.div className="pd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ padding: "22px 24px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                          <Ic.Chat style={{ width: 14, height: 14, color: "var(--cyan)", flexShrink: 0 }} />
                          <span className="pd-label">Contact Support</span>
                        </div>
                        <p style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-3)" }}>
                          Issue with this delivery? We respond in under 2 hours, 24/7.
                        </p>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: 99, padding: "5px 12px",
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pd-pulse 2s ease-in-out infinite" }} />
                        <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "#10B981", fontWeight: 600, letterSpacing: "0.1em" }}>ONLINE</span>
                      </div>
                    </div>
                    <SupportForm orderId={trackedOrder.id} />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          EMPTY STATE — How it Works
      ════════════════════════════════════════════════════════ */}
      {!trackedOrder && !isSearching && <HowItWorks />}

      {/* ── Footer divider ── */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Ic.Signal style={{ width: 14, height: 14, color: "var(--text-3)" }} />
        <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          WooSho Precision Logistics · Real-time tracking powered by AI
        </span>
      </div>
    </div>
  );
}