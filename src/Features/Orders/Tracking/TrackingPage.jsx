// src/Pages/Tracking/TrackingPage.jsx
//
// ── API contract ──────────────────────────────────────────────────────────────
//  All orders:  GET /api/orders                  → array (used for quick-select + search)
//  Support:     POST /api/support/tracking       → { message, orderId }
//
// ── Smart logic ───────────────────────────────────────────────────────────────
//  • URL param   ?id=SE-12345  deep-links directly from email CTAs
//  • sessionStorage persists last-tracked ID across page refreshes
//  • Auto-poll every 30 s while order is in-transit (processing / shipped)
//  • ETA calculation from status + createdAt date
//  • "X minutes ago" live timestamp, re-renders every 60 s
//  • Fuzzy search — matches partial order ID or any product name in the order
//  • Copy-to-clipboard on tracking ID badge
//  • Recent orders quick-select pill row
//
// ── Animation system — tr-* prefix, techniques used nowhere else ──────────────
//  • Radar sweep    — conic-gradient + CSS rotation
//  • SVG route draw — stroke-dashoffset animation via GSAP + travelling dot
//  • Clip-path reveal — polygon wipe per row (GSAP on scroll)
//  • Holographic tilt — mousemove perspective 3-D card
//  • Glitch headline  — CSS pseudo-element offset on hover
//  • Scanning beam    — top→bottom translate loop (absolute overlay)
//  • Pulse rings      — staggered scale-out opacity
//  • Milestone grow   — vertical line height 0→100% (GSAP)
//  • Ticker           — CSS translateX loop
//  • Progress fill    — CSS var --fill-pct + animation
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, useNavigation, useLoaderData } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";

gsap.registerPlugin(ScrollTrigger);

// ─── Page-scoped keyframes (tr- prefix) ──────────────────────────────────────
const TR_STYLES = `
  @keyframes tr-radar{to{transform:rotate(360deg)}}
  .tr-radar{animation:tr-radar 3s linear infinite}

  @keyframes tr-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
  .tr-ring-1{animation:tr-ring 2s ease-out infinite}
  .tr-ring-2{animation:tr-ring 2s ease-out .55s infinite}
  .tr-ring-3{animation:tr-ring 2s ease-out 1.1s infinite}

  @keyframes tr-scan{0%{top:-4%}100%{top:105%}}
  .tr-scan{animation:tr-scan 2.6s ease-in-out infinite alternate}

  @keyframes tr-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .tr-ticker{animation:tr-ticker 22s linear infinite}

  @keyframes tr-spin{to{transform:rotate(360deg)}}
  .tr-spin{animation:tr-spin .7s linear infinite}

  @keyframes tr-fill{from{width:0}to{width:var(--fill-w,0%)}}
  .tr-fill{animation:tr-fill 1.4s cubic-bezier(.4,0,.2,1) forwards .3s}

  @keyframes tr-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .tr-float{animation:tr-float 4s ease-in-out infinite}

  .tr-holo{transform-style:preserve-3d;transition:transform .08s ease,box-shadow .08s ease}
  .tr-holo::after{
    content:'';position:absolute;inset:0;border-radius:inherit;
    background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.07) 50%,transparent 60%);
    opacity:0;transition:opacity .2s;pointer-events:none
  }
  .tr-holo:hover::after{opacity:1}

  .tr-glitch-wrap{position:relative;display:inline-block}
  @keyframes tr-ga{0%,100%{clip-path:inset(0 0 95% 0);transform:translate(-2px,0)}50%{clip-path:inset(25% 0 55% 0);transform:translate(2px,0)}}
  @keyframes tr-gb{0%,100%{clip-path:inset(65% 0 15% 0);transform:translate(2px,0)}50%{clip-path:inset(85% 0 0% 0);transform:translate(-2px,0)}}
  .tr-glitch-wrap::before,.tr-glitch-wrap::after{content:attr(data-text);position:absolute;inset:0;font:inherit;pointer-events:none}
  .tr-glitch-wrap::before{color:#60a5fa;animation:tr-ga .5s step-end infinite}
  .tr-glitch-wrap::after{color:#a78bfa;animation:tr-gb .5s step-end infinite}
  .tr-glitch-wrap:not(:hover)::before,.tr-glitch-wrap:not(:hover)::after{display:none}

  .tr-input{
    width:100%;background:rgba(255,255,255,.06);border:2px solid transparent;
    border-radius:16px;padding:14px 18px;font-size:15px;font-weight:700;
    color:#fff;outline:none;letter-spacing:.04em;
    transition:border-color .2s,background .2s
  }
  .tr-input::placeholder{color:rgba(255,255,255,.28);font-weight:400;letter-spacing:0}
  .tr-input:focus{border-color:rgba(99,102,241,.75);background:rgba(255,255,255,.1)}

  .tr-card-light{
    background:#fff;border:2px solid #e5e7eb;border-radius:16px;
    padding:12px 16px;font-size:14px;font-weight:500;color:#111827;
    width:100%;outline:none;transition:border-color .2s,box-shadow .2s
  }
  .tr-card-light:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}

  .tr-scroll::-webkit-scrollbar{height:4px}
  .tr-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:99px}
`;

