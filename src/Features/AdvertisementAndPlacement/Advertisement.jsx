import { useState, useRef, useEffect, useCallback } from "react";

/* ─── FONTS & GLOBAL STYLES ─────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0a0a08;
    --ink2: #141410;
    --ink3: #1e1e1a;
    --gold: #C9A84C;
    --gold2: #E8C46A;
    --gold-dim: rgba(201,168,76,0.18);
    --white: #F5F3EE;
    --white2: rgba(245,243,238,0.72);
    --white3: rgba(245,243,238,0.38);
    --white4: rgba(245,243,238,0.12);
    --red: #E8433A;
    --teal: #0F7B6C;
    --serif: 'Cormorant Garamond', Georgia, serif;
    --sans: 'DM Sans', sans-serif;
    --mono: 'DM Mono', monospace;
    --radius: 16px;
    --grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  html { scroll-behavior: smooth; }
  body { background: var(--ink); color: var(--white); font-family: var(--sans); -webkit-font-smoothing: antialiased; }

  ::selection { background: var(--gold); color: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes borderGlow {
    0%, 100% { border-color: rgba(201,168,76,0.3); }
    50%       { border-color: rgba(201,168,76,0.8); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
`;

/* ─── UTILS ─────────────────────────────────────────────────────────────────── */
function useInView(ref, threshold = 0.12) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

function AnimCount({ target, suffix = "", prefix = "", duration = 1800, visible }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const isFloat = String(target).includes(".");
    const num = parseFloat(target);
    const start = performance.now();
    const frame = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = isFloat ? (num * ease).toFixed(1) : Math.round(num * ease);
      setVal(cur);
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [visible, target]);
  return <span>{prefix}{val}{suffix}</span>;
}

/* ─── SECTION WRAPPER ────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const v = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── EYEBROW ────────────────────────────────────────────────────────────── */
function Eyebrow({ label, color = "var(--gold)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ display: "inline-block", width: 24, height: 1.5, background: color }} />
      <span style={{
        fontFamily: "var(--mono)", fontSize: 9, fontWeight: 500,
        letterSpacing: 3, textTransform: "uppercase", color,
      }}>{label}</span>
    </div>
  );
}

