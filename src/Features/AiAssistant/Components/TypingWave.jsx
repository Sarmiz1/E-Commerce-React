import React from "react";

export function TypingWave({ color }) {
  return (
    <div style={{ display: "flex", gap: 5, padding: "13px 16px", background: "var(--woo-bubble-bg)", border: "1px solid var(--woo-border)", borderRadius: "6px 18px 18px 18px", width: "fit-content", alignItems: "center" }}>
      <span className="woo-dot" style={{ "--woo-dot-color": color }} />
      <span className="woo-dot" style={{ "--woo-dot-color": color }} />
      <span className="woo-dot" style={{ "--woo-dot-color": color }} />
    </div>
  );
}
