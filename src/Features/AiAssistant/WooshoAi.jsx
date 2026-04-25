import React from "react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../Context/theme/ThemeContext";
import { useWooshoChat } from "./hooks/useWooshoChat";

import { TypingWave } from "./components/TypingWave";
import { MessageBubble } from "./components/MessageBubble";
import { CartPanel } from "./components/CartPanel";
import { ChatHeader } from "./components/ChatHeader";
import { ChatInput } from "./components/ChatInput";

const ACCENT = "#5636F3";

const CSS = `
  @keyframes woo-wave {
    0%,60%,100% { transform: translateY(0); }
    30%          { transform: translateY(-6px); }
  }
  .woo-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--woo-dot-color,#888); }
  .woo-dot:nth-child(1){ animation: woo-wave 1.2s ease-in-out infinite 0s; }
  .woo-dot:nth-child(2){ animation: woo-wave 1.2s ease-in-out infinite 0.18s; }
  .woo-dot:nth-child(3){ animation: woo-wave 1.2s ease-in-out infinite 0.36s; }

  @keyframes woo-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  .woo-msg { animation: woo-fadein 0.22s ease forwards; }

  .woo-scroll { scrollbar-width:thin; scrollbar-color: rgba(128,128,128,0.2) transparent; }
  .woo-scroll::-webkit-scrollbar { width:4px; }
  .woo-scroll::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.2); border-radius:9999px; }

  .woo-product-scroll { display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; scroll-snap-type:x mandatory; }
  .woo-product-scroll::-webkit-scrollbar { display:none; }
  .woo-product-scroll > * { scroll-snap-align:start; }

  @media (max-width: 640px) {
    .woo-panel {
      inset: 0 !important;
      bottom: 0 !important;
      right: 0 !important;
      width: 100vw !important;
      height: 100dvh !important;
      max-width: 100vw !important;
      max-height: 100dvh !important;
      border-radius: 0 !important;
    }
    .woo-trigger-btn {
      bottom: 16px !important;
      right: 16px !important;
    }
  }
`;

const QUICK_PROMPTS = [
  { label: "Sneakers under ₦50k", icon: "👟" },
  { label: "Best phones this week", icon: "📱" },
  { label: "Fashion for women", icon: "👗" },
  { label: "Show my cart", icon: "🛒" },
];

export default function WooshoAI() {
  const { colors, isDark } = useTheme();
  const cta = colors.cta.primary;
  const ctaText = colors.cta.primaryText;

  const {
    isOpen, setIsOpen,
    showCart, setShowCart,
    isLoading,
    input, setInput,
    cartItems, addToCart, removeFromCart,
    messages,
    bottomRef, inputRef,
    sendMessage, handleKey, handleCheckout,
  } = useWooshoChat();

  const bubbleBg = isDark ? colors.surface.elevated : "#fff";
  const bubbleBorder = colors.border.default;

  return (
    <>
      <style>{CSS}</style>
      <style>{`:root { --woo-bubble-bg:${bubbleBg}; --woo-border:${bubbleBorder}; }`}</style>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(o => !o)}
        className="woo-trigger-btn"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2147483646, width: 60, height: 60, borderRadius: "50%", background: isOpen ? "#1e1e1e" : cta, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 28px ${isOpen ? "rgba(0,0,0,0.4)" : cta + "66"}` }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={isOpen ? "x" : "spark"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
            {isOpen ? <X size={22} color="#fff" /> : <Sparkles size={22} color={ctaText} fill={ctaText} />}
          </motion.div>
        </AnimatePresence>
        {!isOpen && cartItems.length > 0 && (
          <div style={{ position: "absolute", top: -3, right: -3, background: "#ef4444", color: "#fff", width: 18, height: 18, borderRadius: "50%", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
            {cartItems.length}
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            style={{
              position: "fixed", zIndex: 2147483647,
              bottom: "var(--woo-bottom, 96px)", right: "var(--woo-right, 24px)",
              width: "var(--woo-w, 370px)", height: "var(--woo-h, 580px)",
              maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100dvh - 110px)",
              borderRadius: 28, overflow: "hidden", display: "flex", flexDirection: "column",
              background: colors.surface.primary,
              border: `1px solid ${colors.border.subtle}`,
              boxShadow: "0 32px 80px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)",
            }}
            className="woo-panel"
          >
            <ChatHeader cartItems={cartItems} setShowCart={setShowCart} onClose={() => setIsOpen(false)} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              <AnimatePresence>
                {showCart && (
                  <CartPanel
                    items={cartItems}
                    onRemove={removeFromCart}
                    onClose={() => setShowCart(false)}
                    onCheckout={handleCheckout}
                    colors={colors} cta={cta} ctaText={ctaText}
                  />
                )}
              </AnimatePresence>

              <div className="woo-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 13px 8px", background: isDark ? colors.surface.secondary : "#f9f9fc" }}>
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id} msg={msg}
                    cartItems={cartItems} onAddToCart={addToCart}
                    onCheckout={handleCheckout}
                    colors={colors} cta={cta} ctaText={ctaText}
                  />
                ))}
                {isLoading && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 7, background: cta, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Sparkles size={11} color={ctaText} fill={ctaText} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: cta, textTransform: "uppercase", letterSpacing: "0.1em" }}>Woosho AI</span>
                    </div>
                    <TypingWave color={colors.text.tertiary} />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {messages.length <= 1 && !isLoading && (
                <div style={{ padding: "8px 13px 4px", display: "flex", gap: 6, overflowX: "auto", flexShrink: 0, background: isDark ? colors.surface.secondary : "#f9f9fc" }}>
                  {QUICK_PROMPTS.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q.label)}
                      style={{ flexShrink: 0, padding: "6px 11px", borderRadius: 99, background: colors.surface.elevated, border: `1px solid ${colors.border.default}`, fontSize: 11, fontWeight: 700, color: colors.text.secondary, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <span>{q.icon}</span>{q.label}
                    </button>
                  ))}
                </div>
              )}

              <ChatInput
                input={input} setInput={setInput}
                handleKey={handleKey} sendMessage={sendMessage}
                isLoading={isLoading} colors={colors}
                isDark={isDark} inputRef={inputRef}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}