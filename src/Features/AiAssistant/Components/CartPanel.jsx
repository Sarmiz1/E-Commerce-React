import React from "react";
import { ArrowLeft, ShoppingBag, Trash2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const ACCENT = "#5636F3";

export function CartPanel({ items, onRemove, onClose, onCheckout, colors, cta, ctaText }) {
  const total = items.reduce((s, p) => s + p.price, 0);
  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 26, stiffness: 300 }}
      style={{ position: "absolute", inset: 0, background: colors.surface.primary, zIndex: 20, display: "flex", flexDirection: "column" }}
    >
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${colors.border.subtle}` }}>
        <button onClick={onClose} style={{ border: "none", background: colors.surface.secondary, borderRadius: 9, padding: 8, cursor: "pointer" }}>
          <ArrowLeft size={15} color={colors.text.secondary} />
        </button>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, color: colors.text.primary }}>Your Cart</div>
          <div style={{ fontSize: 10, color: colors.text.tertiary, fontWeight: 600 }}>{items.length} item{items.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <div className="woo-scroll" style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <ShoppingBag size={36} color={colors.text.tertiary} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: colors.text.tertiary }}>Cart is empty</p>
          </div>
        ) : items.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${colors.border.subtle}` }}>
            <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", background: colors.surface.tertiary }} onError={e => { e.target.src = `https://picsum.photos/seed/${p.id}/80/80`; }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: colors.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: ACCENT }}>₦{p.price.toLocaleString()}</div>
            </div>
            <button onClick={() => onRemove(p.id)} style={{ border: "none", background: "#fee2e2", borderRadius: 8, padding: 7, cursor: "pointer", flexShrink: 0 }}>
              <Trash2 size={12} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div style={{ padding: "12px 14px 16px", borderTop: `1px solid ${colors.border.default}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.text.secondary }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: colors.text.primary }}>₦{total.toLocaleString()}</span>
          </div>
          <button
            onClick={onCheckout}
            style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${cta}, ${ACCENT})`, color: ctaText, border: "none", borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <ExternalLink size={14} /> Proceed to Checkout
          </button>
        </div>
      )}
    </motion.div>
  );
}
