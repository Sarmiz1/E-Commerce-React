// src/components/Footer.jsx
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import GoldLine from "./FooterComponents/GoldLine";
import FooterOrbs from "./FooterComponents/FooterOrbs";
import MainLinksGrid from "./FooterComponents/MainLinksGrid";
import BottomBar from "./FooterComponents/BottomBar";

export default function Footer() {
  const canvasRef = useRef(null);

  // Subtle starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
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
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <footer
      id="footer"
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #09090b 0%, #0c0c0f 40%, #080808 100%)",
      }}
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Floating orbs */}
      <FooterOrbs />

      {/* Top gold shimmer border */}
      <GoldLine />

      {/* ── MAIN LINKS GRID ── */}
      <MainLinksGrid />

      {/* ── DIVIDER ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <GoldLine />
      </div>

      {/* ── BOTTOM BAR ── */}
      <BottomBar />

      {/* Bottom gold shimmer border */}
      <GoldLine />
    </footer>
  );
}