// ─── Milestone steps per status ───────────────────────────────────────────────
const STEPS = {
  processing: [
    { label: "Order Placed", sub: "Confirmed", done: true, now: false },
    { label: "Payment Cleared", sub: "Verified", done: true, now: false },
    { label: "Processing", sub: "Being prepared now", done: false, now: true },
    { label: "Dispatched", sub: "Handover to courier", done: false, now: false },
    { label: "In Transit", sub: "On its way", done: false, now: false },
    { label: "Out for Delivery", sub: "With your local courier", done: false, now: false },
    { label: "Delivered", sub: "Package received", done: false, now: false },
  ],
  shipped: [
    { label: "Order Placed", sub: "Confirmed", done: true, now: false },
    { label: "Payment Cleared", sub: "Verified", done: true, now: false },
    { label: "Processed", sub: "Completed", done: true, now: false },
    { label: "Dispatched", sub: "Left our warehouse", done: true, now: false },
    { label: "In Transit", sub: "Moving to you", done: false, now: true },
    { label: "Out for Delivery", sub: "Expected today", done: false, now: false },
    { label: "Delivered", sub: "Almost there!", done: false, now: false },
  ],
  delivered: [
    { label: "Order Placed", sub: "Completed", done: true, now: false },
    { label: "Payment Cleared", sub: "Completed", done: true, now: false },
    { label: "Processed", sub: "Completed", done: true, now: false },
    { label: "Dispatched", sub: "Completed", done: true, now: false },
    { label: "In Transit", sub: "Completed", done: true, now: false },
    { label: "Out for Delivery", sub: "Completed", done: true, now: false },
    { label: "Delivered ✓", sub: "Package received", done: true, now: true },
  ],
  cancelled: [
    { label: "Order Placed", sub: "Was placed", done: true, now: false },
    { label: "Cancelled", sub: "Order cancelled", done: true, now: true },
  ],
};

/** Map status → accent colour */
function statusColor(status) {
  return { processing: "#f59e0b", shipped: "#3b82f6", delivered: "#10b981", cancelled: "#ef4444" }[status] ?? "#6366f1";
}

/** How far along the journey (0–100) */
function statusPct(status) {
  return { processing: 28, shipped: 62, delivered: 100, cancelled: 12 }[status] ?? 28;
}

/** Human-readable ETA */
function computeETA(status, createdAt) {
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  const base = createdAt ? new Date(createdAt) : new Date();
  const fmt = (d) => new Date(base.getTime() + d * 86400000)
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  if (status === "shipped") return `Today – ${fmt(1)}`;
  return `${fmt(2)} – ${fmt(5)}`;
}

/** "2m ago / 3h ago / 1d ago" */
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

// ─── SVG icon helpers ─────────────────────────────────────────────────────────
const Ic = {
  Search: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  Close: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  Truck: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  Box: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  Map: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
  Chat: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  Copy: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
  Check: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>,
  Refresh: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>,
  Bag: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>,
  Phone: (p) => <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l.72-.72a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
};

