import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function ProgressSidebar({ role, steps, completedSteps, currentStep, onStepClick }) {
  const navigate = useNavigate();
  const pct  = Math.round((completedSteps.length / steps.length) * 100);
  const done = completedSteps.length === steps.length;
  const R = 42, C = 2 * Math.PI * R;
  const accent = role === "buyer" ? "var(--teal)" : "var(--amber)";

  return (
    <div className="ob-sidebar" style={{ width: 272, flexShrink: 0, position: "sticky", top: 24, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Role badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <span style={{ fontSize: 18 }}>{role === "buyer" ? "🛍" : "🏪"}</span>
        <div>
          <p style={{ fontFamily: "var(--font-m)", fontSize: 9.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-3)" }}>Setting up as</p>
          <p style={{ fontFamily: "var(--font-b)", fontWeight: 600, fontSize: 13, color: "var(--text)", lineHeight: 1.2 }}>{role === "buyer" ? "Buyer Account" : "Seller Store"}</p>
        </div>
      </div>

      {/* Progress ring */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "26px 22px 20px", textAlign: "center" }}>
        <div style={{ position: "relative", width: 104, height: 104, margin: "0 auto 14px" }}>
          <svg width="104" height="104" viewBox="0 0 104 104" fill="none" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="52" cy="52" r={R} stroke="var(--border-2)" strokeWidth="5" />
            <motion.circle cx="52" cy="52" r={R} stroke={done ? "var(--green)" : accent} strokeWidth="5"
              strokeLinecap="round" strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (pct / 100) * C }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {done
              ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ob-float" style={{ fontSize: 30 }}>{role === "buyer" ? "🛍" : "🚀"}</motion.div>
              : <><span style={{ fontFamily: "var(--font-d)", fontWeight: 800, fontSize: 22, color: "var(--text)", lineHeight: 1 }}>{pct}%</span><span style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>done</span></>}
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 3 }}>
          {done ? (role === "buyer" ? "Ready to shop! 🎉" : "Store is live! 🎉") : pct === 0 ? "Let's go!" : "Great progress"}
        </p>
        <p style={{ fontSize: 12.5, color: "var(--text-3)", lineHeight: 1.5 }}>
          {done ? "Head to your dashboard." : `${steps.length - completedSteps.length} step${steps.length - completedSteps.length !== 1 ? "s" : ""} remaining`}
        </p>
      </div>

      {/* Checklist */}
      <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 18px" }}>
        <p style={{ fontFamily: "var(--font-m)", fontSize: 9.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>Checklist</p>
        {steps.map((step, i) => {
          const isDone   = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          return (
            <div key={step.id}>
              <button type="button" onClick={() => onStepClick(step.id)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "7px 0", opacity: isDone ? 0.6 : 1 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .25s",
                  background: isDone ? "var(--green-bg)" : isActive ? (role === "buyer" ? "var(--teal-bg)" : "var(--amber-bg)") : "var(--bg-3)",
                  border: `1.5px solid ${isDone ? "var(--green-border)" : isActive ? (role === "buyer" ? "var(--teal-border)" : "var(--amber-border)") : "var(--border-2)"}`,
                }}>
                  {isDone
                    ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : isActive
                      ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: role === "buyer" ? "var(--teal)" : "var(--amber)" }} className="ob-pulse-dot" />
                      : <span style={{ fontFamily: "var(--font-m)", fontSize: 9, fontWeight: 600, color: "var(--text-3)" }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--text)" : isDone ? "var(--text-3)" : "var(--text-2)" }}>
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && <div style={{ width: 1, height: 12, marginLeft: 9, background: isDone ? (role === "buyer" ? "rgba(45,212,191,.2)" : "rgba(245,166,35,.2)") : "var(--border)" }} />}
            </div>
          );
        })}
      </div>

      {/* CTA when done */}
      <AnimatePresence>
        {done && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`ob-btn-primary ${role}`}
            style={{ width: "100%", justifyContent: "center", padding: 13 }}
            onClick={() => { navigate('/account') }}>
            {role === "buyer" ? "🛍 Start Shopping" : "🏪 Open Dashboard"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
