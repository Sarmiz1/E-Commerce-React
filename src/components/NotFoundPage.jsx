import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "../Context/theme/ThemeContext";


const particles = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 4 + 3,
  delay: Math.random() * 5,
}));


const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');
  .nf-wrap * { font-family: 'Inter', sans-serif; }

  @keyframes nf-float {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50%       { transform: translateY(-22px) rotate(2deg); }
  }
  .nf-float { animation: nf-float 5s ease-in-out infinite; }

  @keyframes nf-glitch-1 {
    0%, 90%, 100% { transform: translate(0); clip-path: none; }
    92% { transform: translate(-4px, 2px); clip-path: inset(0 0 60% 0); }
    94% { transform: translate(4px, -2px); clip-path: inset(40% 0 20% 0); }
    96% { transform: translate(-2px, 0); clip-path: inset(20% 0 50% 0); }
    98% { transform: translate(2px, -3px); clip-path: inset(70% 0 10% 0); }
  }
  @keyframes nf-glitch-2 {
    0%, 90%, 100% { transform: translate(0); clip-path: none; opacity: 0; }
    91% { opacity: 1; transform: translate(6px, -2px); clip-path: inset(10% 0 70% 0); }
    93% { transform: translate(-6px, 2px); clip-path: inset(60% 0 10% 0); }
    95% { transform: translate(3px, 0); clip-path: inset(30% 0 40% 0); }
    99% { opacity: 0; }
  }
  .nf-404 { animation: nf-glitch-1 6s ease-in-out infinite; }
  .nf-404-ghost {
    position: absolute; inset: 0; color: #ec4899;
    animation: nf-glitch-2 6s ease-in-out infinite;
  }

  @keyframes nf-scan {
    0%   { top: -5%; opacity: 0.8; }
    100% { top: 105%; opacity: 0; }
  }
  .nf-scan { animation: nf-scan 3.5s linear infinite; }

  @keyframes nf-particle {
    0%   { transform: translateY(0) scale(1); opacity: 0.7; }
    100% { transform: translateY(-80px) scale(0); opacity: 0; }
  }

  @keyframes nf-orbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  .nf-orbit-1 { animation: nf-orbit 6s linear infinite; }
  .nf-orbit-2 { animation: nf-orbit 9s linear infinite reverse; }
  .nf-orbit-3 { animation: nf-orbit 12s linear infinite; animation-delay: -4s; }
`;

function ParticleField({ accent }) {


  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={p?.id || i}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: accent }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.5, 0], scale: [1, 1.5, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function OrbitalRing({ accent }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative" style={{ width: 300, height: 300 }}>
        {/* Ring */}
        <div className="absolute inset-0 rounded-full border" style={{ borderColor: `${accent}20` }} />
        <div className="absolute inset-8 rounded-full border" style={{ borderColor: `${accent}15` }} />
        {/* Orbiting dots */}
        {[0, 1, 2].map(i => (
          <div key={i} className={`nf-orbit-${i + 1}`}
            style={{ position: "absolute", top: "50%", left: "50%", marginTop: -5, marginLeft: -5 }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent, opacity: 0.7 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();
  const [typed, setTyped] = useState("");
  const fullText = "Page not found. Lost in the void.";
  const accent = "#6366f1";

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++; }
      else clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, []);

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "AI Shop", to: "/ai-shop" },
    { label: "Support", to: "/support" },
  ];

  return (
    <div className="nf-wrap min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6"
      style={{ background: isDark ? "#060610" : "#f8f8ff", color: colors.text.primary }}>
      <style>{CSS}</style>
      <ParticleField accent={accent} />
      <OrbitalRing accent={accent} />

      {/* Scan line */}
      <div className="nf-scan absolute left-0 right-0 h-px pointer-events-none" style={{ background: `linear-gradient(to right, transparent, ${accent}80, transparent)` }} />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-block mb-6"
        >
          <div className="nf-404 relative font-black select-none"
            style={{ fontSize: "clamp(7rem, 22vw, 14rem)", lineHeight: 0.9, letterSpacing: "-0.04em", color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }}>
            404
          </div>
          <div className="nf-404-ghost font-black select-none"
            style={{ fontSize: "clamp(7rem, 22vw, 14rem)", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl nf-float">👾</div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-3xl font-black mb-3" style={{ color: colors.text.primary }}>
            You're lost in deep space.
          </h1>
          <p className="text-sm font-mono mb-8 min-h-[1.5em]" style={{ color: `${accent}cc` }}>
            {typed}<span className="animate-pulse">_</span>
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap gap-3 justify-center mb-10"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${accent}66` }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 rounded-full text-sm font-bold border"
            style={{ borderColor: `${accent}60`, color: accent, background: `${accent}10` }}
          >
            ← Go Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${accent}66` }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
            className="px-8 py-3.5 rounded-full text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${accent}, #a855f7)`, color: "#fff" }}
          >
            Take Me Home →
          </motion.button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {quickLinks.map(({ label, to }) => (
            <Link key={label} to={to}
              className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-80"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: colors.text.secondary, border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}` }}>
              {label}
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}