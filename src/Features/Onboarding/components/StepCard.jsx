import { motion, AnimatePresence } from "framer-motion";

export function StepCard({ step, title, subtitle, icon, status, isActive, role, onActivate, children }) {
  const done = status === "done";
  return (
    <motion.div layout transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`ob-step-card${isActive ? ` active ${role}` : done ? " done" : ""}`}>
      <button type="button" onClick={onActivate} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
        {/* Icon badge */}
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, transition: "all .25s",
          background: done ? "var(--green-bg)" : isActive && role === "buyer" ? "var(--teal-bg)" : isActive ? "var(--amber-bg)" : "var(--bg-3)",
          border: `1.5px solid ${done ? "var(--green-border)" : isActive && role === "buyer" ? "var(--teal-border)" : isActive ? "var(--amber-border)" : "var(--border)"}`,
        }}>
          {done
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3.5 7-6.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 20, animation: "ob-check .3s ease forwards" }} /></svg>
            : icon}
        </div>
        {/* Title area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, color: "var(--text)", lineHeight: 1.2 }}>{title}</p>
            {done && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" }}>Done</span>}
            {isActive && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: role === "buyer" ? "var(--teal-bg)" : "var(--amber-bg)", color: role === "buyer" ? "var(--teal)" : "var(--amber)", border: `1px solid ${role === "buyer" ? "var(--teal-border)" : "var(--amber-border)"}` }}>Now</span>}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{subtitle}</p>
        </div>
        {/* Chevron */}
        <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 22px 22px", borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
