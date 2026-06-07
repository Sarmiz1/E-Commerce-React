import { useState, useRef, useEffect, useCallback } from "react";

/* ─── MOCK SELLER DATA ──────────────────────────────────────────────────────── */

const SELLER = {
  id: "foundry-label",
  name: "Foundry Label",
  handle: "@foundrylabel",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  banner: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=90",
  bio: "We build refined wardrobe essentials for those who believe that what you wear shapes how you move through the world. Every piece is considered, every material sourced with intention.",
  category: "Fashion & Apparel",
  subCategory: "Luxury Basics",
  verified: true,
  badges: ["Verified Seller", "Top Rated", "Fast Shipper", "Trusted Seller"],
  location: { city: "Lagos", state: "Lagos", country: "Nigeria" },
  joinedDate: "March 2021",
  lastActive: "2 hours ago",

  // Trust
  rating: 4.9,
  totalReviews: 8420,
  completedOrders: 24300,
  totalSales: "₦2.8B+",
  responseRate: 98,
  responseTime: "< 1 hour",
  trustScore: 96,

  // Delivery
  deliveryAreas: ["Lagos Island", "Victoria Island", "Lekki", "Ikeja", "Abuja", "Port Harcourt", "Pan-Nigeria Shipping"],
  pickupAvailable: true,
  estimatedDelivery: "1–3 business days (Lagos) · 3–7 days (Nationwide)",

  // Policies
  returnPolicy: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in original packaging with all tags attached. Sale items and intimates are non-returnable.",
  shippingPolicy: "All orders are processed within 24 hours on business days. Free shipping on orders above ₦50,000. Express delivery available at checkout.",
  warrantyPolicy: "Select leather goods and premium outerwear come with a 12-month craftsmanship warranty. Defects in materials or stitching are covered; fair wear is not.",
  cancellationPolicy: "Orders may be cancelled within 2 hours of placement. Once dispatched, cancellation is not possible. Contact support immediately for urgent requests.",
  paymentNote: "All transactions are secured and processed through WooSho's escrow system. Your payment is held until you confirm delivery.",

  // Contact
  whatsappEnabled: true,
  whatsappNumber: "+2348012345678",
};

const PRODUCT_TABS = ["All", "Featured", "Best Sellers", "New Arrivals", "On Sale"];

