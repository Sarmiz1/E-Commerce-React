import React from "react";
import { Sparkles, ShoppingCart } from "lucide-react";

const ACCENT = "#5636F3";

export function ChatHeader({ cartItems, setShowCart }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #7c3aed 100%)`, padding: "14px 16px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Sparkles size={20} color="#fff" fill="#fff" />
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid white" }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: "#fff", letterSpacing: "-0.01em" }}>Woosho AI</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Live · Shopping Assistant</div>
          </div>
        </div>
        <button
          onClick={() => setShowCart(true)}
          style={{ background: "rgba(255,255,255,0.14)", border: "none", borderRadius: 11, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
        >
          <ShoppingCart size={15} color="#fff" />
          {cartItems.length > 0 && <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{cartItems.length}</span>}
        </button>
      </div>
    </div>
  );
}
