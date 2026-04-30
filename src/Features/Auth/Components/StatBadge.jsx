import React from 'react';

export default function StatBadge({ icon: Icon, value, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 16px",
        background: "rgba(10, 14, 26, 0.52)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          flexShrink: 0,
          background: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} color="rgba(255,255,255,0.88)" />
      </div>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            fontFamily: "'DM Serif Display', Georgia, serif",
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginTop: 1,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