const PRODUCTS = [
  { id: 1, name: "Oversized Linen Blazer", price: 289000, originalPrice: null, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", tag: "Featured", rating: 4.9, reviews: 312, inStock: true, isNew: false, onSale: false, isBestSeller: true },
  { id: 2, name: "Classic Trench Coat", price: 495000, originalPrice: null, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", tag: "Best Seller", rating: 4.8, reviews: 987, inStock: true, isNew: false, onSale: false, isBestSeller: true },
  { id: 3, name: "Wool Cargo Trousers", price: 175000, originalPrice: 240000, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", tag: "Sale", rating: 4.7, reviews: 204, inStock: true, isNew: false, onSale: true, isBestSeller: false },
  { id: 4, name: "Asymmetric Linen Top", price: 135000, originalPrice: null, img: "https://images.unsplash.com/photo-1485462537746-965f33f52f86?w=400&q=80", tag: "New", rating: 4.6, reviews: 42, inStock: true, isNew: true, onSale: false, isBestSeller: false },
  { id: 5, name: "Boucle Structured Coat", price: 520000, originalPrice: null, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", tag: "Featured", rating: 4.9, reviews: 528, inStock: true, isNew: false, onSale: false, isBestSeller: true },
  { id: 6, name: "Slim Fit Turtleneck", price: 110000, originalPrice: 150000, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", tag: "Sale", rating: 4.7, reviews: 390, inStock: true, isNew: false, onSale: true, isBestSeller: false },
  { id: 7, name: "Tailored Bermuda Short", price: 145000, originalPrice: null, img: "https://images.unsplash.com/photo-1504198266287-1659872e6590?w=400&q=80", tag: "New", rating: 4.5, reviews: 18, inStock: true, isNew: true, onSale: false, isBestSeller: false },
  { id: 8, name: "Textured Midi Skirt", price: 210000, originalPrice: null, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", tag: null, rating: 4.6, reviews: 134, inStock: false, isNew: false, onSale: false, isBestSeller: false },
];

const REVIEWS = [
  { id: 1, author: "Amara T.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80", rating: 5, date: "May 28, 2025", product: "Classic Trench Coat", comment: "Absolutely impeccable quality. The fabric weight is luxurious and the stitching is flawless. I've worn it three times already and gotten compliments every single time. Worth every naira.", verified: true },
  { id: 2, author: "Emeka O.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80", rating: 5, date: "May 21, 2025", product: "Oversized Linen Blazer", comment: "Fast delivery, well packaged. The blazer fits exactly as described. Their sizing guide was accurate too, which is rare. Will definitely order again.", verified: true },
  { id: 3, author: "Zara F.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80", rating: 4, date: "May 15, 2025", product: "Wool Cargo Trousers", comment: "Really nice trousers, the wool is heavy in the best way. Took 2 extra days to arrive but the seller communicated proactively so no issue. Took off one star just for the slight delay.", verified: true },
  { id: 4, author: "Dayo B.", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&q=80", rating: 5, date: "May 10, 2025", product: "Boucle Structured Coat", comment: "I've been eyeing this coat for months. Finally bought it and it exceeded expectations. It photographs even better in real life. Excellent store.", verified: true },
  { id: 5, author: "Ngozi A.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80", rating: 5, date: "May 3, 2025", product: "Slim Fit Turtleneck", comment: "Perfect for the harmattan season. Super soft, no pilling after washing. This is exactly the kind of quality basics we need more of in Nigerian fashion.", verified: false },
  { id: 6, author: "Kola M.", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&q=80", rating: 4, date: "Apr 28, 2025", product: "Tailored Bermuda Short", comment: "Clean cut, well finished. Delivery was within 2 days which is impressive. Would love to see more colourways added.", verified: true },
];

const BADGE_META = {
  "Verified Seller": { icon: "✓", color: "#1A73C9", bg: "#EBF3FD", desc: "Identity and business verified" },
  "Top Rated":       { icon: "★", color: "#C9A84C", bg: "#FDF8EE", desc: "Consistently 4.8+ average rating" },
  "Fast Shipper":    { icon: "⚡", color: "#0F7B6C", bg: "#EAF5F3", desc: "Dispatches within 24 hours" },
  "Trusted Seller":  { icon: "🛡", color: "#6B4FA0", bg: "#F3EFF9", desc: "Zero disputes in 12 months" },
  "New Seller":      { icon: "✦", color: "#E8433A", bg: "#FEF0EF", desc: "Joined within last 90 days" },
};

const RATING_DIST = [
  { star: 5, pct: 82 },
  { star: 4, pct: 11 },
  { star: 3, pct: 4 },
  { star: 2, pct: 2 },
  { star: 1, pct: 1 },
];

/* ─── UTILS ─────────────────────────────────────────────────────────────────── */

function useInView(ref, threshold = 0.1) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

function fmtPrice(n) {
  return "₦" + (n / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

/* ─── ATOMS ─────────────────────────────────────────────────────────────────── */

function VerifiedIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="10" fill="#1A73C9" />
      <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stars({ rating, size = 12, showNum = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 10 10"
          fill={i <= Math.round(rating) ? "#C9A84C" : "#e4e4e4"}>
          <path d="M5 0.5l1.1 3.1H9.3L6.7 5.6l1 3.1L5 7l-2.7 1.7 1-3.1L.7 3.6h3.2z"/>
        </svg>
      ))}
      {showNum && <span style={{ fontSize: size - 1, color: "#888", marginLeft: 4, fontWeight: 600 }}>{rating}</span>}
    </span>
  );
}

function Pill({ label, color = "#888", bg = "#f4f4f4" }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
      textTransform: "uppercase", color,
      background: bg, padding: "4px 10px", borderRadius: 20,
    }}>{label}</span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#f2f2f0", margin: "0 0 32px" }} />;
}

/* ─── PRODUCT CARD ───────────────────────────────────────────────────────────── */

function ProductCard({ p, delay, visible }) {
  const [hov, setHov] = useState(false);
  const [wished, setWished] = useState(false);
  const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, overflow: "hidden",
        background: p.inStock ? "#fff" : "#fafafa",
        border: "1px solid #efefef",
        cursor: p.inStock ? "pointer" : "default",
        opacity: visible ? (p.inStock ? 1 : 0.55) : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.25s ease`,
        boxShadow: hov && p.inStock ? "0 10px 36px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.04)",
        position: "relative",
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative", background: "#f5f4f0" }}>
        <div style={{
          width: "100%", height: "100%",
          backgroundImage: `url(${p.img})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transform: hov && p.inStock ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
          filter: p.inStock ? "none" : "grayscale(60%)",
        }} />

        {/* Tag */}
        {p.tag && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: p.tag === "Sale" ? "#E8433A" : p.tag === "New" ? "#0F7B6C" : p.tag === "Best Seller" ? "#C9A84C" : "#0f0f0f",
            color: "#fff", fontSize: 9, fontWeight: 800,
            padding: "3px 8px", borderRadius: 4, letterSpacing: 0.8,
            textTransform: "uppercase",
          }}>{p.tag}</div>
        )}

        {/* Out of stock overlay */}
        {!p.inStock && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#888", textTransform: "uppercase", background: "#fff", padding: "6px 14px", borderRadius: 20, border: "1px solid #e8e8e8" }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist */}
        {p.inStock && (
          <button
            onClick={e => { e.stopPropagation(); setWished(w => !w); }}
            style={{
              position: "absolute", top: 10, right: 10,
              width: 30, height: 30, borderRadius: "50%",
              background: "rgba(255,255,255,0.9)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              opacity: hov || wished ? 1 : 0,
              transform: hov || wished ? "scale(1)" : "scale(0.75)",
              transition: "opacity 0.2s, transform 0.2s",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={wished ? "#E8433A" : "none"} stroke={wished ? "#E8433A" : "#333"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#0f0f0f", lineHeight: 1.4 }}>{p.name}</p>
        <Stars rating={p.rating} size={9} />
        <span style={{ fontSize: 9, color: "#bbb", marginLeft: 4 }}>({p.reviews})</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 7 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: disc ? "#E8433A" : "#0f0f0f" }}>{fmtPrice(p.price)}</span>
          {p.originalPrice && (
            <span style={{ fontSize: 10, color: "#bbb", textDecoration: "line-through" }}>{fmtPrice(p.originalPrice)}</span>
          )}
          {disc && <span style={{ fontSize: 9, fontWeight: 700, color: "#E8433A" }}>{disc}% off</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── REVIEW CARD ─────────────────────────────────────────────────────────────── */

function ReviewCard({ r, delay, visible }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #f0f0f0",
      padding: "20px 22px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <img src={r.avatar} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #f0f0f0" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f0f0f" }}>{r.author}</span>
            {r.verified && (
              <span style={{
                fontSize: 8, fontWeight: 800, letterSpacing: 0.8,
                color: "#0F7B6C", background: "#EAF5F3",
                padding: "2px 7px", borderRadius: 10, textTransform: "uppercase",
              }}>Verified Purchase</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <Stars rating={r.rating} size={10} />
            <span style={{ fontSize: 10, color: "#bbb" }}>{r.date}</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 10, color: "#666", fontStyle: "italic", margin: "0 0 10px", letterSpacing: 0.2 }}>
        Re: <span style={{ fontWeight: 700, color: "#444", fontStyle: "normal" }}>{r.product}</span>
      </p>
      <p style={{ margin: 0, fontSize: 13, color: "#333", lineHeight: 1.7 }}>{r.comment}</p>
    </div>
  );
}

/* ─── SECTION WRAPPER ─────────────────────────────────────────────────────────── */

function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ marginBottom: 52, ...style }}>
      {children}
    </section>
  );
}

function SectionTitle({ label, eyebrow, accent = "#C9A84C", visible, right }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      marginBottom: 24,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <div>
        {eyebrow && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ display: "inline-block", width: 18, height: 2, background: accent, borderRadius: 1 }} />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: accent, fontFamily: "'DM Mono', monospace" }}>{eyebrow}</span>
          </div>
        )}
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.4, color: "#0f0f0f", fontFamily: "'Playfair Display', serif" }}>{label}</h2>
      </div>
      {right}
    </div>
  );
}

