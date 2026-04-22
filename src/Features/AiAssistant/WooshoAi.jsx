import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, X, Send, ShoppingCart, ArrowLeft, Trash2, RefreshCw, Check, ExternalLink, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/theme/ThemeContext";
import { callWooshoAI } from "./aiEngine";

const ACCENT = "#5636F3";

// ── CSS ───────────────────────────────────────────────────────────────────────
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

  @keyframes woo-ping {
    0%   { transform:scale(1); opacity:0.8; }
    100% { transform:scale(2); opacity:0; }
  }
  .woo-ping { animation: woo-ping 1.6s ease-out infinite; }

  .woo-product-scroll { display:flex; gap:10px; overflow-x:auto; padding-bottom:6px; scroll-snap-type:x mandatory; }
  .woo-product-scroll::-webkit-scrollbar { display:none; }
  .woo-product-scroll > * { scroll-snap-align:start; }

  /* Mobile: full screen panel */
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

// ── Wave Typing Indicator ────────────────────────────────────────────────────
function TypingWave({ color }) {
  return (
    <div style={{ display:"flex", gap:5, padding:"13px 16px", background:"var(--woo-bubble-bg)", border:"1px solid var(--woo-border)", borderRadius:"6px 18px 18px 18px", width:"fit-content", alignItems:"center" }}>
      <span className="woo-dot" style={{ "--woo-dot-color": color }} />
      <span className="woo-dot" style={{ "--woo-dot-color": color }} />
      <span className="woo-dot" style={{ "--woo-dot-color": color }} />
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ productId, cartItems, onAddToCart, colors }) {
  const p = window.__WOOSHO_CACHE__?.[productId];
  if (!p) return null;
  const inCart = cartItems.some(c => c.id === p.id);

  return (
    <div style={{ width:200, flexShrink:0, borderRadius:18, overflow:"hidden", border:`1px solid ${colors.border.default}`, background:colors.surface.elevated, display:"flex", flexDirection:"column", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ position:"relative", height:150, background:colors.surface.tertiary }}>
        {p.discount > 0 && (
          <span style={{ position:"absolute", top:8, left:8, background:"#ef4444", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:99, zIndex:1 }}>
            -{p.discount}%
          </span>
        )}
        <img src={p.image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.src = `https://picsum.photos/seed/${productId}/400/400`; }} />
      </div>
      <div style={{ padding:"11px 12px 12px", flex:1, display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontSize:12, fontWeight:800, color:colors.text.primary, lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.name}</div>
        <div style={{ fontSize:9, fontWeight:700, color:colors.text.tertiary, textTransform:"uppercase", letterSpacing:"0.08em" }}>{p.brand}</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:5, marginTop:"auto" }}>
          <span style={{ fontSize:15, fontWeight:900, color:ACCENT }}>₦{p.price.toLocaleString()}</span>
          {p.originalPrice && <span style={{ fontSize:10, color:colors.text.tertiary, textDecoration:"line-through" }}>₦{p.originalPrice.toLocaleString()}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
          <span style={{ color:"#f59e0b", fontSize:10 }}>{"★".repeat(Math.round(p.rating))}</span>
          <span style={{ fontSize:9, color:colors.text.tertiary }}>({p.reviews})</span>
        </div>
        <button
          onClick={() => onAddToCart(p)}
          style={{ padding:"8px 0", borderRadius:10, border:"none", background: inCart ? "#16a34a" : ACCENT, color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, transition:"opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity="1"}
        >
          {inCart ? <><Check size={11} /> In Cart</> : <><ShoppingCart size={11} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, cartItems, onAddToCart, onCheckout, colors, cta, ctaText }) {
  const isUser = msg.role === "user";

  // Strip markdown bold markers for clean display
  const cleanText = (msg.text || "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");

  return (
    <div className="woo-msg" style={{ display:"flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom:16 }}>
      <div style={{ maxWidth: isUser ? "72%" : "96%", display:"flex", flexDirection:"column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        {!isUser && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
            <div style={{ width:22, height:22, borderRadius:7, background:cta, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sparkles size={11} color={ctaText} fill={ctaText} />
            </div>
            <span style={{ fontSize:9, fontWeight:800, color:cta, textTransform:"uppercase", letterSpacing:"0.1em" }}>Woosho AI</span>
          </div>
        )}

        {cleanText && (
          <div style={{
            padding:"11px 15px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
            background: isUser ? cta : colors.surface.elevated,
            color: isUser ? ctaText : colors.text.primary,
            fontSize:13.5, fontWeight:500, lineHeight:1.65,
            border: isUser ? "none" : `1px solid ${colors.border.default}`,
            boxShadow: isUser ? `0 4px 14px ${cta}44` : "0 2px 8px rgba(0,0,0,0.05)",
            whiteSpace:"pre-wrap", wordBreak:"break-word"
          }}>
            {cleanText}
          </div>
        )}

        {msg.productIds?.length > 0 && (
          <div className="woo-product-scroll" style={{ marginTop:10, width:"100%", maxWidth:420 }}>
            {msg.productIds.map(id => (
              <ProductCard key={id} productId={id} cartItems={cartItems} onAddToCart={onAddToCart} colors={colors} />
            ))}
          </div>
        )}

        {msg.actions?.some(a => a.type === "checkout") && (
          <motion.button
            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            onClick={onCheckout}
            style={{ marginTop:8, padding:"10px 18px", borderRadius:12, background:`linear-gradient(135deg, ${ACCENT}, #a855f7)`, color:"#fff", border:"none", fontSize:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
          >
            <ExternalLink size={13} /> Go to Checkout
          </motion.button>
        )}

        {msg.actions?.filter(a => a.type === "add_to_cart").map((a, i) => (
          <div key={i} style={{ marginTop:6, fontSize:11, fontWeight:700, color:"#16a34a", display:"flex", alignItems:"center", gap:4 }}>
            <Check size={11} /> {a.productName} added to cart
          </div>
        ))}

        {msg.isError && (
          <div style={{ marginTop:4, fontSize:11, color:"#ef4444", fontWeight:600 }}>
            Connection issue — please try again
          </div>
        )}

        <div style={{ fontSize:9, color:colors.text.tertiary, marginTop:5, fontWeight:600 }}>{msg.time}</div>
      </div>
    </div>
  );
}

// ── Cart Panel ────────────────────────────────────────────────────────────────
function CartPanel({ items, onRemove, onClose, onCheckout, colors, cta, ctaText }) {
  const total = items.reduce((s, p) => s + p.price, 0);
  return (
    <motion.div
      initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
      transition={{ type:"spring", damping:26, stiffness:300 }}
      style={{ position:"absolute", inset:0, background:colors.surface.primary, zIndex:20, display:"flex", flexDirection:"column" }}
    >
      <div style={{ padding:"16px 16px 12px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${colors.border.subtle}` }}>
        <button onClick={onClose} style={{ border:"none", background:colors.surface.secondary, borderRadius:9, padding:8, cursor:"pointer" }}>
          <ArrowLeft size={15} color={colors.text.secondary} />
        </button>
        <div>
          <div style={{ fontWeight:900, fontSize:16, color:colors.text.primary }}>Your Cart</div>
          <div style={{ fontSize:10, color:colors.text.tertiary, fontWeight:600 }}>{items.length} item{items.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      <div className="woo-scroll" style={{ flex:1, overflowY:"auto", padding:"10px 14px" }}>
        {items.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 0" }}>
            <ShoppingBag size={36} color={colors.text.tertiary} style={{ margin:"0 auto 12px" }} />
            <p style={{ fontSize:13, fontWeight:700, color:colors.text.tertiary }}>Cart is empty</p>
          </div>
        ) : items.map((p, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${colors.border.subtle}` }}>
            <img src={p.image} alt={p.name} style={{ width:44, height:44, borderRadius:10, objectFit:"cover", background:colors.surface.tertiary }} onError={e => { e.target.src=`https://picsum.photos/seed/${p.id}/80/80`; }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:800, color:colors.text.primary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
              <div style={{ fontSize:14, fontWeight:900, color:ACCENT }}>₦{p.price.toLocaleString()}</div>
            </div>
            <button onClick={() => onRemove(p.id)} style={{ border:"none", background:"#fee2e2", borderRadius:8, padding:7, cursor:"pointer", flexShrink:0 }}>
              <Trash2 size={12} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div style={{ padding:"12px 14px 16px", borderTop:`1px solid ${colors.border.default}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:12, fontWeight:700, color:colors.text.secondary }}>Total</span>
            <span style={{ fontSize:20, fontWeight:900, color:colors.text.primary }}>₦{total.toLocaleString()}</span>
          </div>
          <button
            onClick={onCheckout}
            style={{ width:"100%", padding:14, background:`linear-gradient(135deg, ${cta}, ${ACCENT})`, color:ctaText, border:"none", borderRadius:14, fontSize:13, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
          >
            <ExternalLink size={14} /> Proceed to Checkout
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ── Quick Prompts ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: "Sneakers under ₦50k", icon: "👟" },
  { label: "Best phones this week", icon: "📱" },
  { label: "Fashion for women", icon: "👗" },
  { label: "Show my cart", icon: "🛒" },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function WooshoAI() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const cta = colors.cta.primary;
  const ctaText = colors.cta.primaryText;

  const [isOpen, setIsOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);
  const [userRole, setUserRole] = useState("buyer");

  const [messages, setMessages] = useState([{
    id:"init", role:"assistant",
    text:"Hi! I'm Woosho AI.\n\nTell me what you're looking for — a budget, style, or product — and I'll find it from our live catalog instantly.",
    time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
    productIds:[], actions:[],
  }]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isLoading]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);

  const addToCart = useCallback((product) => {
    setCartItems(prev => prev.some(p => p.id === product.id) ? prev : [...prev, product]);
  }, []);
  const removeFromCart = useCallback((id) => setCartItems(prev => prev.filter(p => p.id !== id)), []);

  const handleCheckout = useCallback(() => {
    setIsOpen(false);
    navigate("/checkout");
  }, [navigate]);

  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;
    setInput("");

    const time = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    const userMsg = { id: Date.now(), role:"user", text, time, productIds:[], actions:[] };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // If user asks to see cart
    if (/\b(my cart|show cart|cart)\b/i.test(text)) {
      setIsLoading(false);
      setShowCart(true);
      setMessages(prev => [...prev, {
        id: Date.now()+1, role:"assistant",
        text: cartItems.length ? `You have ${cartItems.length} item${cartItems.length>1?"s":""} in your cart.` : "Your cart is empty. Want me to find something?",
        time, productIds:[], actions:[],
      }]);
      return;
    }

    const nextHistory = [...apiHistory, { role:"user", content: text }];
    setApiHistory(nextHistory);

    try {
      const { text: aiText, productIds, actions } = await callWooshoAI(nextHistory, userRole);

      // Handle add_to_cart actions
      actions?.filter(a => a.type === "add_to_cart").forEach(a => {
        const p = window.__WOOSHO_CACHE__?.[a.productId];
        if (p) addToCart(p);
      });

      // Handle checkout action
      if (actions?.some(a => a.type === "checkout")) {
        setTimeout(handleCheckout, 1200);
      }

      setMessages(prev => [...prev, {
        id: Date.now()+1, role:"assistant", text: aiText, productIds, actions, time,
      }]);
      setApiHistory(h => [...h, { role:"assistant", content: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now()+1, role:"assistant", isError:true,
        text:"Sorry, I couldn't connect right now. Please try again.", time, productIds:[], actions:[],
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiHistory, userRole, cartItems, addToCart, handleCheckout]);

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  // CSS vars for bubble bg / border used in TypingWave
  const bubbleBg = isDark ? colors.surface.elevated : "#fff";
  const bubbleBorder = colors.border.default;

  return (
    <>
      <style>{CSS}</style>
      <style>{`:root { --woo-bubble-bg:${bubbleBg}; --woo-border:${bubbleBorder}; }`}</style>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}
        onClick={() => setIsOpen(o => !o)}
        className="woo-trigger-btn"
        style={{ position:"fixed", bottom:24, right:24, zIndex:2147483646, width:60, height:60, borderRadius:"50%", background: isOpen ? "#1e1e1e" : cta, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 28px ${isOpen ? "rgba(0,0,0,0.4)" : cta+"66"}` }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={isOpen?"x":"spark"} initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.18}}>
            {isOpen ? <X size={22} color="#fff" /> : <Sparkles size={22} color={ctaText} fill={ctaText} />}
          </motion.div>
        </AnimatePresence>
        {!isOpen && cartItems.length > 0 && (
          <div style={{ position:"absolute", top:-3, right:-3, background:"#ef4444", color:"#fff", width:18, height:18, borderRadius:"50%", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid white" }}>
            {cartItems.length}
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity:0, y:60, scale:0.92 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:60, scale:0.92 }}
            transition={{ type:"spring", stiffness:380, damping:28 }}
            style={{
              position:"fixed", zIndex:2147483647,
              // Desktop: floating panel. Mobile: full screen
              bottom: "var(--woo-bottom, 96px)", right: "var(--woo-right, 24px)",
              width:"var(--woo-w, 370px)", height:"var(--woo-h, 580px)",
              maxWidth:"calc(100vw - 32px)", maxHeight:"calc(100dvh - 110px)",
              borderRadius:28, overflow:"hidden", display:"flex", flexDirection:"column",
              background:colors.surface.primary,
              border:`1px solid ${colors.border.subtle}`,
              boxShadow:"0 32px 80px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)",
            }}
            className="woo-panel"
          >
            {/* Header */}
            <div style={{ background:`linear-gradient(135deg, ${ACCENT} 0%, #7c3aed 100%)`, padding:"14px 16px", flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ position:"relative" }}>
                    <div style={{ width:40, height:40, borderRadius:13, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.2)" }}>
                      <Sparkles size={20} color="#fff" fill="#fff" />
                    </div>
                    <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", background:"#22c55e", border:"2px solid white" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:900, fontSize:17, color:"#fff", letterSpacing:"-0.01em" }}>Woosho AI</div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.65)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Live · Shopping Assistant</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(true)}
                  style={{ background:"rgba(255,255,255,0.14)", border:"none", borderRadius:11, padding:"7px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}
                >
                  <ShoppingCart size={15} color="#fff" />
                  {cartItems.length > 0 && <span style={{ fontSize:11, fontWeight:900, color:"#fff" }}>{cartItems.length}</span>}
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
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

              {/* Messages */}
              <div className="woo-scroll" style={{ flex:1, overflowY:"auto", padding:"16px 13px 8px", background: isDark ? colors.surface.secondary : "#f9f9fc" }}>
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id} msg={msg}
                    cartItems={cartItems} onAddToCart={addToCart}
                    onCheckout={handleCheckout}
                    colors={colors} cta={cta} ctaText={ctaText}
                  />
                ))}
                {isLoading && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <div style={{ width:22, height:22, borderRadius:7, background:cta, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Sparkles size={11} color={ctaText} fill={ctaText} />
                      </div>
                      <span style={{ fontSize:9, fontWeight:800, color:cta, textTransform:"uppercase", letterSpacing:"0.1em" }}>Woosho AI</span>
                    </div>
                    <TypingWave color={colors.text.tertiary} />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Prompts — show only on first message */}
              {messages.length <= 1 && !isLoading && (
                <div style={{ padding:"8px 13px 4px", display:"flex", gap:6, overflowX:"auto", flexShrink:0, background: isDark ? colors.surface.secondary : "#f9f9fc" }}>
                  {QUICK_PROMPTS.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q.label)}
                      style={{ flexShrink:0, padding:"6px 11px", borderRadius:99, background:colors.surface.elevated, border:`1px solid ${colors.border.default}`, fontSize:11, fontWeight:700, color:colors.text.secondary, cursor:"pointer", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5 }}
                    >
                      <span>{q.icon}</span>{q.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding:"10px 13px 14px", background:colors.surface.primary, borderTop:`1px solid ${colors.border.subtle}`, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, background: isDark ? colors.surface.tertiary : "#f3f4f6", borderRadius:20, padding:"7px 7px 7px 15px", border:`1.5px solid ${colors.border.default}`, transition:"border-color 0.2s" }}
                  onFocus={() => {}} >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything…"
                    disabled={isLoading}
                    style={{ flex:1, background:"transparent", border:"none", fontSize:13, color:colors.text.primary, outline:"none", fontFamily:"inherit" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim()}
                    style={{ width:34, height:34, borderRadius:13, border:"none", background: (input.trim() && !isLoading) ? `linear-gradient(135deg, ${ACCENT}, #7c3aed)` : colors.border.default, cursor: (input.trim() && !isLoading) ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 }}
                  >
                    {isLoading
                      ? <RefreshCw size={14} color="#fff" style={{ animation:"woo-wave 0.9s linear infinite" }} />
                      : <Send size={14} color="#fff" fill="#fff" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}