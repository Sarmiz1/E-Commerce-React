import { useState, useRef, useEffect, useCallback } from "react";

/* ─── DATA ─────────────────────────────────────────────────────────────────── */

const CATEGORIES = ["All", "Fashion", "Beauty", "Home", "Electronics", "Food", "Art", "Sports", "Accessories"];

const STORES = [
  // Top Sellers
  { id: 1, name: "Foundry Label", handle: "@foundrylabel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80", cover: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", category: "Fashion", verified: true, rating: 4.9, reviews: 8420, sales: 24300, followers: 18200, joined: "2021", tags: ["Premium", "Tailored", "Luxury"], badge: "Top Seller", badgeColor: "#C9A84C", products: 284, location: "Lagos, NG", bio: "Refined essentials for the modern wardrobe.", featured: true },
  { id: 2, name: "Forme d'Expression", handle: "@formedexpression", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80", cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80", category: "Fashion", verified: true, rating: 4.8, reviews: 6210, sales: 19800, followers: 14500, joined: "2020", tags: ["Editorial", "Avant-garde"], badge: "Top Seller", badgeColor: "#C9A84C", products: 196, location: "Abuja, NG", bio: "Where structure meets fluidity.", featured: false },
  { id: 3, name: "Aesop Foot", handle: "@aesopfoot", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80", cover: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80", category: "Accessories", verified: true, rating: 4.9, reviews: 5870, sales: 17600, followers: 12300, joined: "2021", tags: ["Footwear", "Handcrafted"], badge: "Top Seller", badgeColor: "#C9A84C", products: 142, location: "Port Harcourt, NG", bio: "Every step, considered.", featured: false },
  { id: 4, name: "Matter Works", handle: "@matterworks", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80", cover: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80", category: "Accessories", verified: true, rating: 4.7, reviews: 4920, sales: 14200, followers: 9800, joined: "2022", tags: ["Bags", "Leather", "Minimal"], badge: "Top Seller", badgeColor: "#C9A84C", products: 88, location: "Lagos, NG", bio: "Objects worth carrying.", featured: false },

  // Verified
  { id: 5, name: "Studio Minimal", handle: "@studiominimal", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80", cover: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80", category: "Fashion", verified: true, rating: 4.8, reviews: 3410, sales: 10800, followers: 8900, joined: "2022", tags: ["Minimalist", "Linen", "SS25"], badge: "Verified", badgeColor: "#1A73C9", products: 175, location: "Lagos, NG", bio: "Less, but better.", featured: false },
  { id: 6, name: "Soft Goods Co.", handle: "@softgoods", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80", cover: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", category: "Fashion", verified: true, rating: 4.7, reviews: 2980, sales: 9200, followers: 7600, joined: "2022", tags: ["Knitwear", "Cashmere", "Soft"], badge: "Verified", badgeColor: "#1A73C9", products: 94, location: "Enugu, NG", bio: "Warmth you can wear.", featured: false },
  { id: 7, name: "Denim Theory", handle: "@denimtheory", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&q=80", cover: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80", category: "Fashion", verified: true, rating: 4.6, reviews: 2640, sales: 8400, followers: 6800, joined: "2023", tags: ["Denim", "Streetwear"], badge: "Verified", badgeColor: "#1A73C9", products: 62, location: "Kano, NG", bio: "Denim reimagined.", featured: false },
  { id: 8, name: "Unstructured Co.", handle: "@unstructured", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&q=80", cover: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", category: "Fashion", verified: true, rating: 4.7, reviews: 2210, sales: 7100, followers: 5900, joined: "2023", tags: ["Relaxed", "Tailored"], badge: "Verified", badgeColor: "#1A73C9", products: 78, location: "Ibadan, NG", bio: "Effortless by design.", featured: false },

  // Recently Added
  { id: 9, name: "Glaze Beauty", handle: "@glazebeauty", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80", cover: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80", category: "Beauty", verified: false, rating: 4.5, reviews: 140, sales: 420, followers: 1200, joined: "2025", tags: ["Skincare", "Glow", "Clean"], badge: "New", badgeColor: "#0F7B6C", products: 24, location: "Lagos, NG", bio: "Glow, amplified.", featured: false },
  { id: 10, name: "Canvasa Art", handle: "@canvasaart", avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=120&q=80", cover: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", category: "Art", verified: false, rating: 4.6, reviews: 98, sales: 280, followers: 890, joined: "2025", tags: ["Prints", "Original Art"], badge: "New", badgeColor: "#0F7B6C", products: 41, location: "Abuja, NG", bio: "Art that speaks first.", featured: false },
  { id: 11, name: "Haus of Ritual", handle: "@hausofritual", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80", cover: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80", category: "Home", verified: false, rating: 4.4, reviews: 72, sales: 190, followers: 640, joined: "2025", tags: ["Home", "Wellness", "Scent"], badge: "New", badgeColor: "#0F7B6C", products: 33, location: "Port Harcourt, NG", bio: "Home is a feeling.", featured: false },
  { id: 12, name: "Form & Function", handle: "@formandfn", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=120&q=80", cover: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80", category: "Sports", verified: false, rating: 4.3, reviews: 55, sales: 130, followers: 480, joined: "2025", tags: ["Footwear", "Sport"], badge: "New", badgeColor: "#0F7B6C", products: 19, location: "Lagos, NG", bio: "Built to move.", featured: false },

  // Rising Stars
  { id: 13, name: "Volta Electronics", handle: "@voltaelectronics", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&q=80", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", category: "Electronics", verified: true, rating: 4.6, reviews: 890, sales: 3200, followers: 4100, joined: "2024", tags: ["Tech", "Gadgets", "Audio"], badge: "Rising", badgeColor: "#9B59B6", products: 67, location: "Lagos, NG", bio: "The gadgets you didn't know you needed.", featured: false },
  { id: 14, name: "Nero Kitchen", handle: "@nerokitchen", avatar: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=120&q=80", cover: "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=800&q=80", category: "Food", verified: false, rating: 4.7, reviews: 620, sales: 2800, followers: 3200, joined: "2024", tags: ["Artisan", "Organic", "Local"], badge: "Rising", badgeColor: "#9B59B6", products: 48, location: "Abuja, NG", bio: "Flavour, sourced intentionally.", featured: false },
  { id: 15, name: "Axiom Active", handle: "@axiomactive", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&q=80", cover: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", category: "Sports", verified: false, rating: 4.5, reviews: 510, sales: 2100, followers: 2900, joined: "2024", tags: ["Activewear", "Performance"], badge: "Rising", badgeColor: "#9B59B6", products: 53, location: "Kano, NG", bio: "Gear for the relentless.", featured: false },
  { id: 16, name: "Prism Home", handle: "@prismhome", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&q=80", cover: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", category: "Home", verified: true, rating: 4.8, reviews: 430, sales: 1700, followers: 2400, joined: "2024", tags: ["Interiors", "Decor", "Modern"], badge: "Rising", badgeColor: "#9B59B6", products: 112, location: "Lagos, NG", bio: "Spaces that inspire.", featured: false },
];

const STATS = [
  { label: "Active Stores", value: "2,840+", icon: "🏪" },
  { label: "Products Listed", value: "184K+", icon: "📦" },
  { label: "Orders Fulfilled", value: "1.2M+", icon: "✓" },
  { label: "Cities Covered", value: "36+", icon: "📍" },
];

/* ─── UTILS ──────────────────────────────────────────────────────────────────── */

function useInView(ref, threshold = 0.12) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

/* ─── COMPONENTS ─────────────────────────────────────────────────────────────── */

function VerifiedIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#1A73C9" />
      <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarRating({ rating, small }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={small ? 8 : 10} height={small ? 8 : 10} viewBox="0 0 10 10"
          fill={i <= Math.round(rating) ? "#C9A84C" : "#e0e0e0"}>
          <path d="M5 0.5l1.1 3.1H9.3L6.7 5.6l1 3.1L5 7l-2.7 1.7 1-3.1L.7 3.6h3.2z"/>
        </svg>
      ))}
      <span style={{ fontSize: small ? 10 : 11, color: "#888", marginLeft: 3, fontWeight: 600 }}>{rating}</span>
    </span>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 9, fontWeight: 800,
      letterSpacing: 1.2, textTransform: "uppercase",
      color: "#fff",
      background: color,
      padding: "3px 8px", borderRadius: 4,
    }}>{label}</span>
  );
}

