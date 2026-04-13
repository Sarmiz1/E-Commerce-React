// src/Pages/Orders/OrdersPage.jsx
//
// ── Data ──────────────────────────────────────────────────────────────────────
//  Orders:  GET /api/orders          → array of order objects
//  Single:  GET /api/orders/:id      → one order with full line items
//  Cancel:  POST /api/orders/:id/cancel
//
// ── Logic highlights ──────────────────────────────────────────────────────────
//  • Filter bar: All / Processing / Shipped / Delivered / Cancelled
//  • Sort: Newest / Oldest / Highest value / Lowest value
//  • Search by order number or product name
//  • Order detail slide-over panel (right drawer on desktop, bottom sheet on mobile)
//  • Track Order CTA opens an animated live-tracker timeline inside the drawer
//  • Cancel order flow with confirmation modal + API call
//  • Stat cards at top (total orders, total spent, pending, delivered)
//  • Empty states per filter with matching illustrations
//  • Re-order CTA adds all items back to cart
//
// ── Animation system (all named or-*) ─────────────────────────────────────────
//  Different from every other page:
//  • Stat cards: counter "count-up" from 0 on scroll-enter
//  • Order cards: slide-in from bottom with spring stagger (not GSAP — pure Framer)
//  • Detail drawer: slides from right with custom spring
//  • Timeline steps: sequential reveal with connecting line "draw" animation
//  • Status badge: morphing border glow pulse per status colour
//  • Cancelled: shake animation on cancel confirm
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState, useEffect, useRef, useCallback, useMemo, useContext,
} from "react";
import { motion, AnimatePresence, useInView }   from "framer-motion";
import { useNavigate }                           from "react-router-dom";
import gsap                                      from "gsap";
import { ScrollTrigger }                         from "gsap/ScrollTrigger";

import { useFetchData }        from "../../Hooks/useFetch";
import { postData }            from "../../api/postData";
import useShowErrorBoundary    from "../../Hooks/useShowErrorBoundary";
import { formatMoneyCents }    from "../../Utils/formatMoneyCents";

gsap.registerPlugin(ScrollTrigger);

// ─── Page-scoped keyframes (or- prefix, never collide with other pages) ───────
const OR_STYLES = `
  /* Floating orbs */
  @keyframes or-orb{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(22px,-26px)scale(1.04)}66%{transform:translate(-16px,18px)scale(0.97)}}
  .or-orb{animation:or-orb linear infinite}

  /* Shimmer text */
  @keyframes or-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .or-shimmer{
    background:linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 60%,#818cf8 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:or-shimmer 4s linear infinite;
  }

  /* Status glow pulses — one per colour */
  @keyframes or-glow-blue{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.45)}60%{box-shadow:0 0 0 7px rgba(59,130,246,0)}}
  @keyframes or-glow-amber{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.45)}60%{box-shadow:0 0 0 7px rgba(245,158,11,0)}}
  @keyframes or-glow-green{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.45)}60%{box-shadow:0 0 0 7px rgba(16,185,129,0)}}
  @keyframes or-glow-red{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.35)}60%{box-shadow:0 0 0 7px rgba(239,68,68,0)}}
  .or-glow-processing{animation:or-glow-amber 2.2s ease-out infinite}
  .or-glow-shipped{animation:or-glow-blue 2.2s ease-out infinite}
  .or-glow-delivered{animation:or-glow-green 2.6s ease-out infinite}
  .or-glow-cancelled{animation:or-glow-red 3s ease-out infinite}

  /* Timeline line draw */
  @keyframes or-line-draw{from{height:0}to{height:100%}}
  .or-line-draw{animation:or-line-draw 0.9s ease-out forwards}

  /* Spin for loader */
  @keyframes or-spin{to{transform:rotate(360deg)}}
  .or-spin{animation:or-spin .75s linear infinite}

  /* Shake on cancel */
  @keyframes or-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
  .or-shake{animation:or-shake .4s ease-out}

  /* Counter number reveals */
  @keyframes or-count-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .or-count-in{animation:or-count-in .45s ease-out forwards}

  /* Mobile bottom sheet */
  .or-sheet{border-radius:24px 24px 0 0}

  /* Scrollbar styling for drawer */
  .or-scroll::-webkit-scrollbar{width:4px}
  .or-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:99px}
`;

