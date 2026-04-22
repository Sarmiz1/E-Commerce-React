import React from "react";
import { Sparkles, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";

const ACCENT = "#5636F3";

export function MessageBubble({ msg, cartItems, onAddToCart, onCheckout, colors, cta, ctaText }) {
  const isUser = msg.role === "user";

  // Strip markdown bold markers for clean display
  const cleanText = (msg.text || "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");

  return (
    <div className="woo-msg" style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16 }}>
      <div style={{ maxWidth: isUser ? "72%" : "96%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        {!isUser && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: cta, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={11} color={ctaText} fill={ctaText} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, color: cta, textTransform: "uppercase", letterSpacing: "0.1em" }}>Woosho AI</span>
          </div>
        )}

        {cleanText && (
          <div style={{
            padding: "11px 15px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
            background: isUser ? cta : colors.surface.elevated,
            color: isUser ? ctaText : colors.text.primary,
            fontSize: 13.5, fontWeight: 500, lineHeight: 1.65,
            border: isUser ? "none" : `1px solid ${colors.border.default}`,
            boxShadow: isUser ? `0 4px 14px ${cta}44` : "0 2px 8px rgba(0,0,0,0.05)",
            whiteSpace: "pre-wrap", wordBreak: "break-word"
          }}>
            {cleanText}
          </div>
        )}

        {msg.productIds?.length > 0 && (
          <div className="woo-product-scroll" style={{ marginTop: 10, width: "100%", maxWidth: 420 }}>
            {msg.productIds.map(id => (
              <ProductCard key={id} productId={id} cartItems={cartItems} onAddToCart={onAddToCart} colors={colors} />
            ))}
          </div>
        )}

        {msg.actions?.some(a => a.type === "checkout") && (
          <motion.button
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={onCheckout}
            style={{ marginTop: 8, padding: "10px 18px", borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #a855f7)`, color: "#fff", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <ExternalLink size={13} /> Go to Checkout
          </motion.button>
        )}

        {msg.actions?.filter(a => a.type === "add_to_cart").map((a, i) => (
          <div key={i} style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
            <Check size={11} /> {a.productName} added to cart
          </div>
        ))}

        {msg.isError && (
          <div style={{ marginTop: 4, fontSize: 11, color: "#ef4444", fontWeight: 600 }}>
            Connection issue — please try again
          </div>
        )}

        <div style={{ fontSize: 9, color: colors.text.tertiary, marginTop: 5, fontWeight: 600 }}>{msg.time}</div>
      </div>
    </div>
  );
}
