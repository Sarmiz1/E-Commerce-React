import React from "react";
import { Check, ShoppingCart } from "lucide-react";

const ACCENT = "#5636F3";

export function ProductCard({ productId, cartItems, onAddToCart, colors }) {
  const p = window.__WOOSHO_CACHE__?.[productId];
  if (!p) return null;
  const inCart = cartItems.some(c => c.id === p.id);

  return (
    <div style={{ width: 200, flexShrink: 0, borderRadius: 18, overflow: "hidden", border: `1px solid ${colors.border.default}`, background: colors.surface.elevated, display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ position: "relative", height: 150, background: colors.surface.tertiary }}>
        {p.discount > 0 && (
          <span style={{ position: "absolute", top: 8, left: 8, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 99, zIndex: 1 }}>
            -{p.discount}%
          </span>
        )}
        <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = `https://picsum.photos/seed/${productId}/400/400`; }} />
      </div>
      <div style={{ padding: "11px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: colors.text.primary, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.brand}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: "auto" }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: ACCENT }}>₦{p.price.toLocaleString()}</span>
          {p.originalPrice && <span style={{ fontSize: 10, color: colors.text.tertiary, textDecoration: "line-through" }}>₦{p.originalPrice.toLocaleString()}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
          <span style={{ color: "#f59e0b", fontSize: 10 }}>{"★".repeat(Math.round(p.rating))}</span>
          <span style={{ fontSize: 9, color: colors.text.tertiary }}>({p.reviews})</span>
        </div>
        <button
          onClick={() => onAddToCart(p)}
          style={{ padding: "8px 0", borderRadius: 10, border: "none", background: inCart ? "#16a34a" : ACCENT, color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {inCart ? <><Check size={11} /> In Cart</> : <><ShoppingCart size={11} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}
