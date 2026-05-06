
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatMoneyCents } from "../../../../utils/FormatMoneyCents";
import { Ic, Spinner } from './TrackingIcons';
import { computeETA, statusColor, statusPct, MILESTONES, MILESTONE_IDX } from '../Utils/trackingUtils';
import { StatusOrb } from './TrackingAtoms';

export function Ticker({ order }) {
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
export function FlightTimeline({ status }) {
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
export function ItemList({ items }) {
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
export function SupportForm({ orderId }) {
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
export function ScanningState() {
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
export function NotFound({ trackedId, onClear }) {
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
export function HowItWorks() {
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
