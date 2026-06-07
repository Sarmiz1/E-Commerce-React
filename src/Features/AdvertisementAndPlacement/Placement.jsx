import { useState, useRef, useEffect, useCallback } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,700;0,900;1,400;1,600;1,900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bone:    #F5F0E8;
    --bone2:   #EDE8DF;
    --bone3:   #E0DAD0;
    --ink:     #1A1812;
    --ink2:    #2C2920;
    --ink3:    #3D3A31;
    --amber:   #B8862A;
    --amber2:  #D4A44C;
    --amber-d: rgba(184,134,42,0.15);
    --white:   #FDFCF9;
    --muted:   rgba(26,24,18,0.45);
    --muted2:  rgba(26,24,18,0.22);
    --serif:   'Bodoni Moda', 'Times New Roman', serif;
    --sans:    'DM Sans', sans-serif;
    --mono:    'DM Mono', monospace;
    --r:       14px;
  }

  html { scroll-behavior: smooth; background: var(--bone); }
  body { background: var(--bone); color: var(--ink); font-family: var(--sans); -webkit-font-smoothing: antialiased; }
  ::selection { background: var(--ink); color: var(--bone); }

  @keyframes riseIn {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes zoomIn  { from { transform: scale(1.08) } to { transform: scale(1) } }
  @keyframes slideL  { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideR  { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes drawLine {
    from { width: 0; }
    to   { width: 100%; }
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

function Reveal({ children, delay = 0, dir = "up", style = {} }) {
  const ref = useRef(null);
  const v = useInView(ref);
  const anim = dir === "left" ? "slideL" : dir === "right" ? "slideR" : "riseIn";
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      animation: v ? `${anim} 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms both` : "none",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const CAMPAIGN = {
  brand: "Foundry Label",
  tagline: "Wear the season differently.",
  campaignTitle: "The Autumn Edit",
  campaignSub: "A considered collection for those who dress with intention.",
  sponsor: "Foundry Label",
  placement: "Homepage Hero Banner",
  handle: "@foundrylabel",
  logo: "FL",
  verified: true,
  since: "2021",
};

const HERO_SLIDES = [
  {
    id: 0,
    img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1800&q=90",
    label: "The Statement Coat",
    sub: "Boucle & Wool Blend",
  },
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1800&q=90",
    label: "The Autumn Collection",
    sub: "35 new pieces",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=90",
    label: "Editor's Selection",
    sub: "Curated for the season",
  },
];

const FEATURED_PRODUCTS = [
  {
    id: 1, name: "The Boucle Coat", price: 520000, originalPrice: null,
    img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=85",
    tag: "Campaign Hero", note: "The investment piece of the season.",
    material: "Italian Boucle · Wool blend",
    colors: ["#2C2920", "#8B7355", "#4A4A4A"],
  },
  {
    id: 2, name: "Oversized Linen Blazer", price: 289000, originalPrice: 380000,
    img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&q=85",
    tag: "Best Seller", note: "Structure, softened.",
    material: "100% Belgian Linen",
    colors: ["#E8DCC8", "#1A1812", "#6B5E4A"],
  },
  {
    id: 3, name: "Wool Cargo Trousers", price: 175000, originalPrice: 240000,
    img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=85",
    tag: "On Sale", note: "Utilitarian, made refined.",
    material: "Merino Wool · Relaxed fit",
    colors: ["#3D3A31", "#8B8178", "#C4B89A"],
  },
  {
    id: 4, name: "Slim Turtleneck", price: 110000, originalPrice: null,
    img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=85",
    tag: "New", note: "The season's essential layer.",
    material: "Fine-gauge Merino",
    colors: ["#F5F0E8", "#1A1812", "#8B7355"],
  },
];

const LOOKBOOK = [
  {
    img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=85",
    aspect: "portrait", caption: "The Ivory Linen Edit",
  },
  {
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85",
    aspect: "portrait", caption: "Midi in Motion",
  },
  {
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=85",
    aspect: "landscape", caption: "The Full Edit — Autumn 2025",
  },
  {
    img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=85",
    aspect: "portrait", caption: "Layer Study No. 3",
  },
];

const TESTIMONIALS = [
  { quote: "Foundry Label changed how I think about getting dressed. Every piece is considered.", author: "Amara T.", city: "Lagos" },
  { quote: "The boucle coat is the best purchase I've made this year. People stop me in it.", author: "Zara F.", city: "Abuja" },
  { quote: "Finally a Nigerian brand that understands fabric weight and tailoring.", author: "Emeka O.", city: "Port Harcourt" },
];

/* ─── COMPONENTS ──────────────────────────────────────────────────────────── */

function SponsoredLabel() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(26,24,18,0.07)",
      border: "1px solid rgba(26,24,18,0.12)",
      borderRadius: 4, padding: "4px 10px",
    }}>
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <circle cx="4.5" cy="4.5" r="4.5" fill="#B8862A" />
        <path d="M3 4.5h3M4.5 3v3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: "var(--muted)", fontFamily: "var(--mono)" }}>
        Sponsored
      </span>
    </div>
  );
}