function Spinner({ cls = "w-5 h-5" }) {
  return (
    <svg className={`${cls} tr-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── Radar widget ─────────────────────────────────────────────────────────────
/** Conic sweep + concentric rings + pulsing centre dot */
function RadarWidget({ status }) {
  const col = statusColor(status);
  const active = !["delivered", "cancelled"].includes(status);
  return (
    <div className="relative w-40 h-40 mx-auto select-none" aria-hidden>
      {/* Rings */}
      {[100, 66, 33].map((s, i) => (
        <div key={i} className="absolute inset-0 rounded-full border border-white/10"
          style={{ transform: `scale(${s / 100})`, margin: `${(100 - s) / 2}%` }} />
      ))}
      {/* Sweep */}
      {active && (
        <div className="absolute inset-0 rounded-full overflow-hidden tr-radar">
          <div className="w-full h-full rounded-full"
            style={{ background: `conic-gradient(from 0deg,transparent 60%,${col}50 100%)` }} />
        </div>
      )}
      {/* Cross-hair */}
      <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-white/8" /></div>
      <div className="absolute inset-0 flex justify-center"><div className="h-full w-px bg-white/8" /></div>
      {/* Centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        {active && <>
          <div className="absolute w-7 h-7 rounded-full border-2 tr-ring-1" style={{ borderColor: col }} />
          <div className="absolute w-7 h-7 rounded-full border-2 tr-ring-2" style={{ borderColor: col }} />
          <div className="absolute w-7 h-7 rounded-full border-2 tr-ring-3" style={{ borderColor: col }} />
        </>}
        <div className="w-5 h-5 rounded-full shadow-xl flex items-center justify-center"
          style={{ background: col, boxShadow: `0 0 18px ${col}` }}>
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}

// ─── SVG route map ────────────────────────────────────────────────────────────
/** Package journey drawn as SVG path with travelling dot */
function RouteMap({ status }) {
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const PATH = "M 35 155 C 35 80 110 40 195 60 C 280 80 320 38 405 75 C 490 112 510 152 565 138";
  const LEN = 680;
  const col = statusColor(status);
  const pct = statusPct(status);

  const NODES = [
    { cx: 35, cy: 155, label: "Warehouse", done: true },
    { cx: 195, cy: 60, label: "Hub A", done: pct > 25 },
    { cx: 405, cy: 75, label: "Hub B", done: pct > 58 },
    { cx: 565, cy: 138, label: "You", done: status === "delivered" },
  ];

  /* Draw path via GSAP */
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    p.style.strokeDasharray = LEN;
    p.style.strokeDashoffset = LEN;
    const t = setTimeout(() => {
      gsap.to(p, { strokeDashoffset: 0, duration: 1.8, ease: "power2.out" });
    }, 200);
    return () => { clearTimeout(t); gsap.killTweensOf(p); };
  }, [status]);

  /* Move travelling dot */
  useEffect(() => {
    const p = pathRef.current;
    const d = dotRef.current;
    if (!p || !d) return;
    const t = setTimeout(() => {
      try {
        const len = p.getTotalLength();
        const pt = p.getPointAtLength(len * pct / 100);
        gsap.to(d, { attr: { cx: pt.x, cy: pt.y }, duration: 1.4, ease: "power3.out" });
      } catch { /* SVG not mounted */ }
    }, 600);
    return () => clearTimeout(t);
  }, [pct, status]);

  return (
    <svg viewBox="0 0 600 200" className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <filter id="tr-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="tr-dot-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Dimmed ghost */}
      <path d={PATH} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3" strokeLinecap="round" />
      {/* Drawn animated path */}
      <path ref={pathRef} d={PATH} fill="none" stroke={col} strokeWidth="3"
        strokeLinecap="round" filter="url(#tr-path-glow)"
        style={{ strokeDasharray: LEN, strokeDashoffset: LEN }} />

      {/* Nodes */}
      {NODES.map((n) => (
        <g key={n.label}>
          <circle cx={n.cx} cy={n.cy} r="10"
            fill={n.done ? col : "rgba(255,255,255,.07)"}
            stroke={n.done ? col : "rgba(255,255,255,.15)"}
            strokeWidth="2" filter={n.done ? "url(#tr-path-glow)" : undefined} />
          <circle cx={n.cx} cy={n.cy} r="4.5" fill="white" opacity={n.done ? 1 : 0.25} />
          <text x={n.cx} y={n.cy + 21} textAnchor="middle"
            fill="rgba(255,255,255,.4)" fontSize="8.5" fontWeight="700" fontFamily="system-ui">
            {n.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Travelling dot */}
      <circle ref={dotRef} cx={35} cy={155} r="7" fill="white"
        filter="url(#tr-dot-glow)" style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
    </svg>
  );
}

// ─── Holographic card ────────────────────────────────────────────────────────
/** 3-D tilt tracks the mouse cursor */
function HoloCard({ order }) {
  const ref = useRef(null);

  useEffect(() => {
    const card = ref.current;
    if (!card || window.matchMedia("(pointer:coarse)").matches) return;
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(560px) rotateX(${-dy * 9}deg) rotateY(${dx * 9}deg) scale(1.03)`;
      card.style.boxShadow = `${-dx * 12}px ${-dy * 12}px 38px rgba(99,102,241,.22)`;
    };
    const onLeave = () => {
      card.style.transform = "perspective(560px) rotateX(0) rotateY(0) scale(1)";
      card.style.boxShadow = "";
    };
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => { card.removeEventListener("mousemove", onMove); card.removeEventListener("mouseleave", onLeave); };
  }, []);

  const grad = {
    processing: "from-amber-500 to-orange-600",
    shipped: "from-blue-500 to-indigo-600",
    delivered: "from-emerald-500 to-teal-600",
    cancelled: "from-red-500 to-rose-600",
  }[order?.status] ?? "from-indigo-500 to-blue-600";

  return (
    <div ref={ref} className={`tr-holo relative bg-gradient-to-br ${grad} rounded-3xl p-7 overflow-hidden shadow-2xl`}>
      {/* Texture grain */}
      <div className="absolute inset-0 opacity-[0.04] rounded-3xl pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      {/* Scanning beam */}
      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/25 to-transparent tr-scan pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/55 text-[9px] font-black uppercase tracking-[0.3em] mb-0.5">Tracking ID</p>
            <p className="text-white font-black text-lg font-mono tracking-wide">
              #{(order?.id || "—").slice(0, 16).toUpperCase()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Ic.Box className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/55 mb-2 font-semibold">
            <span>Journey Progress</span><span>{statusPct(order?.status)}%</span>
          </div>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full tr-fill"
              style={{ "--fill-w": `${statusPct(order?.status)}%`, width: 0 }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["Status", (order?.status || "—").charAt(0).toUpperCase() + (order?.status || "").slice(1)],
            ["ETA", computeETA(order?.status, order?.createdAt)],
            ["Items", `${order?.items?.length ?? 0} item${(order?.items?.length ?? 0) !== 1 ? "s" : ""}`],
            ["Value", formatMoneyCents(order?.total ?? 0)],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-white/45 text-[9px] uppercase tracking-widest mb-0.5">{k}</p>
              <p className="text-white font-black text-sm">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Milestone stepper ────────────────────────────────────────────────────────
/** Vertical steps; line grows via GSAP, nodes stagger in from left */
function MilestoneSteps({ status }) {
  const steps = STEPS[status] || STEPS.processing;
  const col = statusColor(status);
  const lineRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const line = lineRef.current;
    const nodes = listRef.current?.querySelectorAll(".tr-step-node");
    if (!line || !nodes?.length) return;
    gsap.set(line, { height: "0%" });
    const t = setTimeout(() => {
      gsap.to(line, { height: "100%", duration: 1.5, ease: "power2.out" });
      gsap.fromTo(Array.from(nodes),
        { x: -26, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.11, duration: 0.6, ease: "power3.out", clearProps: "all" }
      );
    }, 250);
    return () => { clearTimeout(t); gsap.killTweensOf([line, ...Array.from(nodes)]); };
  }, [status]);

  return (
    <div ref={listRef} className="relative pl-10">
      {/* Connector */}
      <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-white/8 overflow-hidden">
        <div ref={lineRef} className="w-full rounded-full"
          style={{ height: "0%", background: `linear-gradient(to bottom,${col},${col}55)` }} />
      </div>

      {steps.map((step, i) => (
        <div key={step.label}
          className={`tr-step-node relative flex items-start gap-4 ${i < steps.length - 1 ? "mb-7" : ""}`}>
          {/* Node circle */}
          <div className="absolute -left-10">
            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 ${step.now ? "border-transparent text-white shadow-lg"
              : step.done ? "border-transparent text-white"
                : "border-white/15 bg-transparent text-white/25"
              }`}
              style={step.now || step.done
                ? { background: col, boxShadow: step.now ? `0 0 18px ${col}55` : undefined }
                : {}}>
              {step.done && !step.now ? <Ic.Check className="w-4 h-4" /> : i + 1}
            </div>
          </div>
          {/* Text */}
          <div className={step.now ? "opacity-100" : step.done ? "opacity-60" : "opacity-25"}>
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-black text-sm ${step.now || step.done ? "text-white" : "text-white/40"}`}>
                {step.label}
              </p>
              {step.now && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                  style={{ background: `${col}20`, color: col, border: `1px solid ${col}45` }}>
                  Now
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${step.now ? "text-white/50" : "text-white/30"}`}>{step.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Live ticker ──────────────────────────────────────────────────────────────
function Ticker({ order }) {
  const msgs = useMemo(() => {
    const base = [
      `Tracking #${(order?.id || "").slice(0, 10)} · Status: ${order?.status}`,
      `ETA: ${computeETA(order?.status, order?.createdAt)}`,
      `${order?.items?.length ?? 0} item${(order?.items?.length ?? 0) !== 1 ? "s" : ""} in this shipment`,
      `Order value: ${formatMoneyCents(order?.total ?? 0)}`,
      "Refreshes automatically every 30 seconds",
      "Free 30-day returns · 24/7 support available",
    ];
    return [...base, ...base];
  }, [order]);

  return (
    <div className="overflow-hidden bg-white/5 border-y border-white/8 py-2.5 flex-shrink-0">
      <div className="flex whitespace-nowrap tr-ticker">
        {msgs.map((m, i) => (
          <span key={i} className="text-white/40 text-xs font-semibold px-10 flex-shrink-0 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-400/60 inline-block" />{m}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Item rows with clip-path reveal ─────────────────────────────────────────
function ItemList({ items }) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !items?.length) return;
    const rows = el.querySelectorAll(".tr-item-row");
    const t = setTimeout(() => {
      gsap.fromTo(Array.from(rows),
        { clipPath: "polygon(0 0,0 0,0 100%,0 100%)", opacity: 1 },
        {
          clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)", stagger: 0.08,
          duration: 0.6, ease: "power3.out", clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    }, 120);
    return () => clearTimeout(t);
  }, [items]);

  if (!items?.length) return (
    <div className="text-center py-10 text-white/25">
      <Ic.Box className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">No item details available</p>
    </div>
  );

  return (
    <div ref={listRef} className="space-y-3">
      {items.map((item, i) => (
        <div key={item.id || i}
          className="tr-item-row flex gap-4 bg-white/5 border border-white/8 rounded-2xl p-4 hover:bg-white/10 transition-colors group">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/8 border border-white/10">
            {item.product?.image && (
              <img src={item.product.image} alt={item.product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm line-clamp-1">{item.product?.name || "Product"}</p>
            <p className="text-white/35 text-xs mt-0.5">Qty: {item.quantity}</p>
          </div>
          <p className="font-black text-white/75 text-sm flex-shrink-0 pt-0.5">
            {formatMoneyCents((item.product?.priceCents || 0) * item.quantity)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Support form ─────────────────────────────────────────────────────────────
function SupportForm({ orderId }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  /** POST message to support endpoint */
  const handleSend = useCallback(async () => {
    if (!msg.trim()) { setError("Enter a message first."); return; }
    setLoading(true); setError("");
    try {
      await postData("/api/support/tracking", { message: msg, orderId });
      setSent(true);
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [msg, orderId]);

  if (sent) return (
    <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
      <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
      <p className="font-black text-white text-base">Message sent!</p>
      <p className="text-white/40 text-sm mt-1">We'll reply within 2 hours.</p>
    </motion.div>
  );

  return (
    <div className="space-y-3">
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4}
        placeholder="Describe your issue or question about this delivery…"
        className="tr-card-light resize-none text-sm w-full" />
      {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={handleSend} disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-55">
        {loading ? <><Spinner cls="w-4 h-4" /> Sending…</> : <><Ic.Chat className="w-4 h-4" /> Send Message</>}
      </motion.button>
    </div>
  );
}

// ─── Copy-to-clipboard badge ──────────────────────────────────────────────────
function CopyBadge({ text }) {
  const [copied, setCopied] = useState(false);
  const doCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      Object.assign(ta.style, { position: "fixed", opacity: "0" });
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [text]);

  return (
    <button onClick={doCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${copied ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
        : "bg-white/8 border-white/15 text-white/45 hover:text-white hover:border-white/30"
        }`}>
      {copied ? <><Ic.Check className="w-3 h-3" />Copied</> : <><Ic.Copy className="w-3 h-3" />Copy ID</>}
    </button>
  );
}

// ─── Last-updated clock ───────────────────────────────────────────────────────
function LiveClock({ ts }) {
  const [label, setLabel] = useState(() => timeAgo(ts));
  useEffect(() => {
    setLabel(timeAgo(ts));
    const id = setInterval(() => setLabel(timeAgo(ts)), 60000);
    return () => clearInterval(id);
  }, [ts]);
  return <>{label}</>;
}

// ─── Auto-poll hook ───────────────────────────────────────────────────────────
/** Calls `cb` every `ms` only while order is in-transit */
function useAutoPoll(status, cb, ms = 30000) {
  useEffect(() => {
    if (["delivered", "cancelled", null, undefined].includes(status)) return;
    const id = setInterval(cb, ms);
    return () => clearInterval(id);
  }, [status, cb, ms]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function TrackingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const navigation = useNavigation();

  // navigation.state === "loading"  →  when loader or action is running
  const ordersLoading = navigation.state === "loading";

  // ── Fetch all orders (quick-select + search source) ───────────────────────
  // ── Fetch all orders from API ──────────────────────────────────────────────
  const ordersData = useLoaderData();
  const orders = useMemo(() => ordersData || [], [ordersData]);

  console.log(ordersData)

  // ── Input + tracked ID ────────────────────────────────────────────────────
  const initialId = params.get("id") || sessionStorage.getItem("tr-last-id") || "";
  const [inputVal, setInputVal] = useState(initialId);
  const [trackedId, setTrackedId] = useState(initialId || null);
  const [isSearching, setIsSearching] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const inputRef = useRef(null);

  

  // ── Derive tracked order from local cache ─────────────────────────────────
  const trackedOrder = useMemo(() => {
    if (!trackedId || !orders.length) return null;
    const q = trackedId.toLowerCase();
    return orders.find((o) =>
      o.id?.toLowerCase().includes(q) ||
      (o.items || []).some((i) => i.product?.name?.toLowerCase().includes(q))
    ) ?? null;
  }, [trackedId, orders]);

  // ── Auto-poll while in transit ────────────────────────────────────────────
  useAutoPoll(trackedOrder?.status, () => setUpdatedAt(new Date().toISOString()));

  // ── Trigger search ────────────────────────────────────────────────────────
  const doSearch = useCallback((idOverride) => {
    const id = (idOverride ?? inputVal).trim();
    if (!id) return;
    setIsSearching(true);
    setTrackedId(id);
    sessionStorage.setItem("tr-last-id", id);
    setUpdatedAt(new Date().toISOString());
    setTimeout(() => setIsSearching(false), 800);
  }, [inputVal]);

  /** Clear result and reset form */
  const doClear = useCallback(() => {
    setTrackedId(null);
    setInputVal("");
    sessionStorage.removeItem("tr-last-id");
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // ── Hero entrance ─────────────────────────────────────────────────────────
  const titleRef = useRef(null);
  useEffect(() => {
    if (!titleRef.current) return;
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(titleRef.current.querySelectorAll(".tr-hl"),
      { y: 55, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.95, ease: "expo.out", clearProps: "all" }
    );
    return () => tl.kill();
  }, []);

  // ── Scroll reveal per section ─────────────────────────────────────────────
  useEffect(() => {
    document.querySelectorAll(".tr-section").forEach((el) => {
      gsap.fromTo(el, { y: 45, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [trackedOrder]);

  const notFound = trackedId && !isSearching && !trackedOrder;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#070a18" }}>
      <style>{TR_STYLES}</style>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden pt-16" style={{ minHeight: trackedOrder ? 400 : 500, background: "linear-gradient(180deg,#0c0e26 0%,#070a18 100%)" }}>
        {/* Star field */}
        <div className="absolute inset-0 opacity-35"
          style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,.65) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />
        {/* Ambient glows */}
        <div className="absolute w-[550px] h-[550px] rounded-full -top-40 -left-20 blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }} />
        <div className="absolute w-[380px] h-[380px] rounded-full bottom-0 -right-16 blur-3xl opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle,#3b82f6,transparent 70%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-14 pb-10">
          {/* Headline */}
          <div ref={titleRef} className="text-center mb-12">
            <div className="overflow-hidden mb-2">
              <p className="tr-hl text-indigo-400 text-xs font-black uppercase tracking-[0.4em]">Real-Time Package Intelligence</p>
            </div>
            <div className="overflow-hidden mb-2">
              <h1 className="tr-hl text-5xl md:text-7xl font-black text-white leading-none">Track Your</h1>
            </div>
            <div className="overflow-hidden">
              <h1 className="tr-hl text-5xl md:text-7xl font-black leading-none">
                <span className="tr-glitch-wrap" data-text="Delivery"
                  style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa,#60a5fa)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Delivery
                </span>
              </h1>
            </div>
            {!trackedOrder && (
              <p className="tr-hl text-white/35 text-sm mt-5 max-w-sm mx-auto leading-relaxed">
                Paste your order ID or pick a recent order below.
              </p>
            )}
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto space-y-5">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Ic.Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input ref={inputRef} type="text" value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  placeholder="e.g. SE-20481234 or paste order ID"
                  className="tr-input pl-12 pr-11" />
                {inputVal && (
                  <button onClick={doClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition">
                    <Ic.Close className="w-4 h-4" />
                  </button>
                )}
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => doSearch()} disabled={!inputVal.trim() || isSearching}
                className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm disabled:opacity-50 transition-opacity">
                {isSearching ? <Spinner cls="w-4 h-4" /> : <Ic.Search className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSearching ? "Scanning…" : "Track"}</span>
              </motion.button>
            </div>

            {/* Recent orders quick-select */}
            {!ordersLoading && orders.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2.5">Recent Orders</p>
                <div className="flex gap-2 overflow-x-auto tr-scroll pb-1">
                  {orders.slice(0, 8).map((o) => (
                    <motion.button key={o.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setInputVal(o.id); doSearch(o.id); }}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black border transition-all ${trackedId === o.id
                        ? "bg-white text-indigo-700 border-transparent shadow-md"
                        : "bg-white/7 text-white/55 border-white/12 hover:border-white/28 hover:text-white"
                        }`}>
                      #{o.id.slice(0, 8)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Ticker (only when order loaded) */}
        {trackedOrder && <Ticker order={trackedOrder} />}
      </div>

      {/* ── Scanning state ── */}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-md mx-auto px-6 py-20 text-center">
            <div className="mb-8 tr-float"><RadarWidget status="processing" /></div>
            <p className="text-white/55 font-bold text-lg">Scanning network…</p>
            <p className="text-white/25 text-sm mt-1">Connecting to tracking servers</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Not found ── */}
      <AnimatePresence>
        {notFound && !isSearching && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-md mx-auto px-6 py-20 text-center">
            <div className="text-6xl mb-6 tr-float inline-block">🔍</div>
            <h2 className="text-2xl font-black text-white mb-3">Order Not Found</h2>
            <p className="text-white/35 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              No order matching <span className="text-white font-bold">"{trackedId}"</span> was found.
            </p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={doClear}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-8 py-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/25">
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          TRACKING RESULT
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {trackedOrder && !isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-7">

            {/* ── A: Holo card + Radar + Meta ── */}
            <section className="tr-section grid md:grid-cols-3 gap-5 items-start">
              <div className="md:col-span-1">
                <HoloCard order={trackedOrder} />
              </div>
              <div className="md:col-span-2 bg-white/4 border border-white/8 rounded-3xl p-7 space-y-6">
                {/* ID row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-white/35 text-[9px] font-black uppercase tracking-widest mb-1">Order ID</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-black text-white text-xl font-mono">#{trackedOrder.id}</span>
                      <CopyBadge text={trackedOrder.id} />
                    </div>
                    {updatedAt && (
                      <p className="text-white/25 text-xs mt-1.5 flex items-center gap-1.5">
                        <Ic.Refresh className="w-3 h-3" />
                        Updated <LiveClock ts={updatedAt} />
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setUpdatedAt(new Date().toISOString())}
                      className="flex items-center gap-1.5 bg-white/7 border border-white/12 text-white/50 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all">
                      <Ic.Refresh className="w-3.5 h-3.5" />Refresh
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/orders")}
                      className="flex items-center gap-1.5 bg-white/7 border border-white/12 text-white/50 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all">
                      <Ic.Bag className="w-3.5 h-3.5" />Orders
                    </motion.button>
                  </div>
                </div>
                {/* Radar + key facts */}
                <div className="grid grid-cols-2 gap-5 items-center">
                  <RadarWidget status={trackedOrder.status} />
                  <div className="space-y-3.5">
                    {[
                      ["Status", (trackedOrder.status || "").charAt(0).toUpperCase() + (trackedOrder.status || "").slice(1)],
                      ["ETA", computeETA(trackedOrder.status, trackedOrder.createdAt)],
                      ["Ordered", new Date(trackedOrder.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })],
                      ["Courier", "ShopEase Express"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-white/28 text-[9px] uppercase tracking-widest">{k}</p>
                        <p className="text-white font-bold text-sm mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── B: Route map ── */}
            <section className="tr-section bg-white/4 border border-white/8 rounded-3xl p-7">
              <div className="flex items-center gap-2 mb-6">
                <Ic.Map className="w-4 h-4 text-indigo-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Package Route</p>
              </div>
              <RouteMap status={trackedOrder.status} />
              <p className="text-white/20 text-xs text-center mt-3">Live route visualisation</p>
            </section>

            {/* ── C: Steps + Items ── */}
            <section className="tr-section grid lg:grid-cols-2 gap-5">
              <div className="bg-white/4 border border-white/8 rounded-3xl p-7">
                <div className="flex items-center gap-2 mb-7">
                  <Ic.Truck className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Delivery Milestones</p>
                </div>
                <MilestoneSteps status={trackedOrder.status} />
              </div>
              <div className="bg-white/4 border border-white/8 rounded-3xl p-7">
                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-2">
                    <Ic.Box className="w-4 h-4 text-violet-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Items ({trackedOrder.items?.length ?? 0})
                    </p>
                  </div>
                  <span className="font-black text-white">{formatMoneyCents(trackedOrder.total)}</span>
                </div>
                <ItemList items={trackedOrder.items} />
              </div>
            </section>

            {/* ── D: Delivery address + Support ── */}
            <section className="tr-section grid md:grid-cols-2 gap-5">
              {/* Address + CTAs */}
              <div className="bg-white/4 border border-white/8 rounded-3xl p-7 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Ic.Map className="w-4 h-4 text-emerald-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Delivery Address</p>
                </div>
                {trackedOrder.shipping ? (
                  <div className="space-y-0.5">
                    <p className="font-black text-white">{trackedOrder.shipping.name}</p>
                    {["address", "city", "country"].map((k) => trackedOrder.shipping[k] && (
                      <p key={k} className="text-white/45 text-sm">
                        {k === "city"
                          ? `${trackedOrder.shipping.city}${trackedOrder.shipping.state ? `, ${trackedOrder.shipping.state}` : ""} ${trackedOrder.shipping.zip || ""}`
                          : trackedOrder.shipping[k]}
                      </p>
                    ))}
                  </div>
                ) : <p className="text-white/25 text-sm">Address not on record</p>}

                <div className="space-y-2 pt-2 border-t border-white/8">
                  {[
                    { label: "All My Orders", icon: <Ic.Bag className="w-4 h-4" />, path: "/orders", cls: "bg-white/6 hover:bg-white/12 text-white/60 hover:text-white border-white/10" },
                    { label: "Continue Shopping", icon: <Ic.Bag className="w-4 h-4" />, path: "/products", cls: "bg-indigo-600/18 hover:bg-indigo-600/28 text-indigo-300 border-indigo-600/28" },
                  ].map((b) => (
                    <motion.button key={b.label} whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(b.path)}
                      className={`w-full flex items-center gap-3 border px-4 py-3 rounded-2xl text-sm font-bold transition-all ${b.cls}`}>
                      {b.icon}{b.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div className="bg-white/4 border border-white/8 rounded-3xl p-7">
                <div className="flex items-center gap-2 mb-5">
                  <Ic.Chat className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Contact Support</p>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-5">
                  Issue with this delivery? We respond within 2 hours, 24/7.
                </p>
                <SupportForm orderId={trackedOrder.id} />
                <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-2 text-white/25 text-xs">
                  <Ic.Phone className="w-3.5 h-3.5" />
                  <span>Or call: <span className="text-white/45 font-bold">1-800-SHOPEASE</span></span>
                </div>
              </div>
            </section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty / how-it-works ── */}
      {!trackedOrder && !isSearching && (
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-white/18 text-[10px] font-black uppercase tracking-widest text-center mb-8">How It Works</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "🔍", title: "Enter Your ID", desc: "Paste the order number from your confirmation email or pick a recent order above." },
              { icon: "📡", title: "Real-Time Tracking", desc: "See your package's exact position, route, and ETA — refreshed every 30 seconds." },
              { icon: "📬", title: "Stay Informed", desc: "Know the moment your order is out for delivery or has been delivered." },
            ].map((t, i) => (
              <motion.div key={t.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                className="bg-white/4 border border-white/7 rounded-3xl p-6 text-center hover:bg-white/8 transition group">
                <div className="text-4xl mb-4 tr-float inline-block" style={{ animationDelay: `${i * 0.6}s` }}>{t.icon}</div>
                <h3 className="font-black text-white mb-2">{t.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}