// ─── Status configuration (colours, labels, icons) ───────────────────────────
const STATUS_CONFIG = {
  processing: {
    label: "Processing",
    bg:    "bg-amber-100",
    text:  "text-amber-700",
    dot:   "bg-amber-500",
    glow:  "or-glow-processing",
    icon:  "⏳",
    ring:  "border-amber-300",
    track: [
      { label: "Order Placed",         done: true,  time: "Just now"            },
      { label: "Payment Confirmed",    done: true,  time: "Just now"            },
      { label: "Processing",           done: true,  time: "In progress"         },
      { label: "Dispatched",           done: false, time: "Within 24h"          },
      { label: "Delivered",            done: false, time: "2–5 business days"   },
    ],
  },
  shipped: {
    label: "Shipped",
    bg:    "bg-blue-100",
    text:  "text-blue-700",
    dot:   "bg-blue-500",
    glow:  "or-glow-shipped",
    icon:  "🚚",
    ring:  "border-blue-300",
    track: [
      { label: "Order Placed",         done: true,  time: "Confirmed"           },
      { label: "Payment Confirmed",    done: true,  time: "Confirmed"           },
      { label: "Dispatched",           done: true,  time: "On its way"          },
      { label: "Out for Delivery",     done: true,  time: "Today"               },
      { label: "Delivered",            done: false, time: "Expected today"      },
    ],
  },
  delivered: {
    label: "Delivered",
    bg:    "bg-emerald-100",
    text:  "text-emerald-700",
    dot:   "bg-emerald-500",
    glow:  "or-glow-delivered",
    icon:  "✅",
    ring:  "border-emerald-300",
    track: [
      { label: "Order Placed",         done: true,  time: "Completed"           },
      { label: "Payment Confirmed",    done: true,  time: "Completed"           },
      { label: "Dispatched",           done: true,  time: "Completed"           },
      { label: "Delivered",            done: true,  time: "Delivered ✓"         },
    ],
  },
  cancelled: {
    label: "Cancelled",
    bg:    "bg-red-100",
    text:  "text-red-600",
    dot:   "bg-red-400",
    glow:  "or-glow-cancelled",
    icon:  "✕",
    ring:  "border-red-200",
    track: [
      { label: "Order Placed",         done: true,  time: "Placed"              },
      { label: "Cancelled",            done: true,  time: "Cancelled"           },
    ],
  },
};

// ─── Shared floating orbs ──────────────────────────────────────────────────────
function FloatingOrbs({ dark = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w:500, h:500, top:"-12%", left:"-8%",   delay:0,  dur:20 },
        { w:380, h:380, top:"45%",  right:"-8%",  delay:5,  dur:24 },
        { w:260, h:260, bottom:"0", left:"38%",   delay:10, dur:18 },
      ].map((o, i) => (
        <div key={i}
          style={{ width:o.w, height:o.h, top:o.top, left:o.left, right:o.right, bottom:o.bottom,
            animationDelay:`${o.delay}s`, animationDuration:`${o.dur}s` }}
          className={`absolute rounded-full blur-3xl or-orb ${dark ? "bg-indigo-900/35" : "bg-gradient-to-br from-blue-400/15 to-indigo-500/15"}`}
        />
      ))}
    </div>
  );
}

// ─── Animated counter (counts up from 0 on first scroll-enter) ────────────────
function AnimatedCounter({ end, prefix = "", suffix = "", duration = 1200 }) {
  const ref        = useRef(null);
  const isInView   = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const isDecimal = typeof end === "number" && end % 1 !== 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed  = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal
        ? (end * eased).toFixed(1)
        : Math.round(end * eased);
      setVal(current);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="or-count-in tabular-nums">
      {prefix}{val}{suffix}
    </span>
  );
}

// ─── Status badge pill ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${cfg.bg} ${cfg.text} ${cfg.ring} ${cfg.glow}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  );
}

