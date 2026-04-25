import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "../Context/theme/ThemeContext";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');
  .fb-wrap * { font-family: 'Inter', sans-serif; }

  @keyframes fb-shake {
    0%, 100% { transform: rotate(0deg); }
    15%  { transform: rotate(-8deg); }
    30%  { transform: rotate(8deg); }
    45%  { transform: rotate(-5deg); }
    60%  { transform: rotate(5deg); }
    75%  { transform: rotate(-2deg); }
    90%  { transform: rotate(2deg); }
  }
  .fb-icon { animation: fb-shake 3s ease-in-out infinite; transform-origin: top center; }

  @keyframes fb-pulse-ring {
    0%   { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  .fb-pulse { animation: fb-pulse-ring 2.5s ease-out infinite; }
  .fb-pulse-2 { animation: fb-pulse-ring 2.5s ease-out infinite; animation-delay: 0.9s; }

  @keyframes fb-scan-v {
    0%   { left: -5%; opacity: 1; }
    100% { left: 105%; opacity: 0; }
  }
  .fb-scan { animation: fb-scan-v 4s linear infinite; }

  @keyframes fb-float-bg {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-30px) scale(1.05); }
  }
  .fb-bg-blob { animation: fb-float-bg 8s ease-in-out infinite; }
`;

function ErrorCode({ label, value, color }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest mt-0.5 font-bold opacity-50">{label}</div>
    </div>
  );
}

export default function FallbackPage() {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();
  const accent = "#ef4444";
  const [count, setCount] = useState(3);

  // Auto-redirect countdown removed since this is a catch-all error, keep it manual
  const steps = [
    { icon: "🔍", label: "Diagnosing issue…", color: "#f97316" },
    { icon: "⚙️", label: "Attempting recovery…", color: "#eab308" },
    { icon: "✗", label: "Recovery failed", color: "#ef4444" },
  ];
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    if (stepIndex < 2) {
      const id = setTimeout(() => setStepIndex(s => s + 1), 900);
      return () => clearTimeout(id);
    }
  }, [stepIndex]);

  return (
    <div className="fb-wrap min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6"
      style={{ background: isDark ? "#0a0508" : "#fff5f5", color: colors.text.primary }}>
      <style>{CSS}</style>

      {/* Background blob */}
      <div className="fb-bg-blob absolute pointer-events-none rounded-full"
        style={{ width: 600, height: 600, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: `radial-gradient(circle, ${accent}0f 0%, transparent 70%)` }} />

      {/* Scan line */}
      <div className="fb-scan absolute top-0 bottom-0 w-px pointer-events-none"
        style={{ background: `linear-gradient(to bottom, transparent, ${accent}60, transparent)` }} />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Pulsing icon */}
        <div className="relative flex items-center justify-center mb-10" style={{ height: 130 }}>
          <div className="fb-pulse absolute w-20 h-20 rounded-full" style={{ background: `${accent}22` }} />
          <div className="fb-pulse-2 absolute w-20 h-20 rounded-full" style={{ background: `${accent}15` }} />
          <div className="fb-icon relative text-6xl z-10">💥</div>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-5 border"
            style={{ background: `${accent}15`, color: accent, borderColor: `${accent}30` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
            Critical Error
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight" style={{ color: colors.text.primary }}>
            Something broke.
          </h1>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.text.tertiary }}>
            An unexpected error occurred. Our system hit a wall — but don't worry, your data is safe.
          </p>
        </motion.div>

        {/* Diagnostic Steps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="rounded-2xl p-5 mb-8 text-left space-y-3 border"
          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">System Diagnostics</p>
          {steps.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= stepIndex ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.9 }}
              className="flex items-center gap-3"
            >
              <span className="text-lg">{s.icon}</span>
              <span className="text-sm font-medium flex-1" style={{ color: i <= stepIndex ? colors.text.primary : colors.text.tertiary }}>{s.label}</span>
              {i < stepIndex && <span className="text-xs font-bold" style={{ color: s.color }}>✓</span>}
              {i === stepIndex && i < 2 && (
                <svg className="w-3 h-3 animate-spin" style={{ color: s.color }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" opacity="0.75" />
                </svg>
              )}
              {i === 2 && stepIndex === 2 && <span className="text-xs font-bold" style={{ color: accent }}>✗</span>}
            </motion.div>
          ))}
        </motion.div>

        {/* Error info grid */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-2xl border"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}
        >
          <ErrorCode label="Code" value="500" color={accent} />
          <ErrorCode label="Type" value="Runtime" color={colors.text.secondary} />
          <ErrorCode label="Status" value="Failed" color="#f97316" />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => window.location.reload()}
            className="flex-1 min-w-[140px] py-4 rounded-2xl text-sm font-bold border transition-all"
            style={{ background: `${accent}18`, color: accent, borderColor: `${accent}40` }}
          >
            ↺ Try Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${accent}40` }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/", { replace: true })}
            className="flex-1 min-w-[140px] py-4 rounded-2xl text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${accent}, #dc2626)`, color: "#fff" }}
          >
            → Go Home
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="mt-8 text-[11px] leading-relaxed" style={{ color: colors.text.tertiary }}>
          If this keeps happening, <a href="/support" className="underline hover:opacity-80">contact support</a> or check our <a href="/status" className="underline hover:opacity-80">status page</a>.
        </motion.p>
      </div>
    </div>
  );
}