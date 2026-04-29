import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TiltCard from '../../Components/TiltCard';

const FEATURES = [
  {
    icon: "🧠",
    title: "AI Personalization",
    desc: "Every result is tailored to your taste, budget, and browsing history. The more you shop, the smarter it gets.",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80",
    accent: "#818cf8",
  },
  {
    icon: "⚡",
    title: "Instant Comparison",
    desc: "Compare prices, specs, and seller ratings across the entire catalog in real time — no tab switching.",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80",
    accent: "#38bdf8",
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    desc: "Bank-grade encryption on every transaction. Your payment details never leave our secure vault.",
    gradient: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    accent: "#34d399",
  },
  {
    icon: "🚀",
    title: "Fast Delivery",
    desc: "Same-day delivery in Lagos. Nationwide in 48 hours. Live tracking from warehouse to doorstep.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=400&q=80",
    accent: "#fbbf24",
  },
];


// FIX: removed duplicate gsap.registerPlugin(ScrollTrigger)


const SmartFeaturesSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.smart-feat-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 68%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-28 px-6 md:px-12" style={{ background: "#050508" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
            ✦ Platform Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Built for Smart Buyers
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Every feature is designed to make finding and buying things easier, faster, and smarter.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, i) => (
            <TiltCard
              key={i}
              className="smart-feat-card"
              style={{
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#111113",
                display: "flex",
                flexDirection: "column",
                cursor: "default",
                position: "relative",
              }}
            >
              {/* Image */}
              <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
                <img
                  src={feat.img}
                  alt={feat.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                  onError={e => { e.target.style.display = "none"; }}
                />
                {/* Gradient overlay */}
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, #111113 0%, transparent 60%)` }} />
                {/* Accent overlay */}
                <div style={{ position: "absolute", inset: 0, background: feat.gradient, opacity: 0.35 }} />
                {/* Icon */}
                <div style={{
                  position: "absolute", top: 16, left: 16,
                  width: 44, height: 44, borderRadius: 14,
                  background: "rgba(0,0,0,0.4)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  {feat.icon}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f9fafb", lineHeight: 1.3 }}>{feat.title}</h3>
                <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, flex: 1 }}>{feat.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: feat.accent }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: feat.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Always on</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartFeaturesSection;
