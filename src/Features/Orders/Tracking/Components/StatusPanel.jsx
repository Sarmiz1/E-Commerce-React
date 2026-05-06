
import React from 'react';
import { Ic } from './TrackingIcons';
import { computeETA, statusColor, statusPct, STATUS_CFG } from '../Utils/trackingUtils';
import { StatusOrb, StatBlock, LiveClock } from './TrackingAtoms';
import { formatMoneyCents } from "../../../../utils/FormatMoneyCents";

export function StatusPanel({ order, updatedAt, onRefresh }) {
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