/* ─── STICKY NAV ─────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { id: "products", label: "Products" },
  { id: "reviews", label: "Reviews" },
  { id: "policies", label: "Policies" },
  { id: "contact", label: "Contact" },
  { id: "delivery", label: "Delivery" },
];

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────────── */

export default function SellerPage() {
  const [productTab, setProductTab] = useState("All");
  const [reviewSort, setReviewSort] = useState("newest");
  const [following, setFollowing] = useState(false);
  const [activeNav, setActiveNav] = useState("products");
  const [msgOpen, setMsgOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [msgText, setMsgText] = useState("");

  const productsRef = useRef(null);
  const reviewsRef = useRef(null);
  const policiesRef = useRef(null);
  const contactRef = useRef(null);
  const deliveryRef = useRef(null);
  const activityRef = useRef(null);

  const productsVis = useInView(productsRef);
  const reviewsVis = useInView(reviewsRef);
  const policiesVis = useInView(policiesRef);
  const contactVis = useInView(contactRef);
  const deliveryVis = useInView(deliveryRef);
  const activityVis = useInView(activityRef);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  // Scroll spy
  useEffect(() => {
    const refs = { products: productsRef, reviews: reviewsRef, policies: policiesRef, contact: contactRef, delivery: deliveryRef };
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setActiveNav(e.target.id);
      });
    }, { threshold: 0.3, rootMargin: "-20% 0px -60% 0px" });
    Object.entries(refs).forEach(([, r]) => r.current && obs.observe(r.current));
    return () => obs.disconnect();
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Filter products
  const filteredProducts = PRODUCTS.filter(p => {
    if (productTab === "All") return true;
    if (productTab === "Featured") return p.tag === "Featured";
    if (productTab === "Best Sellers") return p.isBestSeller;
    if (productTab === "New Arrivals") return p.isNew;
    if (productTab === "On Sale") return p.onSale;
    return true;
  });

  const sortedReviews = [...REVIEWS].sort((a, b) => {
    if (reviewSort === "highest") return b.rating - a.rating;
    if (reviewSort === "lowest") return a.rating - b.rating;
    return 0; // newest = default order
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f9f9f7", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* ── BANNER ───────────────────────────────────────────────── */}
      <div 
        style={{ position: "relative", height: 320, overflow: "hidden", background: "#0f0f0f" }}
        className="mb-16"
      >
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${SELLER.banner})`,
          backgroundSize: "cover", backgroundPosition: "center 30%",
          opacity: 0.75,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)",
        }} />
        {/* Back */}
        <button style={{
          position: "absolute", top: 20, left: 24,
          background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 600,
          color: "#fff", cursor: "pointer", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2L3 7l5 5"/></svg>
          Stores
        </button>
        {/* Share */}
        <button onClick={() => setShareOpen(true)} style={{
          position: "absolute", top: 20, right: 24,
          background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 600,
          color: "#fff", cursor: "pointer", backdropFilter: "blur(8px)",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Share Store
        </button>
      </div>

      {/* ── IDENTITY HEADER ──────────────────────────────────────── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 40px",
      }}>
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginTop: -56, marginBottom: 36, gap: 20, flexWrap: "wrap",
        }}>
          {/* Left: avatar + name */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 20,
              border: "4px solid #fff",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
              flexShrink: 0, background: "#eee",
            }}>
              <img src={SELLER.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{
                  margin: 0, fontSize: 26, fontWeight: 700,
                  color: "#0f0f0f", letterSpacing: -0.6,
                  fontFamily: "'Playfair Display', serif",
                }}>
                  {SELLER.name}
                </h1>
                {SELLER.verified && <VerifiedIcon size={18} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 5, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#aaa" }}>{SELLER.handle}</span>
                <span style={{ fontSize: 10, color: "#bbb" }}>·</span>
                <span style={{ fontSize: 11, color: "#777" }}>{SELLER.category}</span>
                <span style={{ fontSize: 10, color: "#bbb" }}>·</span>
                <span style={{ fontSize: 11, color: "#999" }}>📍 {SELLER.location.city}, {SELLER.location.state}</span>
              </div>
              {/* Badges strip */}
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {SELLER.badges.map(b => {
                  const m = BADGE_META[b];
                  return m ? (
                    <span key={b} title={m.desc} style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                      textTransform: "uppercase", color: m.color,
                      background: m.bg, padding: "4px 9px", borderRadius: 20,
                      border: `1px solid ${m.color}22`,
                      cursor: "default",
                    }}>
                      <span>{m.icon}</span> {b}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 4, flexWrap: "wrap" }}>
            <button
              onClick={() => setMsgOpen(true)}
              style={{
                background: "#0f0f0f", border: "none", borderRadius: 10,
                padding: "11px 22px", fontSize: 12, fontWeight: 700,
                color: "#fff", cursor: "pointer", letterSpacing: 0.5,
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message
            </button>
            {SELLER.whatsappEnabled && (
              <button
                onClick={() => window.open(`https://wa.me/${SELLER.whatsappNumber}`, "_blank")}
                style={{
                  background: "#25D366", border: "none", borderRadius: 10,
                  padding: "11px 18px", fontSize: 12, fontWeight: 700,
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 7,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                WhatsApp
              </button>
            )}
            <button
              onClick={() => setFollowing(f => !f)}
              style={{
                background: following ? "#f5f5f3" : "transparent",
                border: "1.5px solid", borderColor: following ? "#d0d0d0" : "#d0d0d0",
                borderRadius: 10, padding: "11px 18px",
                fontSize: 12, fontWeight: 700, color: "#555",
                cursor: "pointer", letterSpacing: 0.3,
                transition: "all 0.2s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {following ? "✓ Following" : "+ Follow"}
            </button>
          </div>
        </div>

        {/* Bio */}
        <p style={{
          fontSize: 14, color: "#666", lineHeight: 1.8,
          maxWidth: 640, marginBottom: 40,
        }}>
          {SELLER.bio}
        </p>

        {/* Quick stats */}
        <div style={{
          display: "flex", gap: 0,
          background: "#fff", borderRadius: 16,
          border: "1px solid #efefef",
          marginBottom: 40, overflow: "hidden",
        }}>
          {[
            { label: "Rating", val: SELLER.rating, sub: `${(SELLER.totalReviews / 1000).toFixed(1)}K reviews` },
            { label: "Orders Done", val: SELLER.completedOrders.toLocaleString(), sub: "Lifetime" },
            { label: "Response Rate", val: `${SELLER.responseRate}%`, sub: SELLER.responseTime },
            { label: "Trust Score", val: `${SELLER.trustScore}/100`, sub: "Excellent" },
            { label: "Joined", val: SELLER.joinedDate, sub: "Member since" },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: 1, padding: "20px 0", textAlign: "center",
              borderRight: i < arr.length - 1 ? "1px solid #f2f2f0" : "none",
            }}>
              <div style={{
                fontSize: i === 0 ? 20 : 17,
                fontWeight: 800, color: "#0f0f0f",
                fontFamily: i === 0 ? "'Playfair Display', serif" : "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                letterSpacing: -0.3,
              }}>
                {i === 0 && <span style={{ color: "#C9A84C", fontSize: 16 }}>★</span>}
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 9, color: "#ccc", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── STICKY NAV ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(249,249,247,0.95)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #efefef", marginBottom: 48,
          marginLeft: -40, marginRight: -40,
          padding: "0 40px",
        }}>
          <div style={{ display: "flex", gap: 0 }}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                background: "none", border: "none",
                borderBottom: activeNav === item.id ? "2px solid #C9A84C" : "2px solid transparent",
                padding: "15px 18px",
                fontSize: 11, fontWeight: activeNav === item.id ? 700 : 500,
                color: activeNav === item.id ? "#C9A84C" : "#888",
                cursor: "pointer", letterSpacing: 0.3, whiteSpace: "nowrap",
                transition: "color 0.2s, border-color 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────── TWO COL LAYOUT ─────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* ── PRODUCTS ── */}
            <Section id="products">
              <div ref={productsRef}>
                <SectionTitle
                  eyebrow="Catalogue"
                  label="Products"
                  accent="#C9A84C"
                  visible={productsVis}
                  right={
                    <a href="#" style={{ fontSize: 11, fontWeight: 600, color: "#888", textDecoration: "none", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid #ddd", paddingBottom: 1 }}>
                      View All →
                    </a>
                  }
                />

                {/* Product tab filter */}
                <div style={{
                  display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap",
                  opacity: productsVis ? 1 : 0,
                  transition: "opacity 0.4s ease 0.1s",
                }}>
                  {PRODUCT_TABS.map(tab => (
                    <button key={tab} onClick={() => setProductTab(tab)} style={{
                      background: productTab === tab ? "#0f0f0f" : "#fff",
                      border: "1px solid", borderColor: productTab === tab ? "#0f0f0f" : "#e8e8e8",
                      borderRadius: 20, padding: "6px 14px",
                      fontSize: 11, fontWeight: 600,
                      color: productTab === tab ? "#fff" : "#666",
                      cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{tab}</button>
                  ))}
                </div>

                {filteredProducts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
                    <p style={{ fontSize: 13, margin: 0 }}>No products in this filter.</p>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 16,
                  }}>
                    {filteredProducts.map((p, i) => (
                      <ProductCard key={p.id} p={p} delay={i * 60} visible={productsVis} />
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <Divider />

            {/* ── REVIEWS ── */}
            <Section id="reviews">
              <div ref={reviewsRef}>
                <SectionTitle eyebrow="Buyer Feedback" label="Reviews" accent="#C9A84C" visible={reviewsVis} />

                {/* Rating summary */}
                <div style={{
                  display: "flex", gap: 28, alignItems: "center",
                  background: "#fff", borderRadius: 16, padding: "24px 28px",
                  border: "1px solid #f0f0f0", marginBottom: 24,
                  opacity: reviewsVis ? 1 : 0,
                  transform: reviewsVis ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}>
                  {/* Big number */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 52, fontWeight: 800, color: "#0f0f0f", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                      {SELLER.rating}
                    </div>
                    <Stars rating={SELLER.rating} size={14} />
                    <div style={{ fontSize: 10, color: "#bbb", marginTop: 5 }}>
                      {SELLER.totalReviews.toLocaleString()} reviews
                    </div>
                  </div>

                  {/* Distribution bars */}
                  <div style={{ flex: 1 }}>
                    {RATING_DIST.map(d => (
                      <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#999", width: 30, textAlign: "right", flexShrink: 0 }}>{d.star}★</span>
                        <div style={{ flex: 1, height: 6, background: "#f2f2f0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${d.pct}%`,
                            background: d.star >= 4 ? "#C9A84C" : d.star === 3 ? "#E8A84C" : "#E8433A",
                            borderRadius: 3,
                            transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
                          }} />
                        </div>
                        <span style={{ fontSize: 10, color: "#bbb", width: 28, flexShrink: 0 }}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort controls */}
                <div style={{
                  display: "flex", gap: 8, marginBottom: 20,
                  opacity: reviewsVis ? 1 : 0,
                  transition: "opacity 0.4s ease 0.15s",
                }}>
                  {[["newest", "Newest"], ["highest", "Highest Rated"], ["lowest", "Lowest Rated"]].map(([val, label]) => (
                    <button key={val} onClick={() => setReviewSort(val)} style={{
                      background: reviewSort === val ? "#0f0f0f" : "#fff",
                      border: "1px solid", borderColor: reviewSort === val ? "#0f0f0f" : "#e8e8e8",
                      borderRadius: 20, padding: "6px 14px",
                      fontSize: 10, fontWeight: 600,
                      color: reviewSort === val ? "#fff" : "#777",
                      cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{label}</button>
                  ))}
                </div>

                {/* Review cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {sortedReviews.map((r, i) => (
                    <ReviewCard key={r.id} r={r} delay={i * 60} visible={reviewsVis} />
                  ))}
                </div>

                <button style={{
                  display: "block", width: "100%", marginTop: 20,
                  background: "#fff", border: "1px solid #e8e8e8",
                  borderRadius: 10, padding: "13px 0",
                  fontSize: 12, fontWeight: 700, color: "#666",
                  cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Load More Reviews
                </button>
              </div>
            </Section>

            <Divider />

            {/* ── POLICIES ── */}
            <Section id="policies">
              <div ref={policiesRef}>
                <SectionTitle eyebrow="Store Terms" label="Policies" accent="#6B4FA0" visible={policiesVis} />

                <div style={{
                  display: "flex", flexDirection: "column", gap: 16,
                  opacity: policiesVis ? 1 : 0,
                  transform: policiesVis ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}>
                  {[
                    { icon: "↩", label: "Return Policy", text: SELLER.returnPolicy, color: "#1A73C9" },
                    { icon: "🚚", label: "Shipping Policy", text: SELLER.shippingPolicy, color: "#0F7B6C" },
                    { icon: "🛡", label: "Warranty", text: SELLER.warrantyPolicy, color: "#6B4FA0" },
                    { icon: "✕", label: "Cancellation Policy", text: SELLER.cancellationPolicy, color: "#E8433A" },
                    { icon: "🔒", label: "Payment Protection", text: SELLER.paymentNote, color: "#C9A84C" },
                  ].map(p => (
                    <PolicyBlock key={p.label} {...p} />
                  ))}
                </div>
              </div>
            </Section>

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Contact Card */}
            <div id="contact" ref={contactRef} style={{
              background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0",
              overflow: "hidden",
              opacity: contactVis ? 1 : 0,
              transform: contactVis ? "translateX(0)" : "translateX(20px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}>
              <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #f5f5f3" }}>
                <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "#0f0f0f", textTransform: "uppercase", letterSpacing: 1 }}>Contact & Support</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
                  <button onClick={() => setMsgOpen(true)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "#0f0f0f", border: "none", borderRadius: 10,
                    padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#fff",
                    cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif",
                  }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Message Seller
                  </button>
                  {SELLER.whatsappEnabled && (
                    <button style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "#E7FAF0", border: "1px solid #C3F0D4", borderRadius: 10,
                      padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#1A7A45",
                      cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif",
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                      </svg>
                      Chat on WhatsApp
                    </button>
                  )}
                  <button style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "#f8f8f6", border: "1px solid #efefed", borderRadius: 10,
                    padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "#555",
                    cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif",
                  }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                    </svg>
                    Ask a Question
                  </button>
                </div>
              </div>
              <div style={{ padding: "12px 20px" }}>
                <button
                  onClick={() => setReportOpen(true)}
                  style={{
                    background: "none", border: "none", fontSize: 10, color: "#ccc",
                    cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>
                  </svg>
                  Report this seller
                </button>
              </div>
            </div>

            {/* Delivery Card */}
            <div id="delivery" ref={deliveryRef} style={{
              background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0",
              padding: "22px",
              opacity: deliveryVis ? 1 : 0,
              transform: deliveryVis ? "translateX(0)" : "translateX(20px)",
              transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
            }}>
              <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, color: "#0f0f0f", textTransform: "uppercase", letterSpacing: 1 }}>Location & Delivery</p>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#333" }}>{SELLER.location.city}, {SELLER.location.state}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#aaa" }}>{SELLER.location.country}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>🚚</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#333" }}>Delivery Time</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "#aaa" }}>{SELLER.estimatedDelivery}</p>
                </div>
              </div>

              {SELLER.pickupAvailable && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
                  <span style={{ fontSize: 16 }}>🏪</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#333" }}>Pickup Available</p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "#aaa" }}>Contact seller to arrange</p>
                  </div>
                </div>
              )}

              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "#bbb" }}>Delivery Areas</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SELLER.deliveryAreas.map(a => (
                  <span key={a} style={{
                    fontSize: 9, fontWeight: 600, color: "#666",
                    background: "#f6f6f4", padding: "4px 9px",
                    borderRadius: 20, border: "1px solid #eee",
                  }}>{a}</span>
                ))}
              </div>
            </div>

            {/* Activity & Badges Card */}
            <div ref={activityRef} style={{
              background: "#0f0f0f", borderRadius: 16,
              padding: "22px",
              opacity: activityVis ? 1 : 0,
              transform: activityVis ? "translateX(0)" : "translateX(20px)",
              transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
            }}>
              <p style={{ margin: "0 0 18px", fontSize: 12, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>
                Store Activity
              </p>

              {[
                { label: "Last Active", val: SELLER.lastActive },
                { label: "Listed Products", val: PRODUCTS.filter(p => p.inStock).length },
                { label: "Member Since", val: SELLER.joinedDate },
                { label: "Total Sales", val: SELLER.totalSales },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  padding: "10px 0",
                }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{row.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{row.val}</span>
                </div>
              ))}

              <p style={{ margin: "18px 0 12px", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                Store Badges
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SELLER.badges.map(b => {
                  const m = BADGE_META[b];
                  if (!m) return null;
                  return (
                    <div key={b} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "rgba(255,255,255,0.05)", borderRadius: 8,
                      padding: "9px 12px",
                    }}>
                      <span style={{ fontSize: 14 }}>{m.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#fff" }}>{b}</p>
                        <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── MESSAGE MODAL ── */}
      {msgOpen && (
        <Modal onClose={() => setMsgOpen(false)} title={`Message ${SELLER.name}`}>
          <div style={{ padding: "0 24px 24px" }}>
            <p style={{ fontSize: 12, color: "#999", margin: "0 0 16px" }}>
              Typical response time: <strong style={{ color: "#0f0f0f" }}>{SELLER.responseTime}</strong>
            </p>
            <textarea
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Write your message here…"
              rows={5}
              style={{
                width: "100%", borderRadius: 10, border: "1px solid #e8e8e8",
                padding: "12px 14px", fontSize: 13, resize: "vertical",
                fontFamily: "'DM Sans', sans-serif", color: "#333",
                background: "#fafaf8", outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button style={{
              width: "100%", marginTop: 12,
              background: "#0f0f0f", border: "none", borderRadius: 10,
              padding: "13px 0", fontSize: 12, fontWeight: 700, color: "#fff",
              cursor: "pointer", letterSpacing: 0.5, textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
            }}>Send Message</button>
          </div>
        </Modal>
      )}

      {/* ── REPORT MODAL ── */}
      {reportOpen && (
        <Modal onClose={() => setReportOpen(false)} title="Report Seller">
          <div style={{ padding: "0 24px 24px" }}>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px", lineHeight: 1.7 }}>
              Select a reason for reporting. All reports are reviewed by our trust & safety team within 24 hours.
            </p>
            {["Counterfeit or fake products", "Misleading product descriptions", "Rude or unprofessional behaviour", "Did not fulfil order", "Other"].map(r => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                <input type="radio" name="report" style={{ accentColor: "#E8433A" }} />
                <span style={{ fontSize: 13, color: "#444" }}>{r}</span>
              </label>
            ))}
            <button style={{
              width: "100%", marginTop: 16,
              background: "#E8433A", border: "none", borderRadius: 10,
              padding: "13px 0", fontSize: 12, fontWeight: 700, color: "#fff",
              cursor: "pointer", textTransform: "uppercase", letterSpacing: 0.5,
              fontFamily: "'DM Sans', sans-serif",
            }}>Submit Report</button>
          </div>
        </Modal>
      )}

      {shareOpen && (
        <Modal onClose={() => setShareOpen(false)} title="Share Store">
          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ background: "#f5f5f3", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "#666", flex: 1, wordBreak: "break-all" }}>
                https://woosho.com/store/foundrylabel
              </span>
              <button style={{ background: "#0f0f0f", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Copy</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {["WhatsApp", "Twitter", "Instagram"].map(s => (
                <button key={s} style={{
                  flex: 1, background: "#f8f8f6", border: "1px solid #efefed",
                  borderRadius: 10, padding: "10px 0", fontSize: 11, fontWeight: 600,
                  color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{s}</button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}

/* ─── POLICY BLOCK ─────────────────────────────────────────────────────────── */

function PolicyBlock({ icon, label, text, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0",
      overflow: "hidden",
      transition: "box-shadow 0.2s ease",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          padding: "16px 20px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span style={{
          width: 34, height: 34, borderRadius: 8,
          background: color + "14",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
        }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0f0f0f" }}>{label}</span>
        <svg
          width="16" height="16" fill="none" stroke="#bbb" strokeWidth="2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", flexShrink: 0 }}
        >
          <path d="M4 6l8 8 8-8" transform="translate(-4,-6) scale(1)"/>
          <path d="M6 9l4 4 4-4"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 20px 18px 68px" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.8 }}>{text}</p>
        </div>
      )}
    </div>
  );
}

/* ─── MODAL ─────────────────────────────────────────────────────────────────── */

function Modal({ onClose, title, children }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 18,
        width: "100%", maxWidth: 460,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        animation: "slideUp 0.25s cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: "1px solid #f2f2f0",
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f0f0f", fontFamily: "'Playfair Display', serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="16" height="16" fill="none" stroke="#999" strokeWidth="2"><path d="M2 2l12 12M14 2L2 14"/></svg>
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}