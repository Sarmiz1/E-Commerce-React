import { useState, useRef, useEffect, useCallback } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --w:    #FAFAF8;
    --w2:   #F2F0EC;
    --w3:   #E8E4DC;
    --ink:  #0E0E0C;
    --ink2: #1C1C18;
    --ink3: #2E2E28;
    --mid:  #6B6960;
    --dim:  rgba(14,14,12,0.4);
    --dim2: rgba(14,14,12,0.12);
    --red:  #D63A2A;
    --red2: #F04535;
    --red-d:rgba(214,58,42,0.12);
    --serif:'Instrument Serif', Georgia, serif;
    --sans: 'Sora', sans-serif;
    --mono: 'DM Mono', monospace;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--w); color: var(--ink); font-family: var(--sans);
         -webkit-font-smoothing: antialiased; }
  ::selection { background: var(--ink); color: var(--w); }

  @keyframes up {
    from { opacity:0; transform:translateY(36px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideX  { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes zoomBg  { from{transform:scale(1.07)} to{transform:scale(1)} }
  @keyframes mq      { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulseDot{ 0%,100%{opacity:1}50%{opacity:0.3} }
  @keyframes drawBar {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); transform-origin: left; }
  }
`;

/* ─── UTILS ──────────────────────────────────────────────────────────────── */
function useInView(ref, t = 0.1) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.disconnect(); }
    }, { threshold: t });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

function Fade({ children, delay = 0, x = false, style = {} }) {
  const ref = useRef(null);
  const v = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : x ? "translateX(24px)" : "translateY(28px)",
      transition: `opacity .75s ease ${delay}ms, transform .75s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const PRODUCT = {
  name: "The Obsidian Coat",
  brand: "Foundry Label",
  handle: "@foundrylabel",
  tagline: "Built once. Worn forever.",
  price: 520000,
  originalPrice: null,
  category: "Outerwear",
  sku: "FL-OC-001",
  rating: 4.9,
  reviewCount: 528,
  soldCount: 1240,
  badge: "Campaign Hero",
  material: "Italian Boucle · Merino Wool blend · Unlined",
  origin: "Handcrafted in Lagos, Nigeria",
  fit: "Oversized, structured shoulder. Fits true to size.",
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: [
    { name: "Obsidian", hex: "#1C1C18", img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&q=90" },
    { name: "Camel", hex: "#C4956A", img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=900&q=90" },
    { name: "Ivory", hex: "#F0EBE0", img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&q=90" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=90",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=90",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=90",
  ],
  features: [
    { icon: "🧵", label: "Italian Boucle", desc: "Sourced from Como, Italy. Dense loop construction holds its shape for years." },
    { icon: "✂️", label: "Precision Cut", desc: "Structured shoulder with a single-button fastening. No excess." },
    { icon: "🌿", label: "Unlined", desc: "Breathable construction. Layers comfortably over knitwear." },
    { icon: "🛡", label: "12-Month Warranty", desc: "Craftsmanship guarantee on all seams and hardware." },
  ],
  reviews: [
    { author: "Amara T.", city: "Lagos", rating: 5, date: "May 28, 2025", text: "The weight of this coat is extraordinary. It drapes perfectly and holds its structure even after multiple wears. Best purchase I've made this year.", verified: true, product: "Obsidian" },
    { author: "Zara F.", city: "Abuja", rating: 5, date: "May 15, 2025", text: "I was hesitant about the price but the quality absolutely justifies it. The boucle texture photographs beautifully and it feels even better in person.", verified: true, product: "Obsidian" },
    { author: "Dayo B.", city: "Port Harcourt", rating: 5, date: "May 10, 2025", text: "Worn it to four events already. People stop me every single time. This is what Nigerian fashion should be.", verified: false, product: "Camel" },
  ],
  related: [
    { id: 1, name: "Wool Cargo Trouser", price: 175000, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", tag: "Pairs Well" },
    { id: 2, name: "Slim Turtleneck", price: 110000, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", tag: "Layer Under" },
    { id: 3, name: "Linen Oversized Blazer", price: 289000, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", tag: "Also Sponsored" },
    { id: 4, name: "Structured Tote", price: 195000, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", tag: "Complete The Look" },
  ],
};

const DIST = [
  { star: 5, pct: 88 },
  { star: 4, pct: 8 },
  { star: 3, pct: 3 },
  { star: 2, pct: 1 },
  { star: 1, pct: 0 },
];

/* ─── ATOMS ──────────────────────────────────────────────────────────────── */
function Sponsored() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "var(--red-d)", border: "1px solid rgba(214,58,42,0.22)",
      borderRadius: 4, padding: "3px 9px",
      fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
      color: "var(--red)", fontFamily: "var(--mono)",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--red)", animation: "pulseDot 1.8s ease infinite" }} />
      Sponsored
    </span>
  );
}

function Stars({ n = 5, size = 11 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 10 10"
          fill={i <= n ? "var(--red)" : "var(--w3)"}>
          <path d="M5 .5l1.1 3.1H9.3L6.7 5.6l1 3.1L5 7l-2.7 1.7 1-3.1L.7 3.6h3.2z"/>
        </svg>
      ))}
    </span>
  );
}

function Divider({ my = 64 }) {
  return <div style={{ height: 1, background: "var(--w3)", margin: `${my}px 0` }} />;
}

function fmt(n) { return "₦" + (n / 100).toLocaleString("en-NG"); }

/* ─── RELATED CARD ───────────────────────────────────────────────────────── */
function RelatedCard({ p, delay, visible }) {
  const [hov, setHov] = useState(false);
  const [wish, setWish] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
        cursor: "pointer",
      }}
    >
      <div style={{
        borderRadius: 12, overflow: "hidden", background: "var(--w2)",
        aspectRatio: "3/4", marginBottom: 14, position: "relative",
      }}>
        <div style={{
          width: "100%", height: "100%",
          backgroundImage: `url(${p.img})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transform: hov ? "scale(1.04)" : "scale(1)",
          transition: "transform .65s ease",
        }} />
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: p.tag === "Also Sponsored" ? "var(--red)" : "var(--ink)",
          color: "var(--w)", fontSize: 8, fontWeight: 700,
          padding: "3px 8px", borderRadius: 3,
          letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "var(--mono)",
        }}>{p.tag}</div>
        <button
          onClick={e => { e.stopPropagation(); setWish(w => !w); }}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(250,250,248,0.9)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hov || wish ? 1 : 0, transform: hov || wish ? "scale(1)" : "scale(0.7)",
            transition: "opacity .2s, transform .2s", backdropFilter: "blur(4px)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24"
            fill={wish ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {hov && (
          <div style={{
            position: "absolute", bottom: 10, left: 10, right: 10,
            animation: "up .3s ease both",
          }}>
            <button style={{
              width: "100%", background: "var(--ink)", color: "var(--w)",
              border: "none", borderRadius: 7, padding: "10px 0",
              fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", cursor: "pointer", fontFamily: "var(--sans)",
            }}>Add to Cart</button>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4, letterSpacing: -0.2 }}>{p.name}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", fontFamily: "var(--serif)", fontStyle: "italic" }}>{fmt(p.price)}</p>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
export default function ProductPlacement() {
  const [activeImg, setActiveImg] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [reviewSort, setReviewSort] = useState("newest");

  const featuresRef = useRef(null);
  const reviewsRef = useRef(null);
  const relatedRef = useRef(null);
  const ctaRef = useRef(null);

  const featVis = useInView(featuresRef);
  const revVis = useInView(reviewsRef);
  const relVis = useInView(relatedRef);
  const ctaVis = useInView(ctaRef);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = G;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Auto-rotate gallery when color changes
  useEffect(() => { setActiveImg(0); }, [activeColor]);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2400);
  };

  const currentImg = PRODUCT.gallery[activeImg];

  return (
    <div style={{ background: "var(--w)", minHeight: "100vh" }}>

      {/* ── PLACEMENT BAR ── */}
      {!dismissed && (
        <div style={{
          background: "var(--ink)", padding: "9px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 300,
          animation: "fadeIn .4s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15, fontWeight: 700, color: "var(--w)", letterSpacing: -0.3 }}>
              Woo<span style={{ color: "#F04535" }}>Sho</span>
            </span>
            <div style={{ width: 1, height: 14, background: "rgba(250,250,248,0.15)" }} />
            <Sponsored />
            <span style={{ fontSize: 10, color: "rgba(250,250,248,0.4)", fontFamily: "var(--mono)", letterSpacing: 0.3 }}>
              Promoted product by {PRODUCT.brand}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="#" style={{ fontSize: 9, color: "rgba(250,250,248,0.35)", textDecoration: "none", letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "var(--mono)" }}>
              Why this ad?
            </a>
            <button onClick={() => setDismissed(true)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(250,250,248,0.35)", display: "flex", alignItems: "center", padding: 4,
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 2l9 9M11 2L2 11"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <nav style={{
        position: "sticky", top: dismissed ? 0 : 40, zIndex: 200,
        background: "rgba(250,250,248,0.95)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--w3)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", animation: "pulseDot 2s ease infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--mid)", letterSpacing: 0.3, fontFamily: "var(--mono)" }}>
              Sponsored Product
            </span>
            <span style={{ fontSize: 10, color: "var(--w3)", padding: "0 6px" }}>·</span>
            <span style={{ fontSize: 10, color: "var(--mid)", fontFamily: "var(--mono)" }}>{PRODUCT.brand}</span>
          </div>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--mid)" }}>
            <a href="#" style={{ color: "var(--mid)", textDecoration: "none" }}>WooSho</a>
            <span style={{ color: "var(--w3)" }}>›</span>
            <a href="#" style={{ color: "var(--mid)", textDecoration: "none" }}>Outerwear</a>
            <span style={{ color: "var(--w3)" }}>›</span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{PRODUCT.name}</span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{
              background: "none", border: "1px solid var(--w3)", borderRadius: 7,
              padding: "7px 14px", fontSize: 10, fontWeight: 600, color: "var(--ink)",
              cursor: "pointer", fontFamily: "var(--sans)",
            }}>
              {PRODUCT.brand} Store →
            </button>
            <button style={{
              background: "var(--ink)", color: "var(--w)", border: "none",
              borderRadius: 7, padding: "7px 18px", fontSize: 10, fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.5, fontFamily: "var(--sans)",
            }}>
              Buy Now
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN PRODUCT ZONE ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 48px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: 72, alignItems: "start" }}>

          {/* ── LEFT: GALLERY ── */}
          <div style={{ position: "sticky", top: dismissed ? 60 : 100 }}>
            {/* Main image */}
            <div style={{
              borderRadius: 20, overflow: "hidden",
              background: "var(--w2)", aspectRatio: "3/4",
              marginBottom: 14, position: "relative",
              animation: "fadeIn .7s ease both",
            }}>
              {PRODUCT.gallery.map((img, i) => (
                <div key={i} style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover", backgroundPosition: "center top",
                  opacity: i === activeImg ? 1 : 0,
                  transform: i === activeImg ? "scale(1)" : "scale(1.03)",
                  transition: "opacity .65s cubic-bezier(.4,0,.2,1), transform .65s ease",
                  animation: i === activeImg ? "zoomBg .9s ease both" : "none",
                }} />
              ))}

              {/* Campaign badge */}
              <div style={{
                position: "absolute", top: 18, left: 18,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <span style={{
                  background: "var(--red)", color: "var(--w)",
                  fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
                  padding: "4px 10px", borderRadius: 4,
                  textTransform: "uppercase", fontFamily: "var(--mono)",
                  display: "inline-block",
                }}>Campaign Hero</span>
                <Sponsored />
              </div>

              {/* Wishlist */}
              <button
                onClick={() => setWished(w => !w)}
                style={{
                  position: "absolute", top: 18, right: 18,
                  width: 38, height: 38, borderRadius: "50%",
                  background: "rgba(250,250,248,0.92)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(14,14,12,0.1)",
                  backdropFilter: "blur(4px)",
                  transition: "transform .2s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill={wished ? "var(--ink)" : "none"}
                  stroke="var(--ink)" strokeWidth="1.7">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>

              {/* Arrow nav */}
              {activeImg > 0 && (
                <button onClick={() => setActiveImg(i => i - 1)} style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(250,250,248,0.92)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}>
                  <svg width="14" height="14" fill="none" stroke="var(--ink)" strokeWidth="2"><path d="M9 2L3 7l6 5"/></svg>
                </button>
              )}
              {activeImg < PRODUCT.gallery.length - 1 && (
                <button onClick={() => setActiveImg(i => i + 1)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  width: 36, height: 36, borderRadius: "50%",
                  background: "rgba(250,250,248,0.92)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}>
                  <svg width="14" height="14" fill="none" stroke="var(--ink)" strokeWidth="2"><path d="M5 2l6 5-6 5"/></svg>
                </button>
              )}

              {/* Counter */}
              <div style={{
                position: "absolute", bottom: 14, right: 14,
                background: "rgba(14,14,12,0.55)", backdropFilter: "blur(6px)",
                borderRadius: 20, padding: "4px 10px",
                fontFamily: "var(--mono)", fontSize: 10, color: "rgba(250,250,248,0.85)", letterSpacing: 1,
              }}>
                {activeImg + 1} / {PRODUCT.gallery.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div style={{ display: "flex", gap: 10 }}>
              {PRODUCT.gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  flex: 1, aspectRatio: "1/1", borderRadius: 10, overflow: "hidden",
                  border: "2px solid", borderColor: i === activeImg ? "var(--ink)" : "transparent",
                  cursor: "pointer", padding: 0, background: "var(--w2)",
                  transition: "border-color .2s ease",
                }}>
                  <div style={{
                    width: "100%", height: "100%",
                    backgroundImage: `url(${img})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    opacity: i === activeImg ? 1 : 0.55,
                    transition: "opacity .2s",
                  }} />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: PRODUCT INFO ── */}
          <div style={{ paddingTop: 8 }}>

            {/* Brand + category */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
              animation: "up .7s ease .05s both",
            }}>
              <a href="#" style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", textDecoration: "none", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "var(--mono)" }}>
                {PRODUCT.brand}
              </a>
              <span style={{ color: "var(--w3)" }}>·</span>
              <span style={{ fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--mono)" }}>{PRODUCT.category}</span>
              <span style={{ color: "var(--w3)" }}>·</span>
              <span style={{ fontSize: 9, color: "var(--mid)", fontFamily: "var(--mono)" }}>SKU: {PRODUCT.sku}</span>
            </div>

            {/* Product name */}
            <h1 style={{
              fontFamily: "var(--serif)", fontStyle: "italic",
              fontSize: "clamp(32px, 4vw, 54px)",
              fontWeight: 400, color: "var(--ink)", letterSpacing: -1.2,
              lineHeight: 1.05, marginBottom: 12,
              animation: "up .75s ease .12s both",
            }}>
              {PRODUCT.name}
            </h1>

            {/* Tagline */}
            <p style={{
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--mid)",
              letterSpacing: 2, textTransform: "uppercase", marginBottom: 22,
              animation: "up .75s ease .2s both",
            }}>
              — {PRODUCT.tagline}
            </p>

            {/* Rating + sold */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14, marginBottom: 28,
              animation: "up .75s ease .26s both",
            }}>
              <Stars n={PRODUCT.rating} size={12} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{PRODUCT.rating}</span>
              <span style={{ fontSize: 11, color: "var(--mid)" }}>({PRODUCT.reviewCount} reviews)</span>
              <span style={{ color: "var(--w3)" }}>·</span>
              <span style={{ fontSize: 11, color: "var(--mid)" }}>{PRODUCT.soldCount.toLocaleString()} sold</span>
            </div>

            {/* Price */}
            <div style={{
              display: "flex", alignItems: "baseline", gap: 12, marginBottom: 32,
              animation: "up .75s ease .32s both",
            }}>
              <span style={{
                fontFamily: "var(--serif)", fontStyle: "italic",
                fontSize: 38, fontWeight: 700, color: "var(--ink)", letterSpacing: -1,
              }}>
                {fmt(PRODUCT.price)}
              </span>
              {PRODUCT.originalPrice && (
                <span style={{ fontSize: 18, color: "var(--mid)", textDecoration: "line-through", fontFamily: "var(--serif)" }}>
                  {fmt(PRODUCT.originalPrice)}
                </span>
              )}
            </div>

            {/* Horizontal divider */}
            <div style={{ height: 1, background: "var(--w3)", marginBottom: 28, animation: "up .75s ease .36s both" }} />

            {/* Color selector */}
            <div style={{ marginBottom: 28, animation: "up .75s ease .4s both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--mono)" }}>
                  Colour
                </span>
                <span style={{ fontSize: 11, color: "var(--red)", fontWeight: 600 }}>
                  {PRODUCT.colors[activeColor].name}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {PRODUCT.colors.map((c, i) => (
                  <button key={c.name} onClick={() => setActiveColor(i)} style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: c.hex, border: "3px solid",
                    borderColor: i === activeColor ? "var(--ink)" : "transparent",
                    outline: i === activeColor ? "2px solid var(--w)" : "none",
                    outlineOffset: -5,
                    cursor: "pointer", transition: "border-color .2s, outline .2s",
                    boxShadow: "0 1px 4px rgba(14,14,12,0.14)",
                  }} title={c.name} />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom: 32, animation: "up .75s ease .46s both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--mono)" }}>
                  Size
                </span>
                <a href="#" style={{ fontSize: 11, color: "var(--mid)", textDecoration: "underline", textDecorationColor: "var(--w3)" }}>Size Guide →</a>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {PRODUCT.sizes.map(s => (
                  <button key={s} onClick={() => setActiveSize(s)} style={{
                    width: 48, height: 48, borderRadius: 10, border: "1.5px solid",
                    borderColor: activeSize === s ? "var(--ink)" : "var(--w3)",
                    background: activeSize === s ? "var(--ink)" : "var(--w)",
                    color: activeSize === s ? "var(--w)" : "var(--ink)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    transition: "all .2s ease", fontFamily: "var(--sans)",
                  }}>{s}</button>
                ))}
              </div>
              <p style={{ fontSize: 10, color: "var(--mid)", marginTop: 10 }}>{PRODUCT.fit}</p>
            </div>

            {/* Qty + CTA */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, animation: "up .75s ease .52s both" }}>
              {/* Qty stepper */}
              <div style={{
                display: "flex", alignItems: "center", gap: 0,
                border: "1.5px solid var(--w3)", borderRadius: 10, overflow: "hidden",
                flexShrink: 0,
              }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                  width: 40, height: 52, background: "none", border: "none",
                  cursor: "pointer", fontSize: 18, color: "var(--ink)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>−</button>
                <span style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{
                  width: 40, height: 52, background: "none", border: "none",
                  cursor: "pointer", fontSize: 18, color: "var(--ink)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1, height: 52, background: addedToCart ? "#1A7A45" : "var(--ink)",
                  color: "var(--w)", border: "none", borderRadius: 10,
                  fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
                  textTransform: "uppercase", cursor: "pointer",
                  transition: "background .35s ease",
                  fontFamily: "var(--sans)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {addedToCart ? (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 7l4 4 7-7"/></svg>
                    Added to Cart
                  </>
                ) : "Add to Cart"}
              </button>
            </div>

            {/* Buy now */}
            <button style={{
              width: "100%", height: 52,
              background: "var(--red)", color: "var(--w)", border: "none",
              borderRadius: 10, fontSize: 11, fontWeight: 800,
              letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
              fontFamily: "var(--sans)", marginBottom: 24,
              animation: "up .75s ease .58s both",
              boxShadow: "0 8px 28px rgba(214,58,42,0.28)",
              transition: "box-shadow .25s ease, transform .2s ease",
            }}
              onMouseEnter={e => { e.target.style.boxShadow = "0 12px 40px rgba(214,58,42,0.4)"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.boxShadow = "0 8px 28px rgba(214,58,42,0.28)"; e.target.style.transform = "none"; }}
            >
              Buy Now · {fmt(PRODUCT.price * qty)}
            </button>

            {/* Trust signals */}
            <div style={{
              background: "var(--w2)", borderRadius: 12, padding: "16px 18px",
              display: "flex", flexDirection: "column", gap: 10,
              animation: "up .75s ease .64s both",
            }}>
              {[
                { icon: "🔒", text: "Secured by WooSho Escrow — payment held until delivery confirmed" },
                { icon: "🚚", text: "Ships within 24 hours · Estimated delivery 1–3 days (Lagos)" },
                { icon: "↩", text: "14-day hassle-free returns on unworn items" },
                { icon: "🛡", text: "12-month craftsmanship warranty on all seams & hardware" },
              ].map(t => (
                <div key={t.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
                  <span style={{ fontSize: 11, color: "var(--mid)", lineHeight: 1.6 }}>{t.text}</span>
                </div>
              ))}
            </div>

            {/* Share + report */}
            <div style={{
              display: "flex", gap: 16, marginTop: 18,
              animation: "up .75s ease .7s both",
            }}>
              <button style={{ background: "none", border: "none", fontSize: 10, color: "var(--mid)", cursor: "pointer", display: "flex", gap: 5, alignItems: "center", fontFamily: "var(--sans)" }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
                Share
              </button>
              <button style={{ background: "none", border: "none", fontSize: 10, color: "var(--mid)", cursor: "pointer", display: "flex", gap: 5, alignItems: "center", fontFamily: "var(--sans)" }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                Report Ad
              </button>
              <button style={{ background: "none", border: "none", fontSize: 10, color: "var(--mid)", cursor: "pointer", display: "flex", gap: 5, alignItems: "center", fontFamily: "var(--sans)" }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Ask Seller
              </button>
            </div>

          </div>
        </div>

        {/* ── DETAIL TABS ── */}
        <div style={{ marginTop: 80 }}>
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--w3)", marginBottom: 48 }}>
            {[["details", "Product Details"], ["features", "Features"], ["care", "Care & Origin"]].map(([k, label]) => (
              <button key={k} onClick={() => setActiveTab(k)} style={{
                background: "none", border: "none",
                borderBottom: `2px solid ${activeTab === k ? "var(--ink)" : "transparent"}`,
                padding: "14px 24px", fontSize: 12, fontWeight: activeTab === k ? 700 : 500,
                color: activeTab === k ? "var(--ink)" : "var(--mid)",
                cursor: "pointer", letterSpacing: 0.3, transition: "color .2s, border-color .2s",
                fontFamily: "var(--sans)", marginBottom: -1,
              }}>{label}</button>
            ))}
          </div>

          {activeTab === "details" && (
            <Fade>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", marginBottom: 16, letterSpacing: -0.4 }}>About This Piece</h3>
                  <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.85 }}>
                    The Obsidian Coat is the product of three seasons of development. The boucle was sourced from a mill in Como, Italy, chosen specifically for its loop density and the way it holds its form under the Nigerian sun. The silhouette is oversized at the shoulder and structured at the hem — designed to be worn as the final layer, the one that defines the outfit.
                  </p>
                  <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.85, marginTop: 16 }}>
                    Single-button fastening. Welt pockets at the hip. No lining — intentionally — so it breathes and layers without bulk.
                  </p>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", marginBottom: 16, letterSpacing: -0.4 }}>Specifications</h3>
                  {[
                    ["Material", PRODUCT.material],
                    ["Origin", PRODUCT.origin],
                    ["Fit", PRODUCT.fit],
                    ["Available In", PRODUCT.colors.map(c => c.name).join(", ")],
                    ["Sizes", PRODUCT.sizes.join(", ")],
                    ["SKU", PRODUCT.sku],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--w2)" }}>
                      <span style={{ fontSize: 11, color: "var(--mid)", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "var(--mono)" }}>{k}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", textAlign: "right", maxWidth: "55%" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Fade>
          )}

          {activeTab === "features" && (
            <Fade>
              <div ref={featuresRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {PRODUCT.features.map((f, i) => (
                  <div key={f.label} style={{
                    background: "var(--w2)", borderRadius: 14, padding: "28px 22px",
                    border: "1px solid var(--w3)",
                    opacity: featVis ? 1 : 0,
                    transform: featVis ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity .6s ease ${i * 80}ms, transform .6s ease ${i * 80}ms`,
                  }}>
                    <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{f.label}</h4>
                    <p style={{ fontSize: 12, color: "var(--mid)", lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </Fade>
          )}

          {activeTab === "care" && (
            <Fade>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", marginBottom: 20 }}>Care Instructions</h3>
                  {["Dry clean only", "Do not machine wash", "Store hanging — never folded", "Use a lint roller to remove surface fibres", "Air out after wearing before storing", "Spot treat stains immediately with cold water"].map(c => (
                    <div key={c} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--w2)" }}>
                      <span style={{ color: "var(--red)", fontWeight: 700, flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: 13, color: "var(--mid)" }}>{c}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--ink)", marginBottom: 20 }}>Origin & Craft</h3>
                  <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.85 }}>
                    Every Foundry Label coat is cut, sewn, and finished in our Lagos studio. The boucle fabric is imported directly from Como, Italy — we maintain a direct relationship with the mill and audit their production annually.
                  </p>
                  <div style={{ marginTop: 24, display: "flex", gap: 20 }}>
                    {[["Lagos", "Studio Location"], ["Como, IT", "Fabric Source"], ["2021", "Est."]].map(([v, l]) => (
                      <div key={l}>
                        <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{v}</div>
                        <div style={{ fontSize: 9, color: "var(--mid)", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Fade>
          )}
        </div>

        <Divider my={80} />

        {/* ── REVIEWS ── */}
        <div ref={reviewsRef}>
          <Fade>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 1.5, background: "var(--red)" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--red)", fontFamily: "var(--mono)" }}>Reviews</span>
                </div>
                <h2 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(24px, 3vw, 40px)", color: "var(--ink)", letterSpacing: -0.8, lineHeight: 1 }}>
                  What buyers say.
                </h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["newest", "Newest"], ["highest", "Highest"], ["lowest", "Lowest"]].map(([v, l]) => (
                  <button key={v} onClick={() => setReviewSort(v)} style={{
                    background: reviewSort === v ? "var(--ink)" : "var(--w)",
                    border: "1px solid", borderColor: reviewSort === v ? "var(--ink)" : "var(--w3)",
                    borderRadius: 20, padding: "6px 14px",
                    fontSize: 10, fontWeight: 600, color: reviewSort === v ? "var(--w)" : "var(--mid)",
                    cursor: "pointer", transition: "all .2s", fontFamily: "var(--sans)",
                  }}>{l}</button>
                ))}
              </div>
            </div>
          </Fade>

          {/* Rating overview */}
          <Fade delay={80}>
            <div style={{
              display: "grid", gridTemplateColumns: "240px 1fr",
              gap: 60, alignItems: "center", marginBottom: 48,
              background: "var(--w2)", borderRadius: 16, padding: "32px 36px",
              border: "1px solid var(--w3)",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 64, fontWeight: 700, color: "var(--ink)", lineHeight: 1, letterSpacing: -3 }}>
                  {PRODUCT.rating}
                </div>
                <Stars n={5} size={16} />
                <p style={{ fontSize: 11, color: "var(--mid)", marginTop: 8 }}>{PRODUCT.reviewCount.toLocaleString()} verified reviews</p>
              </div>
              <div>
                {DIST.map((d, i) => (
                  <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < DIST.length - 1 ? 9 : 0 }}>
                    <span style={{ fontSize: 10, color: "var(--mid)", width: 20, textAlign: "right", flexShrink: 0, fontFamily: "var(--mono)" }}>{d.star}★</span>
                    <div style={{ flex: 1, height: 5, background: "var(--w3)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${d.pct}%`,
                        background: d.star >= 4 ? "var(--ink)" : d.star === 3 ? "var(--mid)" : "var(--w3)",
                        borderRadius: 3,
                        animation: revVis ? `drawBar .9s ease ${i * 80}ms both` : "none",
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--mid)", width: 28, flexShrink: 0, fontFamily: "var(--mono)" }}>{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Fade>

          {/* Review cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {PRODUCT.reviews.map((r, i) => (
              <Fade key={r.author} delay={i * 80}>
                <div style={{
                  background: "var(--w)", border: "1px solid var(--w3)",
                  borderRadius: 14, padding: "24px 22px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      background: "var(--w2)", border: "2px solid var(--w3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "var(--ink)",
                    }}>
                      {r.author[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{r.author}</span>
                        {r.verified && (
                          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, color: "#1A7A45", background: "rgba(26,122,69,0.1)", padding: "2px 6px", borderRadius: 10, textTransform: "uppercase" }}>Verified</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Stars n={r.rating} size={9} />
                        <span style={{ fontSize: 9, color: "var(--mid)", fontFamily: "var(--mono)" }}>{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 9, color: "var(--red)", fontFamily: "var(--mono)", letterSpacing: 0.5, marginBottom: 8 }}>
                    Purchased: {r.product}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--mid)", lineHeight: 1.75 }}>{r.text}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>

        <Divider my={80} />

        {/* ── RELATED / COMPLETE THE LOOK ── */}
        <div ref={relatedRef}>
          <Fade>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 1.5, background: "var(--ink)" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--mid)", fontFamily: "var(--mono)" }}>From {PRODUCT.brand}</span>
                </div>
                <h2 style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(24px, 3vw, 40px)", color: "var(--ink)", letterSpacing: -0.8, lineHeight: 1 }}>
                  Complete the look.
                </h2>
              </div>
              <a href="#" style={{ fontSize: 11, fontWeight: 600, color: "var(--mid)", textDecoration: "none", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid var(--w3)", paddingBottom: 2 }}>
                Visit Store →
              </a>
            </div>
          </Fade>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {PRODUCT.related.map((p, i) => (
              <RelatedCard key={p.id} p={p} delay={i * 70} visible={relVis} />
            ))}
          </div>
        </div>

        {/* ── STICKY BUY BAR ── */}
        <div style={{ height: 120 }} />
      </div>

      {/* ── FIXED BOTTOM CTA ── */}
      <div ref={ctaRef} style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150,
        background: "rgba(250,250,248,0.97)", backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--w3)",
        padding: "14px 48px",
        transform: ctaVis ? "translateY(0)" : "translateY(100%)",
        transition: "transform .5s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 -8px 32px rgba(14,14,12,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            backgroundImage: `url(${PRODUCT.gallery[0]})`,
            backgroundSize: "cover", backgroundPosition: "center",
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.3 }}>
              {PRODUCT.name}
            </div>
            <div style={{ fontSize: 10, color: "var(--mid)", display: "flex", gap: 8, alignItems: "center" }}>
              <Stars n={PRODUCT.rating} size={9} />
              <span>{PRODUCT.reviewCount} reviews</span>
              <span>·</span>
              <span>Size: {activeSize}</span>
              <span>·</span>
              <span>{PRODUCT.colors[activeColor].name}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.8 }}>
            {fmt(PRODUCT.price * qty)}
          </span>
          <button onClick={handleAddToCart} style={{
            background: addedToCart ? "#1A7A45" : "var(--ink)", color: "var(--w)",
            border: "none", borderRadius: 10, padding: "12px 24px",
            fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            cursor: "pointer", fontFamily: "var(--sans)",
            transition: "background .3s ease",
          }}>
            {addedToCart ? "✓ Added" : "Add to Cart"}
          </button>
          <button style={{
            background: "var(--red)", color: "var(--w)", border: "none",
            borderRadius: 10, padding: "12px 24px",
            fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            cursor: "pointer", fontFamily: "var(--sans)",
          }}>
            Buy Now
          </button>
        </div>
      </div>

    </div>
  );
}