// ─── SVG icon set ─────────────────────────────────────────────────────────────
const Icons = {
  Search: ({ c = "w-5 h-5" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  Filter: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Sort:   ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>,
  Close:  ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Truck:  ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Package:({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Bag:    ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Refresh:({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  Chev:   ({ dir = "right", c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{dir==="right"?<path d="M9 18l6-6-6-6"/>:dir==="down"?<path d="M6 9l6 6 6-6"/>:<path d="M15 18l-6-6 6-6"/>}</svg>,
  Star:   ({ c = "w-4 h-4" }) => <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  X:      ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>,
};

// ─── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} or-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

// ─── Stats bar — four animated counters ───────────────────────────────────────
function StatsBar({ orders }) {
  const totalSpent   = orders.reduce((s, o) => s + (o.total || 0), 0);
  const delivered    = orders.filter((o) => o.status === "delivered").length;
  const pending      = orders.filter((o) => ["processing","shipped"].includes(o.status)).length;

  const stats = [
    { label: "Total Orders",   value: orders.length, suffix: "",   icon: <Icons.Package c="w-5 h-5" />, color: "from-blue-500 to-indigo-600",    shadow: "shadow-indigo-500/20" },
    { label: "Total Spent",    value: totalSpent / 100, prefix: "$", suffix: "", decimals: true, icon: <Icons.Bag c="w-5 h-5" />, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20" },
    { label: "Delivered",      value: delivered,     suffix: "",   icon: <Icons.Truck c="w-5 h-5" />,   color: "from-emerald-500 to-teal-600",   shadow: "shadow-emerald-500/20" },
    { label: "In Progress",    value: pending,       suffix: "",   icon: <Icons.Refresh c="w-5 h-5" />, color: "from-amber-500 to-orange-500",   shadow: "shadow-amber-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          whileHover={{ y: -4, scale: 1.02 }}
          className={`relative bg-white rounded-3xl p-5 shadow-lg ${s.shadow} border border-gray-100 overflow-hidden group`}
        >
          {/* Gradient shimmer on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          <div className="relative z-10">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
              {s.icon}
            </div>
            <p className={`text-3xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
              {s.prefix}
              <AnimatedCounter
                end={s.decimals ? parseFloat(totalSpent / 100) : s.value}
                suffix={s.suffix}
              />
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-1 font-semibold">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Filter + sort toolbar ────────────────────────────────────────────────────
function FilterToolbar({ search, onSearch, status, onStatus, sort, onSort }) {
  const STATUSES = [
    { value: "all",        label: "All Orders" },
    { value: "processing", label: "Processing" },
    { value: "shipped",    label: "Shipped" },
    { value: "delivered",  label: "Delivered" },
    { value: "cancelled",  label: "Cancelled" },
  ];
  const SORTS = [
    { value: "newest",    label: "Newest First" },
    { value: "oldest",    label: "Oldest First" },
    { value: "highest",   label: "Highest Value" },
    { value: "lowest",    label: "Lowest Value" },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Search */}
      <div className="relative">
        <Icons.Search c="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by order number or product name…"
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition placeholder-gray-400 shadow-sm"
        />
        {search && (
          <button onClick={() => onSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
            <Icons.Close c="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status tabs + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status pills — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 no-scrollbar">
          {STATUSES.map((s) => (
            <motion.button key={s.value}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onStatus(s.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all duration-200 border ${
                status === s.value
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-500/25"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}>
              {s.label}
            </motion.button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icons.Sort c="w-3.5 h-3.5" />
          </div>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:border-indigo-400 transition appearance-none shadow-sm cursor-pointer"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Icons.Chev dir="down" c="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Tracking timeline (inside drawer) ───────────────────────────────────────
function TrackingTimeline({ order }) {
  const cfg    = STATUS_CONFIG[order?.status] || STATUS_CONFIG.processing;
  const steps  = cfg.track;
  const lineRef = useRef(null);

  // Animate the vertical connecting line drawing top→down
  useEffect(() => {
    if (!lineRef.current) return;
    gsap.fromTo(lineRef.current,
      { height: "0%" },
      { height: "100%", duration: 1.2, ease: "power2.out", delay: 0.3 }
    );
    return () => gsap.killTweensOf(lineRef.current);
  }, [order?.status]);

  const lastDone = steps.reduce((a, s, i) => (s.done ? i : a), -1);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-3xl p-6 border border-indigo-100/50">
      <div className="flex items-center gap-2 mb-5">
        <Icons.Truck c="w-4 h-4 text-indigo-500" />
        <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Order Tracking</p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        {steps.length > 1 && (
          <div className="absolute left-[18px] top-6 bottom-6 w-px bg-gray-200 overflow-hidden">
            <div ref={lineRef} className="w-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" style={{ height: "0%" }} />
          </div>
        )}

        <div className="space-y-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: "power3.out" }}
              className="flex items-start gap-4 relative z-10"
            >
              {/* Node */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-sm transition-all duration-300 ${
                step.done
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-indigo-500/30"
                  : i === lastDone + 1
                  ? "bg-white border-indigo-400 text-indigo-500 shadow-sm"
                  : "bg-gray-100 border-gray-200 text-gray-300"
              }`}>
                {step.done ? "✓" : i + 1}
              </div>

              {/* Label */}
              <div className="flex-1 pt-1">
                <p className={`text-sm font-bold leading-tight ${step.done ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${step.done ? "text-indigo-500 font-semibold" : "text-gray-400"}`}>
                  {step.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Order detail drawer (right slide-over on desktop, bottom sheet mobile) ───
function OrderDrawer({ order, onClose, onCancel, onReorder, isCancelling }) {
  const navigate    = useNavigate();
  const drawerRef   = useRef(null);
  const cfg         = STATUS_CONFIG[order?.status] || STATUS_CONFIG.processing;
  const [tab, setTab] = useState("items"); // "items" | "tracking" | "invoice"

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!order) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer panel */}
      <motion.div
        ref={drawerRef}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.8 }}
        className="fixed top-0 right-0 bottom-0 z-[81] or-scroll overflow-y-auto flex flex-col"
        style={{ width: "min(520px, 100vw)", background: "rgba(255,255,255,0.98)", backdropFilter: "blur(24px)", boxShadow: "-12px 0 60px rgba(0,0,0,0.15)" }}
      >
        {/* Drawer header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order Details</p>
            <h2 className="font-black text-gray-900 text-lg">#{order.id?.slice(0, 12) || "N/A"}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={order.status} />
              <span className="text-gray-400 text-xs">{new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1 transition">
            <Icons.Close c="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 px-6 border-b border-gray-100">
          {[
            { id: "items",    label: "Items" },
            { id: "tracking", label: "Tracking" },
            { id: "invoice",  label: "Invoice" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-5 py-3.5 text-sm font-bold transition-colors ${
                tab === t.id ? "text-indigo-700" : "text-gray-400 hover:text-gray-700"
              }`}>
              {t.label}
              {tab === t.id && (
                <motion.div layoutId="drawer-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-6 py-6 space-y-5">
          <AnimatePresence mode="wait">

            {/* ── Items tab ── */}
            {tab === "items" && (
              <motion.div key="items"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="space-y-4">
                {(order.items || []).map((item, i) => (
                  <motion.div key={item.id || i}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                      {item.product?.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{item.product?.name || "Product"}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-gray-900 text-sm flex-shrink-0">
                      {formatMoneyCents((item.product?.priceCents || 0) * item.quantity)}
                    </p>
                  </motion.div>
                ))}
                {(!order.items || !order.items.length) && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-sm font-semibold">No item details available</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Tracking tab ── */}
            {tab === "tracking" && (
              <motion.div key="tracking"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="space-y-4">
                <TrackingTimeline order={order} />
                {/* Estimated delivery */}
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                    <Icons.Truck c="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-700 font-bold text-sm">Estimated Delivery</p>
                      <p className="text-blue-500 text-xs mt-0.5">
                        {order.status === "shipped" ? "Today – Tomorrow" : "Within 2–5 business days"}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Invoice tab ── */}
            {tab === "invoice" && (
              <motion.div key="invoice"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="space-y-3">
                {/* Shipping address */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Shipped To</p>
                  <p className="font-bold text-gray-900 text-sm">{order.shipping?.name || "—"}</p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                    {order.shipping?.address}<br />
                    {order.shipping?.city}{order.shipping?.state ? `, ${order.shipping.state}` : ""} {order.shipping?.zip}<br />
                    {order.shipping?.country}
                  </p>
                </div>

                {/* Totals breakdown */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Invoice Summary</p>
                  {[
                    ["Subtotal",  formatMoneyCents(order.totals?.subtotal || order.total)],
                    ["Shipping",  order.totals?.shipping === 0 ? "Free" : formatMoneyCents(order.totals?.shipping || 0)],
                    ...(order.totals?.discount > 0 ? [["Discount", `-${formatMoneyCents(order.totals.discount)}`]] : []),
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className={`font-bold ${k==="Discount" ? "text-emerald-600" : "text-gray-900"}`}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200 mt-2">
                    <span>Total</span>
                    <span className="text-indigo-700">{formatMoneyCents(order.total)}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Payment</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <span className="text-white text-[8px] font-black">CARD</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">•••• {order.payment?.last4 || "****"}</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Drawer action footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-4 space-y-3">
          {/* Re-order */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onReorder(order)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg shadow-indigo-500/25">
            <Icons.Bag c="w-4 h-4" /> Re-order These Items
          </motion.button>

          {/* Cancel — only available if not already cancelled/delivered */}
          {!["cancelled","delivered"].includes(order.status) && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onCancel(order.id)}
              disabled={isCancelling}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-bold py-3.5 rounded-2xl text-sm transition-all disabled:opacity-50">
              {isCancelling ? <Spinner className="w-4 h-4" /> : <Icons.X c="w-4 h-4" />}
              {isCancelling ? "Cancelling…" : "Cancel Order"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── Cancel confirmation modal ─────────────────────────────────────────────────
function CancelModal({ orderId, onConfirm, onDismiss, isLoading }) {
  const modalRef = useRef(null);

  // Shake animation on mount to communicate destructive action
  useEffect(() => {
    if (!modalRef.current) return;
    gsap.fromTo(modalRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
  }, []);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={onDismiss} />

      <motion.div ref={modalRef}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-[min(400px,90vw)] text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto mb-5">⚠️</div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Cancel this order?</h3>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          This action can't be undone. The order will be cancelled and you'll receive a full refund within 3–5 business days.
        </p>
        <div className="flex gap-3">
          <button onClick={onDismiss}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition text-sm">
            Keep Order
          </button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onConfirm} disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-red-500/25 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading ? <Spinner className="w-4 h-4" /> : null}
            Yes, Cancel
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Single order card ─────────────────────────────────────────────────────────
function OrderCard({ order, index, onOpen }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      whileHover={{ y: -4, boxShadow: "0 20px 50px rgba(79,70,229,0.12)" }}
      className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden group cursor-pointer transition-shadow duration-300"
      onClick={() => onOpen(order)}
    >
      {/* Card header strip */}
      <div className={`h-1 bg-gradient-to-r ${
        order.status === "delivered"  ? "from-emerald-400 to-teal-500" :
        order.status === "shipped"    ? "from-blue-400 to-indigo-500"  :
        order.status === "cancelled"  ? "from-red-400 to-rose-500"     :
                                        "from-amber-400 to-orange-500"
      }`} />

      <div className="p-5 sm:p-6">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order Number</p>
            <p className="font-black text-gray-900 text-sm truncate">#{order.id?.slice(0, 14) || "—"}</p>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Product images strip */}
        {order.items?.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-3">
              {order.items.slice(0, 4).map((item, i) => (
                <div key={i} className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden bg-gray-100 shadow-sm flex-shrink-0">
                  {item.product?.image && <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />}
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="w-10 h-10 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-gray-500 text-[10px] font-black">+{order.items.length - 4}</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-xs ml-1">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Ordered</p>
            <p className="text-sm font-bold text-gray-700">
              {new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-lg font-black text-gray-900">{formatMoneyCents(order.total)}</p>
          </div>
        </div>

        {/* View details CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-indigo-500 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
            View details <Icons.Chev c="w-3.5 h-3.5" />
          </p>
          {cfg.icon && (
            <span className="text-xl">{cfg.icon}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty state per filter ────────────────────────────────────────────────────
function EmptyState({ statusFilter, search, onReset, navigate }) {
  const configs = {
    all:        { emoji: "📦", title: "No orders yet",             sub: "When you place your first order it'll appear here." },
    processing: { emoji: "⏳", title: "Nothing processing",        sub: "You have no orders currently being processed." },
    shipped:    { emoji: "🚚", title: "No orders in transit",      sub: "Orders on their way to you will show here." },
    delivered:  { emoji: "✅", title: "No deliveries yet",         sub: "Completed orders will appear here." },
    cancelled:  { emoji: "✕",  title: "No cancelled orders",       sub: "Any cancelled orders would appear here." },
  };
  const cfg = search
    ? { emoji: "🔍", title: `No results for "${search}"`, sub: "Try a different search term or clear the filter." }
    : configs[statusFilter] || configs.all;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-5xl mb-6 shadow-lg">
        {cfg.emoji}
      </motion.div>
      <h3 className="text-2xl font-black text-gray-900 mb-3">{cfg.title}</h3>
      <p className="text-gray-400 max-w-sm leading-relaxed text-sm mb-8">{cfg.sub}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {(search || statusFilter !== "all") && (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition text-sm">
            Clear Filters
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/products")}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 text-sm">
          Start Shopping →
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Skeleton loader grid ─────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-1.5"><div className="h-3 bg-gray-200 rounded w-24"/><div className="h-4 bg-gray-200 rounded w-36"/></div>
          <div className="h-7 bg-gray-200 rounded-full w-24" />
        </div>
        <div className="flex gap-2">
          {Array(3).fill(0).map((_,i) => <div key={i} className="w-10 h-10 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="space-y-1.5"><div className="h-2 bg-gray-100 rounded w-16"/><div className="h-4 bg-gray-200 rounded w-28"/></div>
          <div className="space-y-1.5 items-end flex flex-col"><div className="h-2 bg-gray-100 rounded w-12"/><div className="h-6 bg-gray-200 rounded w-20"/></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ORDERS PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function OrdersPage() {
  const navigate = useNavigate();

  // ── Fetch all orders from API ──────────────────────────────────────────────
  const { fetchedData, isLoading, error, refetch } = useFetchData("/api/orders");
  useShowErrorBoundary(error);

  const orders = useMemo(() => fetchedData || [], [fetchedData]);

  // ── Filter / sort / search state ───────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort,        setSort]        = useState("newest");

  // ── Selected order for drawer ──────────────────────────────────────────────
  const [selectedOrder,  setSelectedOrder]  = useState(null);
  const [showDrawer,     setShowDrawer]     = useState(false);

  // ── Cancel flow ───────────────────────────────────────────────────────────
  const [cancelTarget,   setCancelTarget]   = useState(null); // orderId pending cancel
  const [isCancelling,   setIsCancelling]   = useState(false);

  // ── Re-order loading ───────────────────────────────────────────────────────
  const [reorderLoading, setReorderLoading] = useState(false);

  // ── Open the detail drawer ─────────────────────────────────────────────────
  const openDrawer = useCallback((order) => {
    setSelectedOrder(order);
    setShowDrawer(true);
  }, []);

  // ── Close drawer ──────────────────────────────────────────────────────────
  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
    // Delay clearing so exit animation can complete
    setTimeout(() => setSelectedOrder(null), 400);
  }, []);

  // ── Initiate cancel → show confirm modal ──────────────────────────────────
  const handleCancelClick = useCallback((orderId) => {
    setCancelTarget(orderId);
  }, []);

  // ── Confirm cancel → POST to API ──────────────────────────────────────────
  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await postData(`/api/orders/${cancelTarget}/cancel`, {});
      await refetch?.();
      setCancelTarget(null);
      closeDrawer();
    } catch {
      // Error handled silently — API layer should surface to ErrorBoundary
    } finally {
      setIsCancelling(false);
    }
  }, [cancelTarget, refetch, closeDrawer]);

  // ── Re-order: add all items from an order back to cart ────────────────────
  const handleReorder = useCallback(async (order) => {
    setReorderLoading(true);
    try {
      // Add each line item back to cart concurrently
      await Promise.all(
        (order.items || []).map((item) =>
          postData("/api/cart-items", { productId: item.product?.id, quantity: item.quantity })
        )
      );
      navigate("/cart");
    } catch {
      // noop — user can navigate to products manually
    } finally {
      setReorderLoading(false);
    }
  }, [navigate]);

  // ── Reset all filters ──────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setSort("newest");
  }, []);

  // ── Derived: filtered + sorted orders ─────────────────────────────────────
  const displayOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Search — match order id or any product name
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o.id?.toLowerCase().includes(q) ||
        (o.items || []).some((i) => i.product?.name?.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sort === "newest")  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest")  result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "highest") result.sort((a, b) => (b.total || 0) - (a.total || 0));
    if (sort === "lowest")  result.sort((a, b) => (a.total || 0) - (b.total || 0));

    return result;
  }, [orders, statusFilter, search, sort]);

  // ── Hero entrance animation ────────────────────────────────────────────────
  const heroRef   = useRef(null);
  const titleRef  = useRef(null);
  const subRef    = useRef(null);
  useEffect(() => {
    if (!titleRef.current) return;
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", clearProps: "all" })
      .fromTo(subRef.current,   { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all" }, "-=0.5");
    return () => tl.kill();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <style>{OR_STYLES}</style>

      {/* ══════════════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 text-white py-14 md:py-20 px-6">
        <FloatingOrbs />
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em] mb-3">Your Account</p>
              <h1 ref={titleRef} className="text-4xl md:text-5xl font-black leading-tight">
                <span className="or-shimmer">My Orders</span>
              </h1>
              <p ref={subRef} className="text-blue-100 mt-3 text-base">
                {isLoading ? "Loading your orders…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} in your history`}
              </p>
            </div>
            {/* CTA to continue shopping */}
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/products")}
              className="flex-shrink-0 flex items-center gap-2 bg-white/15 border border-white/25 text-white font-bold px-6 py-3 rounded-2xl backdrop-blur-sm hover:bg-white/25 transition text-sm self-start sm:self-auto"
            >
              <Icons.Bag c="w-4 h-4" />
              Continue Shopping
            </motion.button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Stats bar ── */}
        {!isLoading && orders.length > 0 && <StatsBar orders={orders} />}

        {/* ── Filter toolbar ── */}
        <FilterToolbar
          search={search}        onSearch={setSearch}
          status={statusFilter}  onStatus={setStatusFilter}
          sort={sort}            onSort={setSort}
        />

        {/* ── Results count ── */}
        {!isLoading && (search || statusFilter !== "all") && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-gray-400 mb-5">
            Showing <span className="font-black text-gray-700">{displayOrders.length}</span> result{displayOrders.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && <> for <span className="font-bold text-indigo-600">{statusFilter}</span></>}
            {search && <> matching <span className="font-bold text-indigo-600">"{search}"</span></>}
          </motion.p>
        )}

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        ) : displayOrders.length === 0 ? (
          <EmptyState statusFilter={statusFilter} search={search} onReset={resetFilters} navigate={navigate} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayOrders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} onOpen={openDrawer} />
            ))}
          </div>
        )}

        {/* ── Bottom promo strip ── */}
        {!isLoading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "power3.out" }}
            className="mt-14 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 text-white text-center"
          >
            <FloatingOrbs />
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
            <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.3em] mb-3">More to Explore</p>
              <h2 className="text-3xl font-black mb-4">Ready to Shop Again?</h2>
              <p className="text-indigo-100 text-sm mb-8 max-w-md mx-auto">
                New arrivals added daily. Free shipping on orders over $50.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/products")}
                className="bg-white text-indigo-700 font-black px-10 py-4 rounded-2xl text-sm shadow-2xl hover:shadow-white/20 transition">
                Browse All Products →
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Order detail drawer ── */}
      <AnimatePresence>
        {showDrawer && selectedOrder && (
          <OrderDrawer
            order={selectedOrder}
            onClose={closeDrawer}
            onCancel={handleCancelClick}
            onReorder={handleReorder}
            isCancelling={isCancelling}
          />
        )}
      </AnimatePresence>

      {/* ── Cancel confirm modal ── */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            orderId={cancelTarget}
            onConfirm={handleCancelConfirm}
            onDismiss={() => setCancelTarget(null)}
            isLoading={isCancelling}
          />
        )}
      </AnimatePresence>
    </div>
  );
}