/* ─── DIVIDER ────────────────────────────────────────────────────────────── */
function GoldDivider() {
  return <div style={{ height: 1, background: "linear-gradient(to right, transparent, var(--gold-dim) 40%, var(--gold-dim) 60%, transparent)", margin: "80px 0" }} />;
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function AdvertisePage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activePlan, setActivePlan] = useState("Growth");
  const [hovered, setHovered] = useState(null);

  /* section refs */
  const whyRef = useRef(null);
  const audienceRef = useRef(null);
  const formatsRef = useRef(null);
  const howRef = useRef(null);
  const targetRef = useRef(null);
  const analyticsRef = useRef(null);
  const pricingRef = useRef(null);
  const storiesRef = useRef(null);
  const faqRef = useRef(null);

  const whyVis = useInView(whyRef);
  const audienceVis = useInView(audienceRef);
  const formatsVis = useInView(formatsRef);
  const howVis = useInView(howRef);
  const targetVis = useInView(targetRef);
  const analyticsVis = useInView(analyticsRef);
  const pricingVis = useInView(pricingRef);
  const storiesVis = useInView(storiesRef);
  const faqVis = useInView(faqRef);

  /* nav active */
  const [activeNav, setActiveNav] = useState("why");
  const navSections = { why: whyRef, formats: formatsRef, pricing: pricingRef, faq: faqRef };
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); });
    }, { threshold: 0.25, rootMargin: "-15% 0px -60% 0px" });
    Object.entries(navSections).forEach(([, r]) => r.current && obs.observe(r.current));
    return () => obs.disconnect();
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,8,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--white4)",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--white)", letterSpacing: -0.3 }}>
              Woo<span style={{ color: "var(--gold)" }}>Sho</span>
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", background: "var(--gold-dim)", padding: "3px 8px", borderRadius: 4, marginLeft: 6 }}>
              Ads
            </span>
          </div>

          <div style={{ display: "flex", gap: 0 }}>
            {[["why", "Why Woosho"], ["formats", "Ad Formats"], ["pricing", "Pricing"], ["faq", "FAQ"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{
                background: "none", border: "none",
                borderBottom: activeNav === id ? "2px solid var(--gold)" : "2px solid transparent",
                padding: "18px 16px", fontSize: 11, fontWeight: 600,
                color: activeNav === id ? "var(--gold)" : "var(--white3)",
                cursor: "pointer", letterSpacing: 0.3,
                transition: "color 0.2s, border-color 0.2s",
                fontFamily: "var(--sans)",
              }}>{label}</button>
            ))}
          </div>

          <button style={{
            background: "var(--gold)", border: "none", borderRadius: 8,
            padding: "10px 20px", fontSize: 11, fontWeight: 700,
            color: "var(--ink)", cursor: "pointer", letterSpacing: 0.8,
            textTransform: "uppercase", fontFamily: "var(--sans)",
          }}>
            Start Advertising
          </button>
        </div>
      </nav>

      {/* ── MARQUEE ── */}
      <div style={{
        background: "var(--gold)", padding: "8px 0", overflow: "hidden",
        borderBottom: "1px solid rgba(201,168,76,0.4)",
      }}>
        <div style={{ display: "flex", animation: "marquee 28s linear infinite", width: "max-content" }}>
          {Array(4).fill(null).map((_, gi) => (
            <span key={gi} style={{ display: "flex", gap: 0 }}>
              {["Sponsored Products", "Homepage Banners", "Search Ads", "Curated Collections", "Sponsored Stores", "Category Banners", "Flash Deal Placements", "Editor's Pick Slots"].map((t, i) => (
                <span key={i} style={{
                  fontFamily: "var(--mono)", fontSize: 9, fontWeight: 500,
                  color: "var(--ink)", letterSpacing: 2, textTransform: "uppercase",
                  padding: "0 32px", whiteSpace: "nowrap",
                  borderRight: "1px solid rgba(10,10,8,0.2)",
                }}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── HERO ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "92vh", display: "flex", flexDirection: "column",
        justifyContent: "center",
        position: "relative", overflow: "hidden",
        padding: "80px 40px 80px",
        background: "var(--ink)",
      }}>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(var(--white4) 1px, transparent 1px), linear-gradient(90deg, var(--white4) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.25,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
        }} />

        {/* Glow orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "15%",
          width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%",
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1160, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 60, alignItems: "center" }}>

            {/* Left */}
            <div>
              <div style={{ animation: "fadeUp 0.8s ease both", animationDelay: "0.1s" }}>
                <Eyebrow label="WooSho Advertising Platform" />
              </div>

              <h1 style={{
                fontFamily: "var(--serif)", fontSize: "clamp(44px, 5.8vw, 80px)",
                fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.05,
                color: "var(--white)",
                animation: "fadeUp 0.8s ease both", animationDelay: "0.2s",
                marginBottom: 28,
              }}>
                Reach buyers<br />
                <em style={{ color: "var(--gold)", fontStyle: "italic" }}>when they're ready</em><br />
                to purchase.
              </h1>

              <p style={{
                fontSize: 16, color: "var(--white2)", lineHeight: 1.8,
                maxWidth: 520, marginBottom: 44,
                animation: "fadeUp 0.8s ease both", animationDelay: "0.35s",
              }}>
                Promote products, stores, and collections across Woosho's marketplace with targeted placements that drive visibility, clicks, and measurable sales.
              </p>

              <div style={{
                display: "flex", gap: 12,
                animation: "fadeUp 0.8s ease both", animationDelay: "0.5s",
              }}>
                <button style={{
                  background: "var(--gold)", border: "none", borderRadius: 10,
                  padding: "15px 32px", fontSize: 13, fontWeight: 700,
                  color: "var(--ink)", cursor: "pointer", letterSpacing: 0.8,
                  textTransform: "uppercase", fontFamily: "var(--sans)",
                  boxShadow: "0 0 32px rgba(201,168,76,0.3)",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
                  onMouseEnter={e => { e.target.style.boxShadow = "0 0 48px rgba(201,168,76,0.5)"; e.target.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.target.style.boxShadow = "0 0 32px rgba(201,168,76,0.3)"; e.target.style.transform = "none"; }}
                >
                  Start Advertising
                </button>
                <button
                  onClick={() => scrollTo("pricing")}
                  style={{
                    background: "transparent", border: "1px solid var(--white4)",
                    borderRadius: 10, padding: "15px 28px", fontSize: 13,
                    fontWeight: 600, color: "var(--white2)", cursor: "pointer",
                    letterSpacing: 0.5, fontFamily: "var(--sans)",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "var(--gold-dim)"; e.target.style.color = "var(--gold)"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "var(--white4)"; e.target.style.color = "var(--white2)"; }}
                >
                  View Pricing →
                </button>
              </div>

              {/* Social proof strip */}
              <div style={{
                display: "flex", gap: 32, marginTop: 52,
                animation: "fadeUp 0.8s ease both", animationDelay: "0.65s",
              }}>
                {[["2,800+", "Active Stores"], ["₦2.8B+", "Marketplace GMV"], ["98%", "Seller Satisfaction"]].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--gold)", letterSpacing: -0.5 }}>{val}</div>
                    <div style={{ fontSize: 10, color: "var(--white3)", marginTop: 3, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard preview card */}
            <div style={{
              animation: "fadeIn 1s ease both", animationDelay: "0.4s",
            }}>
              <HeroDashboardCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── WHY WOOSHO ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section id="why" ref={whyRef} style={{ padding: "100px 40px", background: "var(--ink2)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{
            opacity: whyVis ? 1 : 0, transform: whyVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            marginBottom: 60,
          }}>
            <Eyebrow label="Why Advertise" />
            <h2 style={{
              fontFamily: "var(--serif)", fontSize: "clamp(32px, 4vw, 54px)",
              fontWeight: 600, letterSpacing: -1, color: "var(--white)",
              lineHeight: 1.1, maxWidth: 540,
            }}>
              The marketplace that converts.
            </h2>
            <p style={{ fontSize: 15, color: "var(--white3)", maxWidth: 500, lineHeight: 1.8, marginTop: 16 }}>
              Every user on Woosho is already in purchase mode. Your ad reaches an audience with wallet open.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}>
            {WHY_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={i * 80}>
                <WhyCard card={card} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── AUDIENCE STATS ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section ref={audienceRef} style={{
        padding: "100px 40px",
        background: "var(--ink)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,168,76,0.04) 0%, transparent 70%)",
        }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            opacity: audienceVis ? 1 : 0, transform: audienceVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s, transform 0.6s", marginBottom: 64,
            textAlign: "center",
          }}>
            <Eyebrow label="Our Audience" />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1 }}>
              Millions of moments.<br />
              <em style={{ color: "var(--gold)", fontStyle: "italic" }}>One marketplace.</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--white4)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {AUDIENCE_STATS.map((s, i) => (
              <div key={s.label} style={{
                background: "var(--ink2)", padding: "44px 36px",
                borderRight: i % 3 < 2 ? "none" : "none",
                opacity: audienceVis ? 1 : 0,
                transform: audienceVis ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms`,
              }}>
                <div style={{ fontSize: 10, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 700, letterSpacing: -1.5, color: "var(--white)", lineHeight: 1 }}>
                  <AnimCount target={s.num} suffix={s.suffix} prefix={s.prefix} visible={audienceVis} />
                </div>
                <p style={{ fontSize: 12, color: "var(--white3)", marginTop: 10, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── AD FORMATS ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section id="formats" ref={formatsRef} style={{ padding: "100px 40px", background: "var(--ink2)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{
            opacity: formatsVis ? 1 : 0, transform: formatsVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s, transform 0.6s", marginBottom: 64,
          }}>
            <Eyebrow label="Ad Inventory" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1 }}>
                Every placement.<br />Every surface.
              </h2>
              <p style={{ fontSize: 14, color: "var(--white3)", maxWidth: 320, lineHeight: 1.7, textAlign: "right" }}>
                Six ad formats spanning every touchpoint in the buyer journey — from first visit to checkout.
              </p>
            </div>
          </div>

          {/* Priority featured formats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {AD_FORMATS.slice(0, 2).map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <AdFormatCard format={f} large />
              </Reveal>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {AD_FORMATS.slice(2).map((f, i) => (
              <Reveal key={f.title} delay={80 + i * 60}>
                <AdFormatCard format={f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── HOW IT WORKS ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section ref={howRef} style={{
        padding: "100px 40px",
        background: "var(--ink)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{
            opacity: howVis ? 1 : 0, transform: howVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s, transform 0.6s", marginBottom: 64, textAlign: "center",
          }}>
            <Eyebrow label="Process" />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1 }}>
              Launch in four steps.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, position: "relative" }}>
            {/* Connector line */}
            <div style={{
              position: "absolute", top: 44, left: "12.5%", right: "12.5%", height: 1,
              background: "linear-gradient(to right, transparent, var(--gold-dim) 20%, var(--gold-dim) 80%, transparent)",
              zIndex: 0,
            }} />
            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100} style={{ position: "relative", zIndex: 1 }}>
                <HowStep step={step} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── TARGETING ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section ref={targetRef} style={{ padding: "100px 40px", background: "var(--ink2)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{
            opacity: targetVis ? 1 : 0, transform: targetVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s, transform 0.6s", marginBottom: 64,
          }}>
            <Eyebrow label="Targeting" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1 }}>
                Reach exactly<br />the right buyer.
              </h2>
              <p style={{ fontSize: 14, color: "var(--white3)", maxWidth: 300, lineHeight: 1.7, textAlign: "right" }}>
                Four targeting dimensions. Infinite precision. No wasted spend.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {TARGETING.map((t, i) => (
              <Reveal key={t.type} delay={i * 80}>
                <TargetingCard data={t} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── ANALYTICS PREVIEW ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section ref={analyticsRef} style={{
        padding: "100px 40px", background: "var(--ink)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 60% at 80% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)",
        }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div style={{
              opacity: analyticsVis ? 1 : 0, transform: analyticsVis ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.6s, transform 0.6s",
            }}>
              <Eyebrow label="Performance Analytics" />
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1, marginBottom: 20 }}>
                Every metric that matters, in real time.
              </h2>
              <p style={{ fontSize: 14, color: "var(--white3)", lineHeight: 1.8, marginBottom: 32 }}>
                Track performance from impression to conversion. See exactly what's driving revenue — and what isn't. Adjust spend with one click.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {METRICS.map((m, i) => (
                  <div key={m.label} style={{
                    padding: "14px 16px",
                    background: "var(--ink2)", borderRadius: 10,
                    border: "1px solid var(--white4)",
                    opacity: analyticsVis ? 1 : 0,
                    transform: analyticsVis ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms`,
                  }}>
                    <div style={{ fontSize: 10, fontFamily: "var(--mono)", letterSpacing: 1.5, color: "var(--white3)", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--gold)" }}>{m.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <Reveal delay={150}>
              <AnalyticsDashboardCard visible={analyticsVis} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── PRICING ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={{ padding: "100px 40px", background: "var(--ink2)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{
            opacity: pricingVis ? 1 : 0, transform: pricingVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s, transform 0.6s", marginBottom: 64, textAlign: "center",
          }}>
            <Eyebrow label="Pricing" />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1, marginBottom: 16 }}>
              Plans for every ambition.
            </h2>
            <p style={{ fontSize: 14, color: "var(--white3)", maxWidth: 440, margin: "0 auto", lineHeight: 1.8 }}>
              Start small, scale fast. No lock-in contracts. Cancel or upgrade anytime.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80}>
                <PricingCard
                  plan={plan}
                  active={activePlan === plan.name}
                  onSelect={() => setActivePlan(plan.name)}
                />
              </Reveal>
            ))}
          </div>

          {/* CPC / CPM note */}
          <Reveal delay={240}>
            <div style={{
              marginTop: 28, padding: "20px 28px",
              background: "var(--gold-dim)", borderRadius: 12,
              border: "1px solid rgba(201,168,76,0.2)",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <p style={{ fontSize: 13, color: "var(--white2)", lineHeight: 1.7, margin: 0 }}>
                All plans support <strong style={{ color: "var(--gold)" }}>CPC</strong> (Cost Per Click), <strong style={{ color: "var(--gold)" }}>CPM</strong> (Per 1,000 Impressions), and <strong style={{ color: "var(--gold)" }}>Sponsored Listings</strong>. Choose the model that fits your goal.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── SUCCESS STORIES ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section ref={storiesRef} style={{ padding: "100px 40px", background: "var(--ink)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{
            opacity: storiesVis ? 1 : 0, transform: storiesVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s, transform 0.6s", marginBottom: 64,
          }}>
            <Eyebrow label="Success Stories" />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1 }}>
              Results that speak.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {STORIES.map((s, i) => (
              <Reveal key={s.name} delay={i * 90}>
                <StoryCard story={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── FAQ ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section id="faq" ref={faqRef} style={{ padding: "100px 40px", background: "var(--ink2)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            opacity: faqVis ? 1 : 0, transform: faqVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s, transform 0.6s", marginBottom: 52, textAlign: "center",
          }}>
            <Eyebrow label="FAQ" />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 600, letterSpacing: -1, color: "var(--white)", lineHeight: 1.1 }}>
              Common questions.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 50}>
                <FaqItem
                  faq={faq}
                  open={activeFaq === i}
                  onToggle={() => setActiveFaq(activeFaq === i ? null : i)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── FINAL CTA ── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: "120px 40px",
        background: "var(--ink)",
        position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(var(--white4) 1px, transparent 1px), linear-gradient(90deg, var(--white4) 1px, transparent 1px)",
          backgroundSize: "60px 60px", opacity: 0.18,
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
        }} />

        <Reveal>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Eyebrow label="Get Started Today" />
            <h2 style={{
              fontFamily: "var(--serif)", fontSize: "clamp(36px, 5vw, 70px)",
              fontWeight: 600, letterSpacing: -1.5, color: "var(--white)",
              lineHeight: 1.1, marginBottom: 20, maxWidth: 680, margin: "0 auto 20px",
            }}>
              Ready to put your products<br />
              <em style={{ color: "var(--gold)", fontStyle: "italic" }}>in front of more buyers?</em>
            </h2>
            <p style={{ fontSize: 15, color: "var(--white3)", maxWidth: 440, margin: "0 auto 44px", lineHeight: 1.8 }}>
              Join hundreds of sellers already growing with Woosho Ads. Your first campaign takes less than 5 minutes to launch.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              <button style={{
                background: "var(--gold)", border: "none", borderRadius: 10,
                padding: "16px 40px", fontSize: 13, fontWeight: 700,
                color: "var(--ink)", cursor: "pointer", letterSpacing: 1,
                textTransform: "uppercase", fontFamily: "var(--sans)",
                boxShadow: "0 0 48px rgba(201,168,76,0.35)",
              }}>
                Start Advertising
              </button>
              <button style={{
                background: "transparent", border: "1px solid var(--white4)",
                borderRadius: 10, padding: "16px 32px", fontSize: 13,
                fontWeight: 600, color: "var(--white2)", cursor: "pointer",
                letterSpacing: 0.5, fontFamily: "var(--sans)",
              }}>
                Contact Sales
              </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--white3)", marginTop: 24, letterSpacing: 0.5 }}>
              No long-term commitment · Cancel anytime · Set up in minutes
            </p>
          </div>
        </Reveal>
      </section>

      {/* Footer line */}
      <div style={{ borderTop: "1px solid var(--white4)", padding: "24px 40px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: "var(--white3)", fontFamily: "var(--mono)", letterSpacing: 1 }}>
          © 2025 WooSho Marketplace · Advertising Platform
        </span>
      </div>
    </>
  );
}