/* Featured Hero Store Card */
function FeaturedStoreCard({ store, delay = 0, visible }) {
  const [hovered, setHovered] = useState(false);
  const [following, setFollowing] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        height: 420,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        background: "#0f0f0f",
        flex: "1 1 300px",
        minWidth: 280,
      }}
    >
      {/* Cover */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${store.cover})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
        opacity: 0.7,
      }} />

      {/* Gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)",
      }} />

      {/* Top badges */}
      <div style={{
        position: "absolute", top: 16, left: 16, right: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Badge label={store.badge} color={store.badgeColor} />
        <button
          onClick={e => { e.stopPropagation(); setFollowing(f => !f); }}
          style={{
            background: following ? "#fff" : "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
            color: following ? "#0f0f0f" : "#fff",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            textTransform: "uppercase",
            transition: "background 0.25s ease, color 0.25s ease",
          }}
        >
          {following ? "Following" : "Follow"}
        </button>
      </div>

      {/* Content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 20px" }}>
        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.5)",
            overflow: "hidden", flexShrink: 0,
          }}>
            <img src={store.avatar} alt={store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#fff" }}>
                {store.name}
              </span>
              {store.verified && <VerifiedIcon />}
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 0.3 }}>{store.handle}</span>
          </div>
        </div>

        <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
          {store.bio}
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          {[
            { label: "Sales", val: fmtNum(store.sales) },
            { label: "Products", val: store.products },
            { label: "Followers", val: fmtNum(store.followers) },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {store.tags.map(t => (
            <span key={t} style={{
              fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "3px 8px", borderRadius: 20,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Standard Store Card */
function StoreCard({ store, delay = 0, visible, layout = "grid" }) {
  const [hovered, setHovered] = useState(false);
  const [following, setFollowing] = useState(false);

  if (layout === "list") {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", gap: 0,
          borderRadius: 14,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid #efefef",
          cursor: "pointer",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-20px)",
          transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.25s ease`,
          boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ width: 120, flexShrink: 0, overflow: "hidden", position: "relative" }}>
          <img src={store.cover} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s ease",
          }} />
        </div>
        <div style={{ padding: "16px 18px", flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
          <img src={store.avatar} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #f0f0f0", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#0f0f0f" }}>{store.name}</span>
              {store.verified && <VerifiedIcon size={13} />}
              <Badge label={store.badge} color={store.badgeColor} />
            </div>
            <span style={{ fontSize: 10, color: "#aaa", display: "block", marginBottom: 6 }}>{store.handle} · {store.location}</span>
            <StarRating rating={store.rating} small />
          </div>
          <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
            {[{ l: "Products", v: store.products }, { l: "Sales", v: fmtNum(store.sales) }, { l: "Followers", v: fmtNum(store.followers) }].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f0f0f" }}>{s.v}</div>
                <div style={{ fontSize: 9, color: "#bbb", textTransform: "uppercase", letterSpacing: 0.8 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <button
            onClick={e => { e.stopPropagation(); setFollowing(f => !f); }}
            style={{
              background: following ? "#0f0f0f" : "transparent",
              border: "1px solid #d0d0d0",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
              color: following ? "#fff" : "#333",
              cursor: "pointer", textTransform: "uppercase",
              transition: "background 0.2s ease, color 0.2s ease",
              flexShrink: 0,
            }}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid #efefef",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.25s ease`,
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Cover */}
      <div style={{ height: 130, overflow: "hidden", position: "relative" }}>
        <div style={{
          width: "100%", height: "100%",
          backgroundImage: `url(${store.cover})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "transform 0.6s ease",
        }} />
        <div style={{
          position: "absolute", top: 10, left: 10,
          display: "flex", gap: 6,
        }}>
          <Badge label={store.badge} color={store.badgeColor} />
        </div>
        {/* Follow btn top right */}
        <button
          onClick={e => { e.stopPropagation(); setFollowing(f => !f); }}
          style={{
            position: "absolute", top: 10, right: 10,
            background: following ? "#fff" : "rgba(0,0,0,0.45)",
            border: "none",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
            color: following ? "#0f0f0f" : "#fff",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            textTransform: "uppercase",
            transition: "background 0.2s ease, color 0.2s ease",
          }}
        >
          {following ? "✓ Following" : "+ Follow"}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: "50%",
            border: "2.5px solid #fff",
            outline: "1.5px solid #ebebeb",
            overflow: "hidden",
            marginTop: -26,
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
          }}>
            <img src={store.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 14, fontWeight: 700, color: "#0f0f0f",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{store.name}</span>
              {store.verified && <VerifiedIcon size={13} />}
            </div>
            <span style={{ fontSize: 10, color: "#bbb" }}>{store.handle}</span>
          </div>
        </div>

        <StarRating rating={store.rating} small />
        <p style={{ margin: "8px 0 12px", fontSize: 11, color: "#888", lineHeight: 1.5 }}>{store.bio}</p>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 0,
          borderTop: "1px solid #f4f4f4",
          paddingTop: 12,
        }}>
          {[
            { l: "Products", v: store.products },
            { l: "Sales", v: fmtNum(store.sales) },
            { l: "Reviews", v: fmtNum(store.reviews) },
          ].map((s, i) => (
            <div key={s.l} style={{
              flex: 1, textAlign: "center",
              borderRight: i < 2 ? "1px solid #f4f4f4" : "none",
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f0f0f" }}>{s.v}</div>
              <div style={{ fontSize: 9, color: "#c0c0c0", textTransform: "uppercase", letterSpacing: 0.6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Location + category */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 10, color: "#bbb" }}>📍 {store.location}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
            color: "#888", textTransform: "uppercase",
            background: "#f6f6f6", padding: "3px 8px", borderRadius: 20,
          }}>{store.category}</span>
        </div>
      </div>
    </div>
  );
}

/* Horizontal scroll row */
function StoreRow({ stores, delay = 0, visible }) {
  const ref = useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    check();
    return () => el.removeEventListener("scroll", check);
  }, [check]);
  const scroll = d => ref.current?.scrollBy({ left: d * 480, behavior: "smooth" });

  return (
    <div style={{ position: "relative" }}>
      {canL && (
        <button onClick={() => scroll(-1)} style={{
          position: "absolute", left: -16, top: "40%", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff", border: "1px solid #e8e8e8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <svg width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M9 2L3 7l6 5"/></svg>
        </button>
      )}
      {canR && (
        <button onClick={() => scroll(1)} style={{
          position: "absolute", right: -16, top: "40%", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff", border: "1px solid #e8e8e8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <svg width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M5 2l6 5-6 5"/></svg>
        </button>
      )}
      <div ref={ref} style={{
        display: "flex", gap: 16,
        overflowX: "auto", scrollbarWidth: "none",
        paddingBottom: 4,
      }}>
        {stores.map((store, i) => (
          <div key={store.id} style={{ flex: "0 0 260px", width: 260 }}>
            <StoreCard store={store} delay={delay + i * 60} visible={visible} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc, accent = "#C9A84C", visible, action }) {
  return (
    <div style={{
      marginBottom: 28,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
          <span style={{ display: "inline-block", width: 20, height: 2, background: accent, borderRadius: 1 }} />
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: accent, fontFamily: "'DM Mono', monospace" }}>
            {eyebrow}
          </span>
        </div>
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: "#0f0f0f", fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h2>
        {desc && <p style={{ margin: 0, fontSize: 13, color: "#999", maxWidth: 480, lineHeight: 1.6 }}>{desc}</p>}
      </div>
      {action && (
        <a href="#" style={{ fontSize: 11, fontWeight: 600, color: "#888", textDecoration: "none", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid #ddd", paddingBottom: 1 }}>
          {action} →
        </a>
      )}
    </div>
  );
}

/* ─── LEADERBOARD ─────────────────────────────────────────────────────────────── */
function LeaderboardRow({ store, rank, visible, delay }) {
  const [hovered, setHovered] = useState(false);
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 18px",
        borderRadius: 12,
        background: hovered ? "#fafaf8" : "#fff",
        border: "1px solid #f0f0f0",
        cursor: "pointer",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-24px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.2s ease`,
      }}
    >
      <div style={{ width: 28, textAlign: "center", fontSize: rank <= 3 ? 18 : 13, fontWeight: 800, color: "#ccc", flexShrink: 0 }}>
        {medals[rank] || rank}
      </div>
      <img src={store.avatar} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #f0f0f0", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: "#0f0f0f" }}>{store.name}</span>
          {store.verified && <VerifiedIcon size={12} />}
        </div>
        <span style={{ fontSize: 10, color: "#bbb" }}>{store.category} · {store.location}</span>
      </div>
      <div style={{ display: "flex", gap: 24, textAlign: "right" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0f0f0f" }}>{fmtNum(store.sales)}</div>
          <div style={{ fontSize: 9, color: "#bbb", textTransform: "uppercase", letterSpacing: 0.5 }}>Sales</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#C9A84C" }}>{store.rating}</div>
          <div style={{ fontSize: 9, color: "#bbb", textTransform: "uppercase", letterSpacing: 0.5 }}>Rating</div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────────── */

export default function StoresPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState("grid");

  // Section refs
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuredRef = useRef(null);
  const topRef = useRef(null);
  const verifiedRef = useRef(null);
  const newRef = useRef(null);
  const risingRef = useRef(null);
  const browseRef = useRef(null);

  const statsVis = useInView(statsRef);
  const featuredVis = useInView(featuredRef);
  const topVis = useInView(topRef);
  const verifiedVis = useInView(verifiedRef);
  const newVis = useInView(newRef);
  const risingVis = useInView(risingRef);
  const browseVis = useInView(browseRef);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@500&display=swap";
    document.head.appendChild(link);
  }, []);

  const filtered = STORES.filter(s => {
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const matchQ = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.handle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const topSellers = STORES.filter(s => s.badge === "Top Seller").sort((a,b) => b.sales - a.sales);
  const verifiedStores = STORES.filter(s => s.verified).sort((a,b) => b.rating - a.rating);
  const newStores = STORES.filter(s => s.badge === "New");
  const risingStores = STORES.filter(s => s.badge === "Rising");
  const featuredStore = STORES.find(s => s.featured);

  return (
    <div 
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#fafaf8", minHeight: "100vh", color: "#1a1a1a" }}
      className="pb-10"
    >

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div ref={heroRef} style={{
        background: "#0f0f0f",
        padding: "80px 0 0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${featuredStore.cover})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.08,
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", paddingBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ display: "inline-block", width: 28, height: 1.5, background: "#C9A84C" }} />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: "#C9A84C", fontFamily: "'DM Mono', monospace" }}>
                WooSho Marketplace
              </span>
              <span style={{ display: "inline-block", width: 28, height: 1.5, background: "#C9A84C" }} />
            </div>
            <h1 style={{
              margin: "0 0 18px",
              fontSize: "clamp(38px, 5.5vw, 72px)",
              fontWeight: 700,
              letterSpacing: -2,
              color: "#fff",
              fontFamily: "'Playfair Display', serif",
              lineHeight: 1.1,
            }}>
              Discover Stores.
            </h1>
            <p style={{ margin: "0 auto 36px", fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 440, lineHeight: 1.7 }}>
              Thousands of curated stores, from independent creators to established brands — all in one place.
            </p>

            {/* Search bar */}
            <div style={{
              display: "flex", gap: 10,
              maxWidth: 520, margin: "0 auto",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "4px 4px 4px 18px",
              backdropFilter: "blur(12px)",
            }}>
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ flexShrink: 0, alignSelf: "center" }}>
                <circle cx="7" cy="7" r="5"/><path d="M12 12l3 3"/>
              </svg>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stores, brands, or categories…"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 13, color: "#fff", padding: "10px 0",
                  fontFamily: "'DM Sans', sans-serif",
                  "::placeholder": { color: "rgba(255,255,255,0.3)" },
                }}
              />
              <button style={{
                background: "#C9A84C", border: "none",
                borderRadius: 8, padding: "10px 22px",
                fontSize: 12, fontWeight: 700, letterSpacing: 0.8,
                color: "#fff", cursor: "pointer", textTransform: "uppercase",
                flexShrink: 0,
              }}>Search</button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div ref={statsRef} style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{
                  padding: "22px 0",
                  textAlign: "center",
                  opacity: statsVis ? 1 : 0,
                  transform: statsVis ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px 0" }}>

        {/* ── FEATURED STORE ── */}
        {!searchQuery && (
          <section ref={featuredRef} style={{ marginBottom: 72 }}>
            <SectionHeader
              eyebrow="Store of the Month"
              title="Featured This Month"
              desc="Our editors spotlight one exceptional store each month. This month's pick is setting the standard."
              accent="#C9A84C"
              visible={featuredVis}
              action="See Past Features"
            />
            <div style={{ display: "flex", gap: 20 }}>
              <FeaturedStoreCard store={featuredStore} delay={0} visible={featuredVis} />

              {/* Side panel */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 16,
                flex: "0 0 320px",
                opacity: featuredVis ? 1 : 0,
                transform: featuredVis ? "translateX(0)" : "translateX(24px)",
                transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
              }}>
                <div style={{
                  background: "#0f0f0f", borderRadius: 16,
                  padding: "24px", flex: 1, display: "flex", flexDirection: "column",
                }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#C9A84C", fontFamily: "'DM Mono', monospace" }}>
                    Why We Love Them
                  </p>
                  <p style={{ margin: "0 0 24px", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, flex: 1 }}>
                    "{featuredStore.name} consistently delivers the kind of thoughtful, elevated wardrobe pieces we wish were everywhere. Their attention to fabric and fit is unmatched on the platform."
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2a2a2a", overflow: "hidden" }}>
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Adaeze O.</span>
                      <span style={{ fontSize: 9, color: "#555", display: "block" }}>WooSho Editor</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #f0f0f0" }}>
                  <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#999" }}>Store At a Glance</p>
                  {[
                    { label: "Member Since", val: featuredStore.joined },
                    { label: "Category", val: featuredStore.category },
                    { label: "Location", val: featuredStore.location },
                    { label: "Products", val: featuredStore.products },
                    { label: "Total Sales", val: fmtNum(featuredStore.sales) },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8f8f8" }}>
                      <span style={{ fontSize: 12, color: "#aaa" }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f0f0f" }}>{r.val}</span>
                    </div>
                  ))}
                  <button style={{
                    width: "100%", marginTop: 16,
                    background: "#0f0f0f", color: "#fff",
                    border: "none", borderRadius: 8,
                    fontSize: 11, fontWeight: 700, letterSpacing: 1,
                    textTransform: "uppercase", padding: "12px 0",
                    cursor: "pointer",
                  }}>Visit Store</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── TOP SELLERS LEADERBOARD ── */}
        {!searchQuery && (
          <section ref={topRef} style={{ marginBottom: 72 }}>
            <SectionHeader
              eyebrow="Sales Leaders"
              title="Top Selling Stores"
              desc="Ranked by total units sold. These stores consistently deliver."
              accent="#C9A84C"
              visible={topVis}
              action="Full Rankings"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {topSellers.map((store, i) => (
                <LeaderboardRow key={store.id} store={store} rank={i + 1} visible={topVis} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* ── VERIFIED ── */}
        {!searchQuery && (
          <section ref={verifiedRef} style={{ marginBottom: 72 }}>
            <SectionHeader
              eyebrow="Trust & Quality"
              title="Verified Stores"
              desc="Identity-verified, quality-checked, and held to our highest standards."
              accent="#1A73C9"
              visible={verifiedVis}
              action="View All Verified"
            />
            <StoreRow stores={verifiedStores} delay={0} visible={verifiedVis} />
          </section>
        )}

        {/* ── NEW ARRIVALS ── */}
        {!searchQuery && (
          <section ref={newRef} style={{ marginBottom: 72 }}>
            <SectionHeader
              eyebrow="Just Joined"
              title="Recently Added Stores"
              desc="Fresh faces on the marketplace. Be the first to discover them."
              accent="#0F7B6C"
              visible={newVis}
              action="See All New"
            />
            <StoreRow stores={newStores} delay={0} visible={newVis} />
          </section>
        )}

        {/* ── RISING STARS ── */}
        {!searchQuery && (
          <section ref={risingRef} style={{ marginBottom: 72 }}>
            <SectionHeader
              eyebrow="Ones to Watch"
              title="Rising Stars"
              desc="These stores are growing fast. Early movers get the best picks."
              accent="#9B59B6"
              visible={risingVis}
              action="See All Rising"
            />
            <StoreRow stores={risingStores} delay={0} visible={risingVis} />
          </section>
        )}

        {/* ── BROWSE ALL ── */}
        <section ref={browseRef} style={{ marginBottom: 80 }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            marginBottom: 24,
            opacity: browseVis ? 1 : 0,
            transform: browseVis ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <span style={{ display: "inline-block", width: 20, height: 2, background: "#888", borderRadius: 1 }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>All Stores</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: "#0f0f0f", fontFamily: "'Playfair Display', serif" }}>
                Browse {filtered.length} Stores
              </h2>
            </div>

            {/* Layout toggle */}
            <div style={{ display: "flex", gap: 6 }}>
              {["grid", "list"].map(l => (
                <button key={l} onClick={() => setLayout(l)} style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: layout === l ? "#0f0f0f" : "#fff",
                  border: "1px solid #e8e8e8",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {l === "grid"
                    ? <svg width="14" height="14" fill={layout === l ? "#fff" : "#888"} viewBox="0 0 12 12"><rect x="0" y="0" width="5" height="5"/><rect x="7" y="0" width="5" height="5"/><rect x="0" y="7" width="5" height="5"/><rect x="7" y="7" width="5" height="5"/></svg>
                    : <svg width="14" height="14" fill="none" stroke={layout === l ? "#fff" : "#888"} strokeWidth="1.5"><path d="M2 4h10M2 8h10"/></svg>
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Category filter pills */}
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28,
            opacity: browseVis ? 1 : 0,
            transition: "opacity 0.5s ease 0.1s",
          }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? "#0f0f0f" : "#fff",
                  border: "1px solid",
                  borderColor: activeCategory === cat ? "#0f0f0f" : "#e8e8e8",
                  borderRadius: 20,
                  padding: "7px 16px",
                  fontSize: 11, fontWeight: 600,
                  color: activeCategory === cat ? "#fff" : "#666",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                  transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid / List */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#bbb" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#999" }}>No stores match your search.</p>
            </div>
          ) : layout === "grid" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 20,
            }}>
              {filtered.map((store, i) => (
                <StoreCard key={store.id} store={store} delay={i * 50} visible={browseVis} layout="grid" />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((store, i) => (
                <StoreCard key={store.id} store={store} delay={i * 40} visible={browseVis} layout="list" />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA BANNER ── */}
        <div style={{
          background: "#0f0f0f",
          borderRadius: 20,
          padding: "56px 64px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 80,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${featuredStore.cover})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.07,
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "#C9A84C", fontFamily: "'DM Mono', monospace" }}>
              Sell on WooSho
            </p>
            <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif", letterSpacing: -0.5 }}>
              Open Your Store Today.
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 380 }}>
              Join 2,800+ stores reaching buyers across Africa. It only takes a few minutes to get started.
            </p>
          </div>
          <div 
            style={{ display: "flex", 
            gap: 12, position: "relative", 
            zIndex: 1, flexShrink: 0 }}
          >
            <button style={{
              background: "#C9A84C", border: "none", borderRadius: 8,
              padding: "14px 28px", fontSize: 12, fontWeight: 700,
              letterSpacing: 1, color: "#fff", cursor: "pointer",
              textTransform: "uppercase",
            }}>
              Start Selling
            </button>
            <button style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8, padding: "14px 24px",
              fontSize: 12, fontWeight: 600, letterSpacing: 0.8,
              color: "rgba(255,255,255,0.75)", cursor: "pointer",
              textTransform: "uppercase",
            }}>
              Learn More
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}