function Stars({ n = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill={i <= n ? "var(--amber)" : "var(--bone3)"}>
          <path d="M5 .5l1.1 3.1H9.3L6.7 5.6l1 3.1L5 7l-2.7 1.7 1-3.1L.7 3.6h3.2z"/>
        </svg>
      ))}
    </span>
  );
}

function ColorDot({ color }) {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14, borderRadius: "50%",
      background: color, border: "1.5px solid rgba(26,24,18,0.15)",
    }} />
  );
}

/* ─── PRODUCT CARD ───────────────────────────────────────────────────────── */
function ProductCard({ p, delay, visible, large }) {
  const [hov, setHov] = useState(false);
  const [wished, setWished] = useState(false);
  const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  const fmt = n => "₦" + (n / 100).toLocaleString("en-NG");

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        cursor: "pointer",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: large ? 16 : 12,
        background: "var(--bone2)",
        aspectRatio: large ? "3/4" : "4/5",
        marginBottom: 16,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${p.img})`,
          backgroundSize: "cover", backgroundPosition: "center top",
          transform: hov ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
        }} />

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(26,24,18,0.15)",
          opacity: hov ? 1 : 0,
          transition: "opacity 0.35s ease",
        }} />

        {/* Tag */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: p.tag === "On Sale" ? "var(--ink)" : p.tag === "New" ? "var(--amber)" : "var(--bone)",
          color: p.tag === "On Sale" ? "var(--bone)" : p.tag === "New" ? "var(--bone)" : "var(--ink)",
          fontSize: 8, fontWeight: 800, letterSpacing: 1.5,
          padding: "4px 9px", borderRadius: 3, textTransform: "uppercase",
          fontFamily: "var(--mono)",
        }}>{p.tag}</div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setWished(w => !w); }}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(253,252,249,0.9)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hov || wished ? 1 : 0,
            transform: hov || wished ? "scale(1)" : "scale(0.7)",
            transition: "opacity 0.25s, transform 0.25s",
            backdropFilter: "blur(4px)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={wished ? "var(--ink)" : "none"}
            stroke="var(--ink)" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Quick shop */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "0 12px 12px",
          transform: hov ? "translateY(0)" : "translateY(110%)",
          opacity: hov ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        }}>
          <button style={{
            width: "100%", background: "var(--ink)", color: "var(--bone)",
            border: "none", borderRadius: 8, padding: "11px 0",
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase", cursor: "pointer",
            fontFamily: "var(--sans)",
          }}>
            Quick Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        <p style={{ margin: "0 0 2px", fontSize: 10, color: "var(--muted)", fontStyle: "italic", fontFamily: "var(--serif)" }}>{p.note}</p>
        <p style={{ margin: "0 0 6px", fontSize: large ? 16 : 13, fontWeight: 600, color: "var(--ink)", letterSpacing: -0.2, fontFamily: "var(--serif)" }}>{p.name}</p>
        <p style={{ margin: "0 0 8px", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{p.material}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: large ? 16 : 14, fontWeight: 700, color: disc ? "var(--ink)" : "var(--ink)", fontFamily: "var(--serif)" }}>
              {fmt(p.price)}
            </span>
            {p.originalPrice && (
              <span style={{ fontSize: 11, color: "var(--muted)", textDecoration: "line-through" }}>{fmt(p.originalPrice)}</span>
            )}
            {disc && (
              <span style={{ fontSize: 9, fontWeight: 800, color: "var(--amber)", letterSpacing: 0.5 }}>−{disc}%</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {p.colors.map((c, i) => <ColorDot key={i} color={c} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function Placement() {
  const [slide, setSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [tsIdx, setTsIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [ctaHov, setCtaHov] = useState(false);

  const productsRef = useRef(null);
  const lookbookRef = useRef(null);
  const storeRef = useRef(null);
  const quoteRef = useRef(null);

  const productsVis = useInView(productsRef);
  const lookbookVis = useInView(lookbookRef);
  const storeVis = useInView(storeRef);
  const quoteVis = useInView(quoteRef);

  // Auto-advance slides
  useEffect(() => {
    const id = setInterval(() => {
      setSlide(s => (s + 1) % HERO_SLIDES.length);
      setSlideDir(1);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Auto-advance testimonials
  useEffect(() => {
    const id = setInterval(() => setTsIdx(i => (i + 1) % TESTIMONIALS.length), 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const goSlide = (idx) => {
    setSlideDir(idx > slide ? 1 : -1);
    setSlide(idx);
  };

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh" }}>

      {/* ── WOOSHO PLACEMENT BAR ── */}
      {!dismissed && (
        <div style={{
          background: "var(--ink)", color: "var(--bone)",
          padding: "10px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 200,
          animation: "fadeIn 0.4s ease both",
          borderBottom: "1px solid rgba(245,240,232,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Woosho wordmark */}
            <span style={{
              fontFamily: "var(--serif)", fontSize: 15, fontWeight: 700,
              color: "var(--bone)", letterSpacing: -0.3,
            }}>
              Woo<span style={{ color: "var(--amber2)" }}>Sho</span>
            </span>
            <span style={{ width: 1, height: 16, background: "rgba(245,240,232,0.15)" }} />
            <SponsoredLabel />
            <span style={{ fontSize: 11, color: "rgba(245,240,232,0.5)", fontFamily: "var(--mono)" }}>
              Promoted by {CAMPAIGN.brand}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="#" style={{ fontSize: 10, color: "rgba(245,240,232,0.45)", textDecoration: "none", letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "var(--mono)" }}>
              Why am I seeing this?
            </a>
            <button
              onClick={() => setDismissed(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(245,240,232,0.4)", padding: 4,
                display: "flex", alignItems: "center",
              }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 2l10 10M12 2L2 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── BRAND NAV ── */}
      <nav style={{
        position: "sticky", top: dismissed ? 0 : 44, zIndex: 100,
        background: "rgba(245,240,232,0.94)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--bone3)",
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          {/* Brand wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: "var(--ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 13, fontWeight: 900, color: "var(--amber2)", letterSpacing: -0.5 }}>FL</span>
            </div>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.3, lineHeight: 1 }}>
                {CAMPAIGN.brand}
              </div>
              <div style={{ fontSize: 8.5, color: "var(--muted)", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "var(--mono)" }}>
                Official Store
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", gap: 0 }}>
            {["New Arrivals", "The Edit", "Coats", "Knitwear", "Trousers", "Accessories"].map(item => (
              <a key={item} href="#" style={{
                padding: "0 14px", fontSize: 11, fontWeight: 500, color: "var(--muted)",
                textDecoration: "none", letterSpacing: 0.3,
                lineHeight: "56px", whiteSpace: "nowrap",
                transition: "color 0.2s",
                borderBottom: "2px solid transparent",
              }}
                onMouseEnter={e => { e.target.style.color = "var(--ink)"; e.target.style.borderBottomColor = "var(--amber)"; }}
                onMouseLeave={e => { e.target.style.color = "var(--muted)"; e.target.style.borderBottomColor = "transparent"; }}
              >{item}</a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={{
              background: "var(--ink)", color: "var(--bone)", border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 10,
              fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              cursor: "pointer", fontFamily: "var(--sans)",
            }}>
              Shop Now
            </button>
          </div>
        </div>
      </nav>

      {/* ── CINEMATIC HERO ── */}
      <div style={{ position: "relative", height: "91vh", overflow: "hidden", background: "var(--ink)" }}>
        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div key={s.id} style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${s.img})`,
            backgroundSize: "cover", backgroundPosition: "center 20%",
            opacity: i === slide ? 1 : 0,
            transform: i === slide ? "scale(1.04)" : "scale(1)",
            transition: "opacity 1.3s cubic-bezier(0.4,0,0.2,1), transform 7s ease-out",
            zIndex: i === slide ? 1 : 0,
          }} />
        ))}

        {/* Overlays */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(to right, rgba(26,24,18,0.72) 0%, rgba(26,24,18,0.2) 55%, rgba(26,24,18,0.05) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(to top, rgba(26,24,18,0.55) 0%, transparent 45%)",
        }} />

        {/* Content */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "0 80px 72px",
          maxWidth: 1240, left: "50%", transform: "translateX(-50%)", width: "100%",
        }}>
          {/* Campaign label */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
            animation: "riseIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both",
          }}>
            <span style={{ display: "inline-block", width: 32, height: 1.5, background: "var(--amber2)" }} />
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--amber2)", fontFamily: "var(--mono)" }}>
              {CAMPAIGN.brand} · {CAMPAIGN.campaignTitle}
            </span>
          </div>

          {/* Main headline */}
          <h1 style={{
            fontFamily: "var(--serif)", fontWeight: 900, fontStyle: "italic",
            fontSize: "clamp(48px, 7vw, 100px)",
            color: "var(--bone)", letterSpacing: -2.5, lineHeight: 0.95,
            marginBottom: 24,
            animation: "riseIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.2s both",
            maxWidth: 720,
          }}>
            {CAMPAIGN.campaignTitle}.
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 16, color: "rgba(245,240,232,0.72)", lineHeight: 1.7,
            maxWidth: 440, marginBottom: 40,
            animation: "riseIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.32s both",
          }}>
            {CAMPAIGN.campaignSub}
          </p>

          {/* CTAs */}
          <div style={{
            display: "flex", gap: 12,
            animation: "riseIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.44s both",
          }}>
            <button
              onMouseEnter={() => setCtaHov(true)}
              onMouseLeave={() => setCtaHov(false)}
              style={{
                background: ctaHov ? "var(--amber2)" : "var(--bone)",
                color: "var(--ink)", border: "none", borderRadius: 10,
                padding: "15px 36px", fontSize: 11, fontWeight: 700,
                letterSpacing: 1.5, textTransform: "uppercase",
                cursor: "pointer", fontFamily: "var(--sans)",
                transition: "background 0.3s ease",
              }}
            >
              Shop The Edit
            </button>
            <button style={{
              background: "transparent", color: "rgba(245,240,232,0.85)",
              border: "1px solid rgba(245,240,232,0.3)", borderRadius: 10,
              padding: "15px 28px", fontSize: 11, fontWeight: 600,
              letterSpacing: 1, textTransform: "uppercase",
              cursor: "pointer", fontFamily: "var(--sans)",
            }}>
              View Lookbook
            </button>
          </div>

          {/* Slide counter + dots */}
          <div style={{
            position: "absolute", bottom: 72, right: 80,
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14,
          }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "rgba(245,240,232,0.4)", letterSpacing: 1 }}>
              {String(slide + 1).padStart(2,"0")} / {String(HERO_SLIDES.length).padStart(2,"0")}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {HERO_SLIDES.map((s, i) => (
                <button key={s.id} onClick={() => goSlide(i)} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{
                    fontSize: 9, color: "rgba(245,240,232,0.45)", fontFamily: "var(--mono)",
                    opacity: i === slide ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}>{s.caption || s.label}</span>
                  <span style={{
                    display: "block", height: 2, borderRadius: 1,
                    width: i === slide ? 28 : 8,
                    background: i === slide ? "var(--amber2)" : "rgba(245,240,232,0.3)",
                    transition: "width 0.4s ease, background 0.3s",
                  }} />
                </button>
              ))}
            </div>
          </div>

          {/* Slide label */}
          <div style={{
            position: "absolute", bottom: 24, left: 80,
            fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 2,
            color: "rgba(245,240,232,0.35)", textTransform: "uppercase",
          }}>
            {HERO_SLIDES[slide].label} — {HERO_SLIDES[slide].sub}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4, height: 3, display: "flex" }}>
          {HERO_SLIDES.map((s, i) => (
            <div key={s.id} onClick={() => goSlide(i)} style={{
              flex: 1, height: "100%", cursor: "pointer",
              background: i === slide ? "var(--amber)" : "rgba(245,240,232,0.15)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* ── MARQUEE STRIP ── */}
      <div style={{
        background: "var(--ink)", padding: "11px 0", overflow: "hidden",
        borderTop: "1px solid rgba(245,240,232,0.06)",
      }}>
        <div style={{ display: "flex", animation: "marquee 22s linear infinite", width: "max-content" }}>
          {Array(6).fill(null).map((_, gi) => (
            <span key={gi} style={{ display: "inline-flex" }}>
              {["The Autumn Edit", "Free Shipping Over ₦50K", "35 New Pieces", "Verified Store", "Returns Within 14 Days", "Premium Nigerian Fashion", "Made to Last"].map((t, i) => (
                <span key={i} style={{
                  fontFamily: "var(--mono)", fontSize: 9, fontWeight: 500,
                  color: "rgba(245,240,232,0.5)", letterSpacing: 2,
                  textTransform: "uppercase", padding: "0 28px",
                  borderRight: "1px solid rgba(245,240,232,0.1)",
                }}>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── BRAND STATEMENT ── */}
      <div ref={quoteRef} style={{ padding: "100px 48px", background: "var(--white)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div style={{
              opacity: quoteVis ? 1 : 0,
              transform: quoteVis ? "translateX(0)" : "translateX(-40px)",
              transition: "opacity 0.85s ease, transform 0.85s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--amber)" }} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--amber)", fontFamily: "var(--mono)" }}>
                  Our Manifesto
                </span>
              </div>
              <blockquote style={{
                fontFamily: "var(--serif)", fontStyle: "italic",
                fontSize: "clamp(26px, 3.5vw, 44px)",
                fontWeight: 400, color: "var(--ink)",
                lineHeight: 1.3, letterSpacing: -0.5,
                borderLeft: "3px solid var(--amber)",
                paddingLeft: 28,
              }}>
                "We believe the best wardrobe is not the largest one — it's the most considered."
              </blockquote>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 24, lineHeight: 1.8, maxWidth: 440 }}>
                Every piece in the Autumn Edit is designed to work within a wardrobe, not compete with it. Long fibres. Precise cuts. Colours that hold their depth across years.
              </p>

              <div style={{ display: "flex", gap: 28, marginTop: 40 }}>
                {[["35", "New Pieces"], ["14", "Day Returns"], ["4.9★", "Avg. Rating"]].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.8 }}>{v}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: store card */}
            <div style={{
              opacity: quoteVis ? 1 : 0,
              transform: quoteVis ? "translateX(0)" : "translateX(40px)",
              transition: "opacity 0.85s ease 0.15s, transform 0.85s ease 0.15s",
            }}>
              <div style={{
                background: "var(--ink)", borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 32px 72px rgba(26,24,18,0.16)",
              }}>
                {/* Cover */}
                <div style={{ height: 180, overflow: "hidden', position: 'relative", position: "relative" }}>
                  <div style={{
                    width: "100%", height: "100%",
                    backgroundImage: `url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80)`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    opacity: 0.6,
                  }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, var(--ink) 100%)" }} />
                </div>
                {/* Store info */}
                <div style={{ padding: "20px 24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: "var(--amber-d)", border: "1.5px solid var(--amber)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 900, color: "var(--amber2)" }}>FL</span>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "var(--serif)", fontSize: 15, fontWeight: 700, color: "var(--bone)" }}>Foundry Label</span>
                        <svg width="14" height="14" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#1A73C9"/><path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(245,240,232,0.4)" }}>@foundrylabel · Lagos, NG</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(245,240,232,0.08)", borderBottom: "1px solid rgba(245,240,232,0.08)", margin: "0 0 16px" }}>
                    {[["284", "Products"], ["24K+", "Sales"], ["4.9★", "Rating"]].map((s, i, a) => (
                      <div key={s[1]} style={{
                        flex: 1, padding: "12px 0", textAlign: "center",
                        borderRight: i < a.length-1 ? "1px solid rgba(245,240,232,0.08)" : "none",
                      }}>
                        <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 700, color: "var(--amber2)" }}>{s[0]}</div>
                        <div style={{ fontSize: 8, color: "rgba(245,240,232,0.35)", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{s[1]}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{
                    width: "100%", background: "var(--amber)", color: "var(--ink)",
                    border: "none", borderRadius: 8, padding: "12px 0",
                    fontSize: 10, fontWeight: 800, letterSpacing: 1.5,
                    textTransform: "uppercase", cursor: "pointer", fontFamily: "var(--sans)",
                  }}>
                    Visit Store on WooSho
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <div ref={productsRef} style={{ padding: "96px 48px", background: "var(--bone)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            marginBottom: 52,
            opacity: productsVis ? 1 : 0,
            transform: productsVis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--amber)" }} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--amber)", fontFamily: "var(--mono)" }}>
                  Campaign Products
                </span>
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(28px, 3.8vw, 52px)", fontWeight: 700, color: "var(--ink)", letterSpacing: -1.2, lineHeight: 1 }}>
                The Autumn Edit.
              </h2>
            </div>
            <a href="#" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textDecoration: "none", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid var(--bone3)", paddingBottom: 2 }}>
              View Full Collection →
            </a>
          </div>

          {/* Products grid — hero left, 3 right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
            {FEATURED_PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} p={p} delay={i * 80} visible={productsVis} large={i === 0} />
            ))}
          </div>
        </div>
      </div>

      {/* ── EDITORIAL SPLIT ── */}
      <div style={{ background: "var(--ink)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Left: image */}
          <div style={{ height: 560, overflow: "hidden", position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=85)",
              backgroundSize: "cover", backgroundPosition: "center",
              animation: "zoomIn 1.2s ease both",
            }} />
          </div>
          {/* Right: copy */}
          <div style={{
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "72px 72px",
          }}>
            <Reveal delay={100}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--amber)" }} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--amber)", fontFamily: "var(--mono)" }}>
                  The Foundry Approach
                </span>
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px, 3.2vw, 44px)", fontWeight: 600, fontStyle: "italic", color: "var(--bone)", letterSpacing: -0.8, lineHeight: 1.15, marginBottom: 24 }}>
                Every piece begins with a single question.
              </h2>
              <p style={{ fontSize: 14, color: "rgba(245,240,232,0.55)", lineHeight: 1.85, marginBottom: 36, maxWidth: 400 }}>
                Will you still reach for it in five years? If the answer isn't immediately yes, it doesn't make the collection. That's the Foundry principle — and it's been the same since we opened our first studio in Lagos in 2021.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{
                  background: "var(--amber)", color: "var(--ink)", border: "none",
                  borderRadius: 9, padding: "13px 28px", fontSize: 10,
                  fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "var(--sans)",
                }}>
                  Shop Now
                </button>
                <button style={{
                  background: "transparent", color: "rgba(245,240,232,0.65)",
                  border: "1px solid rgba(245,240,232,0.2)", borderRadius: 9,
                  padding: "13px 24px", fontSize: 10, fontWeight: 600,
                  letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                  fontFamily: "var(--sans)",
                }}>
                  Our Story
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── LOOKBOOK GRID ── */}
      <div ref={lookbookRef} style={{ padding: "96px 48px", background: "var(--white)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ display: "inline-block", width: 24, height: 1.5, background: "var(--amber)" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--amber)", fontFamily: "var(--mono)" }}>Lookbook</span>
                </div>
                <h2 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(26px, 3.5vw, 48px)", fontWeight: 700, color: "var(--ink)", letterSpacing: -1, lineHeight: 1 }}>
                  The season in frames.
                </h2>
              </div>
              <a href="#" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textDecoration: "none", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid var(--bone3)", paddingBottom: 2 }}>
                Full Lookbook →
              </a>
            </div>
          </Reveal>

          {/* Lookbook mosaic */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gridTemplateRows: "300px 300px", gap: 12 }}>
            {/* Col 1: two portrait stacked */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[LOOKBOOK[0], LOOKBOOK[1]].map((item, i) => (
                <Reveal key={i} delay={i * 80} style={{ flex: 1, overflow: "hidden", borderRadius: 14, background: "var(--bone2)" }}>
                  <div style={{
                    width: "100%", height: "100%",
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    transition: "transform 0.7s ease",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                </Reveal>
              ))}
            </div>
            {/* Col 2: portrait + label */}
            <Reveal delay={120} style={{ overflow: "hidden", borderRadius: 14, background: "var(--bone2)", gridRow: "1 / 3" }}>
              <div style={{
                width: "100%", height: "100%", position: "relative",
                backgroundImage: `url(${LOOKBOOK[3].img})`,
                backgroundSize: "cover", backgroundPosition: "center",
                transition: "transform 0.7s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(26,24,18,0.7) 0%, transparent 60%)",
                  padding: "24px 20px 20px",
                }}>
                  <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--bone)", margin: 0 }}>{LOOKBOOK[3].caption}</p>
                </div>
              </div>
            </Reveal>
            {/* Col 3: wide landscape */}
            <Reveal delay={160} style={{ overflow: "hidden", borderRadius: 14, background: "var(--bone2)", gridRow: "1 / 3", position: "relative" }}>
              <div style={{
                width: "100%", height: "100%",
                backgroundImage: `url(${LOOKBOOK[2].img})`,
                backgroundSize: "cover", backgroundPosition: "center",
                transition: "transform 0.7s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              />
              <div style={{
                position: "absolute", bottom: 20, left: 20,
                background: "rgba(253,252,249,0.92)", backdropFilter: "blur(8px)",
                borderRadius: 8, padding: "8px 14px",
              }}>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 12, color: "var(--ink)", margin: 0 }}>{LOOKBOOK[2].caption}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{
        background: "var(--ink2)", padding: "80px 48px",
        overflow: "hidden", position: "relative",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 64, color: "var(--amber)", lineHeight: 0.6, marginBottom: 28, opacity: 0.5 }}>"</div>

          <div style={{ minHeight: 100, position: "relative" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                position: i === tsIdx ? "relative" : "absolute",
                inset: 0,
                opacity: i === tsIdx ? 1 : 0,
                transform: i === tsIdx ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
                pointerEvents: i === tsIdx ? "auto" : "none",
              }}>
                <p style={{
                  fontFamily: "var(--serif)", fontStyle: "italic",
                  fontSize: "clamp(18px, 2.5vw, 26px)",
                  color: "var(--bone)", lineHeight: 1.55, letterSpacing: -0.3,
                  marginBottom: 24,
                }}>
                  {t.quote}
                </p>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--amber2)" }}>{t.author}</span>
                  <span style={{ fontSize: 11, color: "rgba(245,240,232,0.35)", marginLeft: 8 }}>{t.city}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTsIdx(i)} style={{
                width: i === tsIdx ? 24 : 6, height: 6,
                borderRadius: 3, border: "none", cursor: "pointer",
                background: i === tsIdx ? "var(--amber)" : "rgba(245,240,232,0.2)",
                transition: "width 0.3s ease, background 0.3s ease",
                padding: 0,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── STORE INFO BAR ── */}
      <div ref={storeRef} style={{
        background: "var(--bone2)", borderTop: "1px solid var(--bone3)",
        borderBottom: "1px solid var(--bone3)",
        padding: "32px 48px",
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
            opacity: storeVis ? 1 : 0,
            transform: storeVis ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: "var(--ink)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 900, color: "var(--amber2)" }}>FL</span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 7 }}>
                  Foundry Label
                  <svg width="15" height="15" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#1A73C9"/><path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <Stars n={5} />
                  <span>4.9 · 8,420 reviews · Lagos, NG</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 32 }}>
              {[
                { icon: "🚚", label: "Free shipping", sub: "Orders over ₦50,000" },
                { icon: "↩", label: "14-day returns", sub: "No questions asked" },
                { icon: "🔒", label: "Secure payment", sub: "WooSho escrow protected" },
                { icon: "⚡", label: "Ships in 24h", sub: "Fast Shipper verified" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)" }}>{item.label}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)" }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <button style={{
              background: "var(--ink)", color: "var(--bone)", border: "none",
              borderRadius: 10, padding: "12px 24px", fontSize: 10,
              fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
              cursor: "pointer", fontFamily: "var(--sans)",
              flexShrink: 0,
            }}>
              Visit Store →
            </button>
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{
        background: "var(--ink)", padding: "112px 48px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Background image ghost */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=70)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.07,
        }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ display: "inline-block", width: 32, height: 1.5, background: "var(--amber)" }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--amber)", fontFamily: "var(--mono)" }}>
                Shop The Campaign
              </span>
              <span style={{ display: "inline-block", width: 32, height: 1.5, background: "var(--amber)" }} />
            </div>

            <h2 style={{
              fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 900,
              fontSize: "clamp(40px, 6vw, 88px)",
              color: "var(--bone)", letterSpacing: -2.5, lineHeight: 0.95,
              marginBottom: 28,
            }}>
              {CAMPAIGN.tagline}
            </h2>

            <p style={{ fontSize: 15, color: "rgba(245,240,232,0.5)", maxWidth: 420, margin: "0 auto 44px", lineHeight: 1.8 }}>
              35 new pieces available now on WooSho. Free shipping on orders over ₦50,000.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              <button style={{
                background: "var(--amber)", color: "var(--ink)", border: "none",
                borderRadius: 10, padding: "16px 44px", fontSize: 12,
                fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
                cursor: "pointer", fontFamily: "var(--sans)",
                boxShadow: "0 0 48px rgba(184,134,42,0.4)",
              }}>
                Shop The Edit
              </button>
              <button style={{
                background: "transparent", color: "rgba(245,240,232,0.7)",
                border: "1px solid rgba(245,240,232,0.2)", borderRadius: 10,
                padding: "16px 32px", fontSize: 12, fontWeight: 600,
                letterSpacing: 1, textTransform: "uppercase",
                cursor: "pointer", fontFamily: "var(--sans)",
              }}>
                Visit Store
              </button>
            </div>

            {/* Sponsored disclaimer */}
            <div style={{ marginTop: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ width: 1, height: 12, background: "rgba(245,240,232,0.15)" }} />
              <SponsoredLabel />
              <span style={{ fontSize: 10, color: "rgba(245,240,232,0.25)", fontFamily: "var(--mono)", letterSpacing: 0.5 }}>
                This is a paid placement by {CAMPAIGN.brand} on WooSho Marketplace
              </span>
              <span style={{ width: 1, height: 12, background: "rgba(245,240,232,0.15)" }} />
            </div>
          </div>
        </Reveal>
      </div>

    </div>
  );
}