/* ─── HERO DASHBOARD CARD ─────────────────────────────────────────────────── */
function HeroDashboardCard() {
  return (
    <div style={{
      background: "var(--ink3)",
      borderRadius: 20,
      border: "1px solid var(--white4)",
      padding: "24px",
      boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.1)",
      animation: "float 6s ease-in-out infinite",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--white3)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Campaign Overview</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--white)" }}>Summer Collection Push</div>
        </div>
        <div style={{
          background: "rgba(15,123,108,0.18)", border: "1px solid rgba(15,123,108,0.4)",
          borderRadius: 20, padding: "4px 10px", fontSize: 9,
          fontWeight: 700, color: "#0F7B6C", letterSpacing: 1, textTransform: "uppercase",
        }}>● Live</div>
      </div>

      {/* Mini chart */}
      <div style={{ height: 64, marginBottom: 20, display: "flex", alignItems: "flex-end", gap: 4 }}>
        {[28, 42, 38, 65, 72, 58, 84, 91, 78, 95, 88, 100].map((h, i) => (
          <div key={i} style={{
            flex: 1, height: `${h}%`,
            background: i === 11 ? "var(--gold)" : i > 7 ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.2)",
            borderRadius: "3px 3px 0 0",
            transition: "height 0.5s ease",
          }} />
        ))}
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {[
          { label: "Impressions", val: "48.2K", up: true, delta: "+12%" },
          { label: "Clicks", val: "3,840", up: true, delta: "+28%" },
          { label: "CTR", val: "7.96%", up: true, delta: "+3.2%" },
          { label: "ROAS", val: "4.2×", up: true, delta: "+0.8×" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 8,
            border: "1px solid var(--white4)", padding: "12px 14px",
          }}>
            <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--white3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--white)" }}>{s.val}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#0F7B6C" }}>{s.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: "var(--white3)", fontFamily: "var(--mono)", letterSpacing: 0.8 }}>Budget Used</span>
          <span style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--mono)" }}>₦34,200 / ₦50,000</span>
        </div>
        <div style={{ height: 4, background: "var(--white4)", borderRadius: 2 }}>
          <div style={{ width: "68%", height: "100%", background: "var(--gold)", borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── ANALYTICS DASHBOARD CARD ──────────────────────────────────────────── */
function AnalyticsDashboardCard({ visible }) {
  return (
    <div style={{
      background: "var(--ink2)", borderRadius: 20,
      border: "1px solid var(--white4)",
      overflow: "hidden",
      boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
    }}>
      {/* Top bar */}
      <div style={{ background: "var(--gold)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--ink)", fontWeight: 700, letterSpacing: 1.5 }}>WOOSHO ADS — ANALYTICS</span>
      </div>

      {/* Date range */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--white4)", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "var(--white3)", fontFamily: "var(--mono)" }}>Last 30 days</span>
        <span style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--mono)" }}>↑ vs prev period</span>
      </div>

      {/* Main metrics */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { label: "Total Impressions", val: "2.3M", delta: "+18%", bar: 78 },
          { label: "Total Clicks", val: "184K", delta: "+34%", bar: 64 },
          { label: "Orders Generated", val: "4,820", delta: "+41%", bar: 88 },
          { label: "Revenue Attributed", val: "₦96.4M", delta: "+52%", bar: 95 },
        ].map((m, i) => (
          <div key={m.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--white2)", fontWeight: 500 }}>{m.label}</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 700, color: "var(--white)" }}>{m.val}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#0F7B6C", background: "rgba(15,123,108,0.15)", padding: "2px 6px", borderRadius: 4 }}>{m.delta}</span>
              </div>
            </div>
            <div style={{ height: 3, background: "var(--white4)", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: visible ? `${m.bar}%` : "0%",
                background: `linear-gradient(to right, var(--gold), var(--gold2))`,
                transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 120}ms`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── WHY CARD ───────────────────────────────────────────────────────────── */
function WhyCard({ card }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--ink3)" : "var(--ink)",
        border: "1px solid",
        borderColor: hov ? "rgba(201,168,76,0.35)" : "var(--white4)",
        borderRadius: "var(--radius)", padding: "32px 28px",
        cursor: "default",
        transition: "background 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
        transform: hov ? "translateY(-3px)" : "none",
        height: "100%",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 18 }}>{card.icon}</div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600, color: "var(--white)", marginBottom: 10, letterSpacing: -0.3 }}>{card.title}</h3>
      <p style={{ fontSize: 13, color: "var(--white3)", lineHeight: 1.75 }}>{card.desc}</p>
    </div>
  );
}

/* ─── AD FORMAT CARD ─────────────────────────────────────────────────────── */
function AdFormatCard({ format, large }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--ink)",
        border: "1px solid",
        borderColor: hov ? "rgba(201,168,76,0.4)" : "var(--white4)",
        borderRadius: "var(--radius)",
        padding: large ? "36px 32px" : "28px 22px",
        position: "relative", overflow: "hidden",
        cursor: "default",
        transition: "border-color 0.3s, transform 0.3s",
        transform: hov ? "translateY(-3px)" : "none",
        height: "100%",
      }}
    >
      {/* Priority badge */}
      {format.priority && (
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "var(--gold)", color: "var(--ink)",
          fontSize: 8, fontWeight: 800, letterSpacing: 1.5,
          padding: "3px 8px", borderRadius: 4, textTransform: "uppercase",
          fontFamily: "var(--mono)",
        }}>#1 Pick</div>
      )}

      {/* Icon */}
      <div style={{
        width: large ? 52 : 42, height: large ? 52 : 42,
        borderRadius: 12, background: "rgba(201,168,76,0.12)",
        border: "1px solid rgba(201,168,76,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: large ? 22 : 18, marginBottom: 18,
      }}>{format.icon}</div>

      <h3 style={{
        fontFamily: "var(--serif)", fontSize: large ? 22 : 17,
        fontWeight: 600, color: "var(--white)",
        marginBottom: 10, letterSpacing: -0.3,
      }}>{format.title}</h3>
      <p style={{ fontSize: 13, color: "var(--white3)", lineHeight: 1.7, marginBottom: large ? 20 : 0 }}>{format.desc}</p>

      {large && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {format.tags?.map(t => (
            <span key={t} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
              color: "var(--gold)", background: "var(--gold-dim)",
              padding: "4px 10px", borderRadius: 20,
              textTransform: "uppercase",
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Placement label */}
      <div style={{
        marginTop: 14, fontSize: 10, fontFamily: "var(--mono)",
        color: "var(--white3)", letterSpacing: 1,
      }}>
        → {format.placement}
      </div>
    </div>
  );
}

/* ─── HOW STEP ────────────────────────────────────────────────────────────── */
function HowStep({ step, index }) {
  return (
    <div style={{ textAlign: "center", padding: "0 16px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "var(--ink2)",
        border: "1px solid var(--white4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500,
        color: "var(--gold)",
        position: "relative",
        boxShadow: "0 0 0 8px var(--ink)",
      }}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        {/* Pulse ring */}
        <div style={{
          position: "absolute", inset: -6, borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.3)",
          animation: "pulse-ring 2.5s ease-out infinite",
          animationDelay: `${index * 0.4}s`,
        }} />
      </div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600, color: "var(--white)", marginBottom: 10, letterSpacing: -0.3 }}>{step.title}</h3>
      <p style={{ fontSize: 12, color: "var(--white3)", lineHeight: 1.7 }}>{step.desc}</p>
    </div>
  );
}

/* ─── TARGETING CARD ─────────────────────────────────────────────────────── */
function TargetingCard({ data }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--ink3)" : "var(--ink2)",
        border: "1px solid",
        borderColor: hov ? "rgba(201,168,76,0.3)" : "var(--white4)",
        borderRadius: "var(--radius)", padding: "28px 22px",
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-3px)" : "none",
        height: "100%",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 14 }}>{data.icon}</div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600, color: "var(--white)", marginBottom: 16, letterSpacing: -0.3 }}>{data.type}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.options.map(opt => (
          <div key={opt} style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, color: "var(--white2)",
          }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PRICING CARD ────────────────────────────────────────────────────────── */
function PricingCard({ plan, active, onSelect }) {
  const isFeature = plan.name === "Growth";
  return (
    <div
      onClick={onSelect}
      style={{
        background: isFeature ? "var(--gold)" : "var(--ink3)",
        border: "1px solid",
        borderColor: isFeature ? "var(--gold)" : active ? "rgba(201,168,76,0.4)" : "var(--white4)",
        borderRadius: "var(--radius)", padding: "36px 28px",
        cursor: "pointer",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: isFeature ? "scale(1.02)" : "scale(1)",
        boxShadow: isFeature ? "0 24px 64px rgba(201,168,76,0.25)" : "none",
        position: "relative", overflow: "hidden",
        height: "100%",
      }}
    >
      {isFeature && (
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(10,10,8,0.2)", borderRadius: 20,
          fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
          color: "var(--ink)", padding: "4px 10px", textTransform: "uppercase",
          fontFamily: "var(--mono)",
        }}>Most Popular</div>
      )}

      <div style={{ fontSize: 10, fontFamily: "var(--mono)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, color: isFeature ? "rgba(10,10,8,0.6)" : "var(--white3)" }}>
        {plan.name}
      </div>

      <div style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 700, letterSpacing: -1, color: isFeature ? "var(--ink)" : "var(--white)", marginBottom: 4, lineHeight: 1 }}>
        {plan.price}
      </div>
      <div style={{ fontSize: 12, color: isFeature ? "rgba(10,10,8,0.6)" : "var(--white3)", marginBottom: 24 }}>{plan.period}</div>

      <p style={{ fontSize: 13, color: isFeature ? "rgba(10,10,8,0.75)" : "var(--white3)", lineHeight: 1.7, marginBottom: 28 }}>
        {plan.desc}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: isFeature ? "rgba(10,10,8,0.8)" : "var(--white2)" }}>
            <span style={{ color: isFeature ? "var(--ink)" : "var(--gold)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </div>
        ))}
      </div>

      <button style={{
        width: "100%",
        background: isFeature ? "var(--ink)" : "var(--gold)",
        border: "none", borderRadius: 10,
        padding: "13px 0", fontSize: 12, fontWeight: 700,
        color: isFeature ? "var(--gold)" : "var(--ink)",
        cursor: "pointer", letterSpacing: 0.8, textTransform: "uppercase",
        fontFamily: "var(--sans)",
      }}>{plan.cta}</button>
    </div>
  );
}

/* ─── STORY CARD ─────────────────────────────────────────────────────────── */
function StoryCard({ story }) {
  return (
    <div style={{
      background: "var(--ink2)", border: "1px solid var(--white4)",
      borderRadius: "var(--radius)", padding: "32px 28px",
      height: "100%", display: "flex", flexDirection: "column",
    }}>
      {/* Quote mark */}
      <div style={{ fontFamily: "var(--serif)", fontSize: 60, color: "var(--gold)", lineHeight: 0.7, marginBottom: 24, opacity: 0.6 }}>"</div>

      <p style={{ fontSize: 14, color: "var(--white2)", lineHeight: 1.8, flex: 1, marginBottom: 24, fontStyle: "italic" }}>
        {story.quote}
      </p>

      {/* Metrics */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, padding: "16px 0", borderTop: "1px solid var(--white4)", borderBottom: "1px solid var(--white4)" }}>
        {story.metrics.map(m => (
          <div key={m.label}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--gold)" }}>{m.val}</div>
            <div style={{ fontSize: 9, color: "var(--white3)", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={story.avatar} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--white4)" }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--white)" }}>{story.name}</div>
          <div style={{ fontSize: 10, color: "var(--white3)" }}>{story.store} · {story.category}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ ITEM ────────────────────────────────────────────────────────────── */
function FaqItem({ faq, open, onToggle }) {
  return (
    <div style={{
      background: open ? "var(--ink3)" : "var(--ink2)",
      borderRadius: 12, border: "1px solid",
      borderColor: open ? "rgba(201,168,76,0.3)" : "var(--white4)",
      overflow: "hidden",
      transition: "background 0.25s ease, border-color 0.25s ease",
    }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 24px", background: "none", border: "none",
        cursor: "pointer", textAlign: "left", fontFamily: "var(--sans)",
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--white)", letterSpacing: -0.2 }}>{faq.q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          background: open ? "var(--gold)" : "var(--white4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginLeft: 16,
          transition: "background 0.25s ease",
        }}>
          <svg width="12" height="12" fill="none" stroke={open ? "var(--ink)" : "var(--white)"} strokeWidth="2"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}>
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 20px" }}>
          <p style={{ fontSize: 13, color: "var(--white3)", lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const WHY_CARDS = [
  { icon: "🎯", title: "High Purchase Intent", desc: "Every user on Woosho is actively shopping. Your ad reaches buyers who are already in discovery mode — not passive scrollers." },
  { icon: "👁", title: "Premium Visibility", desc: "Appear in curated collections, category pages, search results, and product feeds. Your brand occupies the moments that matter." },
  { icon: "🤖", title: "AI-Powered Discovery", desc: "Our recommendation engine surfaces your products to buyers with matching intent signals, browsing history, and purchase patterns." },
  { icon: "📊", title: "Performance Analytics", desc: "Track impressions, clicks, CTR, conversions, CPC, ROAS, and revenue generated — all in one real-time dashboard." },
  { icon: "⚡", title: "Flexible Budgets", desc: "Launch with as little as ₦5,000 or scale to enterprise-level campaigns. Full control, zero minimum commitment." },
  { icon: "🌍", title: "Local & National Reach", desc: "Target by city, region, or nationwide. Hyper-local for Lagos street markets or pan-Africa for ambitious brands." },
];

const AUDIENCE_STATS = [
  { label: "Monthly Visitors", num: 25, suffix: "K+", prefix: "", desc: "Unique shoppers browsing the marketplace every month" },
  { label: "Active Buyers", num: 8.5, suffix: "K+", prefix: "", desc: "Shoppers who have completed at least one purchase" },
  { label: "Product Impressions", num: 2.3, suffix: "M+", prefix: "", desc: "Product views served monthly across all placements" },
  { label: "Avg. Session Time", num: 8.4, suffix: "min", prefix: "", desc: "Engaged browsing per visit — among the highest in Nigerian e-commerce" },
  { label: "Repeat Purchase Rate", num: 64, suffix: "%", prefix: "", desc: "Buyers who return within 30 days of their first purchase" },
  { label: "Product Categories", num: 40, suffix: "+", prefix: "", desc: "From fashion to electronics to food — broad and growing" },
];

const AD_FORMATS = [
  {
    icon: "🛍",
    title: "Sponsored Products",
    desc: "Your products appear inside category listings and search results, seamlessly integrated alongside organic results with a subtle 'Sponsored' label. Highest ROI format on the platform.",
    placement: "Category pages · Search results · Product feeds",
    priority: true,
    tags: ["CPC", "CPM", "Highest Volume", "Self-Serve"],
  },
  {
    icon: "🏠",
    title: "Homepage Hero Banner",
    desc: "Large-format placement at the very top of the Woosho homepage. Maximum exposure to every visitor. Ideal for product launches, seasonal campaigns, and brand awareness pushes.",
    placement: "Homepage — above the fold",
    tags: ["Premium", "Brand Awareness", "Limited Slots", "High CPM"],
  },
  { icon: "🏪", title: "Sponsored Stores", desc: "Boost your entire store to appear in the Stores discovery page and curated store sections.", placement: "Stores page · Discovery feed" },
  { icon: "🔍", title: "Search Ads", desc: "Appear above organic results when buyers search for relevant terms.", placement: "Search results — top 3 placements" },
  { icon: "✨", title: "Curated Collections", desc: "Sponsor Trending, Flash Deals, Best Sellers, or Editor's Picks sections.", placement: "Curations page · Homepage modules" },
  { icon: "📑", title: "Category Banners", desc: "Banner ads inside Fashion, Beauty, Electronics, Home, and other category pages.", placement: "All category landing pages" },
];

const HOW_STEPS = [
  { title: "Create Campaign", desc: "Name your campaign, choose your objective — awareness, clicks, or conversions — and set your date range." },
  { title: "Choose Products or Store", desc: "Select individual products, an entire collection, or your whole store. Preview exactly how your ad will appear." },
  { title: "Set Your Budget", desc: "Set a daily or total budget. Choose CPC, CPM, or sponsored listing pricing. Adjust anytime." },
  { title: "Launch & Track", desc: "Go live instantly. Monitor real-time performance in your analytics dashboard and optimise on the fly." },
];

const TARGETING = [
  {
    icon: "📂", type: "By Category",
    options: ["Fashion & Apparel", "Beauty & Skincare", "Electronics & Tech", "Home & Living", "Food & Grocery", "Sports & Fitness"],
  },
  {
    icon: "💡", type: "By Interest",
    options: ["Luxury & Premium", "Sneakers & Footwear", "Gaming & Tech", "Fitness & Wellness", "Art & Décor", "Sustainable Fashion"],
  },
  {
    icon: "📍", type: "By Location",
    options: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Pan-Nigeria", "International"],
  },
  {
    icon: "🔄", type: "By Behaviour",
    options: ["Recently Viewed", "Added to Cart", "Previous Buyers", "Wishlist Users", "High-Value Shoppers", "Lapsed Buyers"],
  },
];

const METRICS = [
  { label: "Impressions", val: "2.3M" },
  { label: "Clicks", val: "184K" },
  { label: "CTR", val: "7.96%" },
  { label: "CPC", val: "₦52" },
  { label: "ROAS", val: "4.2×" },
  { label: "Revenue", val: "₦96M+" },
  { label: "Orders", val: "4,820" },
  { label: "Conv. Rate", val: "2.62%" },
];

const PLANS = [
  {
    name: "Starter",
    price: "₦5K",
    period: "minimum budget · pay as you go",
    desc: "Perfect for independent sellers testing their first campaign. Get your products seen by thousands.",
    features: [
      "Sponsored Products placement",
      "Self-serve campaign dashboard",
      "Basic analytics (impressions, clicks)",
      "CPC & CPM bidding",
      "Email support",
    ],
    cta: "Start Free",
  },
  {
    name: "Growth",
    price: "₦20K–₦100K",
    period: "flexible monthly budget",
    desc: "For growing stores ready to scale. Access premium placements and advanced audience targeting.",
    features: [
      "All Starter features",
      "Homepage & category banner ads",
      "Advanced targeting (location, interest, behaviour)",
      "Full analytics + conversion tracking",
      "Sponsored Store placement",
      "Priority support + account manager",
    ],
    cta: "Get Started",
  },
  {
    name: "Premium",
    price: "Custom",
    period: "tailored for brands & agencies",
    desc: "Enterprise-level campaigns for established brands, agencies, and high-volume sellers.",
    features: [
      "All Growth features",
      "Dedicated account manager",
      "Custom ad formats & creative support",
      "API access & data export",
      "Curated Collection sponsorship",
      "White-glove onboarding & strategy",
    ],
    cta: "Contact Sales",
  },
];

const STORIES = [
  {
    quote: "Our product views increased by 240% within the first 14 days. We spent ₦40,000 and generated over ₦480,000 in direct revenue. The ROAS was unbelievable.",
    metrics: [{ val: "240%", label: "Views ↑" }, { val: "12×", label: "ROAS" }, { val: "14", label: "Days" }],
    name: "Adaeze O.", store: "Foundry Label", category: "Fashion",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80",
  },
  {
    quote: "We were a brand-new store. Sponsored Products got us our first 50 orders in week one. The targeting is genuinely accurate — the right people saw our products.",
    metrics: [{ val: "50", label: "Orders Wk 1" }, { val: "₦0", label: "Prev. Spend" }, { val: "4.8★", label: "Rating" }],
    name: "Emeka D.", store: "Volta Electronics", category: "Electronics",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    quote: "The Homepage Hero Banner during our Eid campaign was a game-changer. We sold out our collection in 72 hours. We're already planning the next one.",
    metrics: [{ val: "72h", label: "Sold Out" }, { val: "3.4K", label: "New Followers" }, { val: "620%", label: "Sales ↑" }],
    name: "Ngozi A.", store: "Forme d'Expression", category: "Fashion",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80",
  },
];

const FAQS = [
  { q: "How much does advertising cost?", a: "You can start with as little as ₦5,000. There is no minimum contract or commitment. Costs depend on your budget, format, and bidding model (CPC or CPM). You are always in control." },
  { q: "Can I pause or stop a campaign?", a: "Yes. You can pause, edit, or stop any campaign at any time from your dashboard. Unspent budget is never charged. You only pay for delivered impressions or clicks." },
  { q: "Do I need a seller account to advertise?", a: "You must have an active Woosho seller account to run Sponsored Products or Sponsored Store ads. Brand or agency accounts can run banner ads without a seller account." },
  { q: "How are clicks and impressions measured?", a: "Clicks are counted when a buyer clicks your ad and lands on your product or store page. Impressions are counted each time your ad is displayed. Both are tracked in your real-time analytics dashboard." },
  { q: "How do payments work?", a: "Advertising spend is prepaid. You load credits to your ad account and spend is deducted as your campaign runs. Payments are processed via card, bank transfer, or Woosho wallet." },
  { q: "Can I target specific categories or cities?", a: "Yes. You can target by product category, buyer interest, location (down to specific cities), and behaviour (cart abandonment, previous buyers, etc.). All available on Growth and Premium plans." },
];