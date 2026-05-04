
import React, { useState, useEffect, useCallback } from 'react';
import { Ic } from './TrackingIcons';
import { timeAgo, statusColor } from '../Utils/trackingUtils';

export function StatBlock({ label, value, accent = false, mono = false }) {
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
export function CopyBadge({ text }) {
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
export function LiveClock({ ts }) {
  const [label, setLabel] = useState(() => timeAgo(ts));
  useEffect(() => {
    setLabel(timeAgo(ts));
    const id = setInterval(() => setLabel(timeAgo(ts)), 60000);
    return () => clearInterval(id);
  }, [ts]);
  return <>{label}</>;
}
export function StatusOrb({ status, size = 140 }) {
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
