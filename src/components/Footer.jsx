// src/components/Footer.jsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = {
  Shop: ["New Arrivals", "Trending Now", "Flash Sales", "Members Only", "Gift Cards"],
  Company: ["About ShopEase", "Careers", "Press & Media", "Sustainability", "Investors"],
  Support: ["Help Center", "Track Your Order", "Returns & Exchanges", "Size Guide", "Contact Us"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Settings", "Accessibility", "Sitemap"],
};

const SOCIALS = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
];

const PAYMENT_ICONS = ["VISA", "MC", "AMEX", "PayPal", "Apple Pay", "GPay"];

// Animated shimmer line
function GoldLine() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 footer-shimmer-line" />
    </div>
  );
}

// Animated floating orbs for footer
function FooterOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] bg-amber-400 -top-40 -left-40 footer-orb-1" />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05] bg-blue-500 top-20 right-0 footer-orb-2" />
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.06] bg-amber-300 bottom-0 left-1/2 footer-orb-3" />
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredCol, setHoveredCol] = useState(null);
  const canvasRef = useRef(null);

  // Subtle starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.4 + 0.05,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const pulse = s.opacity + Math.sin(t * s.speed * 60 + s.phase) * 0.08;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${Math.max(0, Math.min(0.5, pulse))})`;
        ctx.fill();
      });
      t++;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const handleSubscribe = () => {
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <footer
      id="footer"
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #09090b 0%, #0c0c0f 40%, #080808 100%)" }}
    >
      <style>{`
        @keyframes footer-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .footer-shimmer-line { animation: footer-shimmer 3.5s ease-in-out infinite; width: 25%; }

        @keyframes footer-orb-float-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px,-30px) scale(1.08); }
        }
        @keyframes footer-orb-float-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px,25px) scale(0.95); }
        }
        @keyframes footer-orb-float-3 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(20px,-20px); }
        }
        .footer-orb-1 { animation: footer-orb-float-1 18s ease-in-out infinite; }
        .footer-orb-2 { animation: footer-orb-float-2 22s ease-in-out infinite; }
        .footer-orb-3 { animation: footer-orb-float-3 16s ease-in-out infinite; }

        .footer-link {
          position: relative;
          display: inline-block;
          color: #6b7280;
          font-size: 0.8125rem;
          letter-spacing: 0.02em;
          transition: color 0.25s;
          padding: 2px 0;
        }
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: linear-gradient(90deg, #c9a84c, #f0d080);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .footer-link:hover { color: #c9a84c; }
        .footer-link:hover::after { width: 100%; }

        .gold-text {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 40%, #c9a84c 70%, #a07830 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .footer-social-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #6b7280;
          transition: all 0.3s;
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(8px);
        }
        .footer-social-btn:hover {
          border-color: rgba(201,168,76,0.7);
          color: #c9a84c;
          background: rgba(201,168,76,0.07);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(201,168,76,0.15);
        }

        .payment-chip {
          padding: 4px 10px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          background: rgba(255,255,255,0.03);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #4b5563;
          transition: border-color 0.2s, color 0.2s;
        }
        .payment-chip:hover { border-color: rgba(201,168,76,0.3); color: #9ca3af; }
      `}</style>

      {/* Starfield canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80" />

      {/* Floating orbs */}
      <FooterOrbs />

      {/* Top gold shimmer border */}
      <GoldLine />

      {/* ── NEWSLETTER HERO BAND ── */}
      <div className="relative z-10 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left copy */}
          <div className="md:max-w-md">
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-amber-500/80 mb-3">
              Private Access
            </p>
            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3" style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
              Join the Inner{" "}
              <span className="gold-text">Circle</span>
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Early access to drops, members-only pricing, and curated style edits — delivered before anyone else knows they exist.
            </p>
          </div>

          {/* Right input */}
          <div className="w-full md:w-auto md:min-w-[380px]">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="relative flex items-center gap-0">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                      placeholder="your@email.com"
                      className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm px-5 py-4 rounded-l-2xl focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubscribe}
                    className="px-6 py-4 rounded-r-2xl font-bold text-sm tracking-widest uppercase text-black whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)", backgroundSize: "200% auto" }}
                  >
                    Subscribe
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                  <span className="text-2xl">✦</span>
                  <div>
                    <p className="text-white font-bold text-sm">Welcome to the Circle</p>
                    <p className="text-gray-500 text-xs mt-0.5">Your first exclusive drop is on its way.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-gray-700 text-[11px] mt-3 tracking-wide">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN LINKS GRID ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">

          {/* Brand column — takes 2 cols */}
          <div className="col-span-2">
            {/* Logo wordmark */}
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-amber-500/60 mb-1">Est. 2024</p>
              <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
                <span className="gold-text">Shop</span>
                <span className="text-white">Ease</span>
              </h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-[220px]">
              Redefining premium commerce. Curated with intention, delivered with precision.
            </p>

            {/* Trust badges */}
            <div className="space-y-3 mb-8">
              {[
                { icon: "⬡", text: "Verified Luxury Retailer" },
                { icon: "◈", text: "SSL Secured & Encrypted" },
                { icon: "◇", text: "2M+ Satisfied Members" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2.5">
                  <span className="text-amber-500/70 text-xs">{badge.icon}</span>
                  <span className="text-gray-600 text-xs tracking-wide">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-3 flex-wrap">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name} className="footer-social-btn">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([col, links], idx) => (
            <div key={col} onMouseEnter={() => setHoveredCol(col)} onMouseLeave={() => setHoveredCol(null)}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 transition-colors duration-300"
                style={{ color: hoveredCol === col ? "#c9a84c" : "#374151" }}>
                {col}
              </h4>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="footer-link">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <GoldLine />
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-gray-700 text-xs tracking-widest uppercase">
              © {new Date().getFullYear()} ShopEase Inc.
            </p>
            <span className="hidden md:block text-gray-800">·</span>
            <p className="text-gray-800 text-xs tracking-wide">All rights reserved.</p>
          </div>

          {/* Payment methods */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-gray-700 text-[10px] tracking-widest uppercase mr-1">We accept</span>
            {PAYMENT_ICONS.map((p) => (
              <span key={p} className="payment-chip">{p}</span>
            ))}
          </div>

          {/* Tagline */}
          <p className="text-gray-800 text-[10px] tracking-[0.25em] uppercase hidden lg:block">
            Crafted for the discerning ✦
          </p>
        </div>
      </div>

      {/* Bottom gold shimmer border */}
      <GoldLine />
    </footer>
  );
}