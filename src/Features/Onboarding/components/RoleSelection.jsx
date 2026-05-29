import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "./SharedUI";

export function RoleSelection({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const choose = async (role) => {
    if (confirming) return;
    setSelected(role);
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 480));
    onSelect(role);
  };

  const BUYER_PERKS = ["Browse thousands of verified sellers", "Wishlist & save your favourites", "Real-time order tracking", "Secure checkout, always"];
  const SELLER_PERKS = ["Launch your storefront in minutes", "Reach buyers across Africa & beyond", "Built-in analytics & order tools", "Get paid within 24–48 hrs"];

  const cardVariants = {
    initial:  { opacity: 0, y: 28 },
    animate:  (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] } }),
    exit:     (role) => ({
      opacity: 0, scale: selected === role ? 1.04 : 0.94, y: selected === role ? -12 : 8,
      transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 28, background: "var(--amber)", opacity: 0.5 }} />
            <span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 22, color: "var(--amber)", letterSpacing: "-0.02em" }}>Woosho</span>
            <div style={{ height: 1, width: 28, background: "var(--amber)", opacity: 0.5 }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: "clamp(30px, 5vw, 48px)", color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            What do you want to do
            <br />on Woosho?
          </h1>
          <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "var(--text-2)", maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
            Choose your path — you can always add the other role from your dashboard.
          </p>
        </motion.div>

        {/* Role cards */}
        <AnimatePresence mode="wait">
          {!confirming ? (
            <div className="ob-role-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Buyer card */}
              <motion.div custom={0} variants={cardVariants} initial="initial" animate="animate"
                className={`ob-role-card buyer${selected === "buyer" ? " selected" : ""}`}
                onMouseEnter={() => setHovered("buyer")} onMouseLeave={() => setHovered(null)}
                onClick={() => choose("buyer")}>
                {/* Emoji badge */}
                <div className="ob-role-emoji" style={{
                  width: 80, height: 80, borderRadius: 20, marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44,
                  background: "var(--teal-bg)", border: "1.5px solid var(--teal-border)",
                  transition: "box-shadow .25s",
                }}>🛍</div>
                {/* Title */}
                <h2 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 24, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.1 }}>
                  Shop as a Buyer
                </h2>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 13.5, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.55 }}>
                  Discover unique products from verified sellers across Africa and the world.
                </p>
                {/* Perks */}
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                  {BUYER_PERKS.map((p) => (
                    <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--teal-bg)", border: "1px solid var(--teal-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="var(--teal)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>{p}</span>
                    </li>
                  ))}
                </ul>
                {/* CTA pill */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", background: "var(--teal-bg)", border: "1.5px solid var(--teal-border)", borderRadius: 11, transition: "all .2s" }}>
                  <span style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13.5, color: "var(--teal)" }}>Start shopping</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="var(--teal)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </motion.div>

              {/* Seller card */}
              <motion.div custom={1} variants={cardVariants} initial="initial" animate="animate"
                className={`ob-role-card seller${selected === "seller" ? " selected" : ""}`}
                onMouseEnter={() => setHovered("seller")} onMouseLeave={() => setHovered(null)}
                onClick={() => choose("seller")}>
                <div className="ob-role-emoji" style={{
                  width: 80, height: 80, borderRadius: 20, marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44,
                  background: "var(--amber-bg)", border: "1.5px solid var(--amber-border)",
                  transition: "box-shadow .25s",
                }}>🏪</div>
                <h2 style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 24, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1.1 }}>
                  Start Selling
                </h2>
                <p style={{ fontFamily: "var(--font-b)", fontSize: 13.5, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.55 }}>
                  Open your store on Woosho and sell to millions of buyers — in minutes, not days.
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                  {SELLER_PERKS.map((p) => (
                    <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--amber-bg)", border: "1px solid var(--amber-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="var(--amber)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>{p}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", background: "var(--amber-bg)", border: "1.5px solid var(--amber-border)", borderRadius: 11, transition: "all .2s" }}>
                  <span style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13.5, color: "var(--amber)" }}>Open my store</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: selected === "buyer" ? "var(--teal-bg)" : "var(--amber-bg)", border: `2px solid ${selected === "buyer" ? "var(--teal-border)" : "var(--amber-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {selected === "buyer" ? "🛍" : "🏪"}
              </div>
              <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
                Setting up your {selected === "buyer" ? "buyer" : "seller"} account…
              </p>
              <Spinner s={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
