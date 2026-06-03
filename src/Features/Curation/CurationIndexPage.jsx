import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const HERO_SLIDES = [
  {
    id: "h1",
    type: "image",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=90",
    eyebrow: "New Collection · SS 2025",
    headline: "Dressed for\nEvery Chapter.",
    sub: "The season's most anticipated arrivals — crafted for the life you're living.",
    cta: "Shop New Arrivals",
    ctaSecondary: "Explore Lookbook",
    accent: "#C9A84C",
    theme: "dark",
    position: "left",
  },
  {
    id: "h2",
    type: "image",
    src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1800&q=90",
    eyebrow: "Flash Sale · Up to 60% Off",
    headline: "Today's Best\nDeals Are Live.",
    sub: "Time-limited prices on the pieces everyone's been waiting for.",
    cta: "Shop Flash Deals",
    ctaSecondary: "View All Deals",
    accent: "#E8433A",
    theme: "dark",
    position: "right",
  },
  {
    id: "h3",
    type: "image",
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=90",
    eyebrow: "Editor's Selection",
    headline: "The Pieces\nWorth Owning.",
    sub: "Our editors have spoken. These are the wardrobe investments that endure.",
    cta: "See Editor's Picks",
    ctaSecondary: "Read the Edit",
    accent: "#6B4FA0",
    theme: "dark",
    position: "center",
  },
  {
    id: "h4",
    type: "video",
    src: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1800&q=90",
    videoSrc: null,
    eyebrow: "Trending Now",
    headline: "What Everyone's\nWearing Right Now.",
    sub: "Live trend data. Real-time picks. The pulse of fashion at your fingertips.",
    cta: "Explore Trending",
    ctaSecondary: "See All",
    accent: "#E8433A",
    theme: "dark",
    position: "left",
  },
  {
    id: "h5",
    type: "image",
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&q=90",
    eyebrow: "Most Loved · Top Rated",
    headline: "Loved by\nThousands.",
    sub: "The most-rated, most-repurchased pieces on WooSho — chosen by real shoppers.",
    cta: "Shop Most Loved",
    ctaSecondary: "Read Reviews",
    accent: "#D4447A",
    theme: "dark",
    position: "right",
  },
];

const SECTIONS = [
  {
    id: "trending",
    label: "Trending Now",
    tag: "LIVE",
    tagColor: "#E8433A",
    accent: "#E8433A",
    items: [
      { id: 1, name: "Oversized Linen Blazer", brand: "Studio Minimal", price: 289, originalPrice: 380, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", badge: "#1 This Week", sold: 842 },
      { id: 2, name: "Ribbed Knit Maxi Dress", brand: "Forme d'Expression", price: 195, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", badge: "↑ 340%", sold: 621 },
      { id: 3, name: "Clean Leather Loafer", brand: "Aesop Foot", price: 320, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", badge: "Viral", sold: 503 },
      { id: 4, name: "Wool Cargo Trousers", brand: "Unstructured Co.", price: 175, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", badge: "Trending", sold: 398 },
      { id: 5, name: "Structured Tote Bag", brand: "Matter Works", price: 240, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", badge: "Top 5", sold: 297 },
    ],
  },
  {
    id: "bestsellers",
    label: "Best Sellers",
    tag: "ALWAYS ON",
    tagColor: "#1A1A2E",
    accent: "#C9A84C",
    items: [
      { id: 6, name: "Classic Trench Coat", brand: "Foundry Label", price: 495, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", badge: "All-Time Best", sold: 3200 },
      { id: 7, name: "Slim Fit Turtleneck", brand: "Wardrobe Basics", price: 110, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", badge: "Since 2021", sold: 2800 },
      { id: 8, name: "High-Rise Wide Leg Jean", brand: "Denim Theory", price: 165, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", badge: "Evergreen", sold: 2400 },
      { id: 9, name: "Merino Crew Sweater", brand: "Soft Goods", price: 145, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80", badge: "Fan Favourite", sold: 1900 },
      { id: 10, name: "Canvas Slip-On", brand: "Form & Function", price: 89, img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80", badge: "Best Value", sold: 1700 },
    ],
  },
  {
    id: "newarrivals",
    label: "New Arrivals",
    tag: "JUST IN",
    tagColor: "#0F7B6C",
    accent: "#0F7B6C",
    items: [
      { id: 11, name: "Asymmetric Linen Top", brand: "Studio Minimal", price: 135, img: "https://images.unsplash.com/photo-1485462537746-965f33f52f86?w=400&q=80", badge: "New", sold: null },
      { id: 12, name: "Textured Midi Skirt", brand: "Forme d'Expression", price: 210, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", badge: "New", sold: null },
      { id: 13, name: "Boxy Leather Jacket", brand: "Aesop Foot", price: 580, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", badge: "New", sold: null },
      { id: 14, name: "Draped Knit Cardigan", brand: "Soft Goods", price: 175, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80", badge: "New", sold: null },
      { id: 15, name: "Tailored Bermuda Short", brand: "Foundry Label", price: 145, img: "https://images.unsplash.com/photo-1504198266287-1659872e6590?w=400&q=80", badge: "New", sold: null },
    ],
  },
  {
    id: "flashdeals",
    label: "Flash Deals",
    tag: "ENDS SOON",
    tagColor: "#E8433A",
    accent: "#E8433A",
    isFlash: true,
    items: [
      { id: 16, name: "Silk Wrap Blouse", brand: "Forme d'Expression", price: 98, originalPrice: 210, img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80", badge: "53% OFF", timeLeft: "2h 14m" },
      { id: 17, name: "Leather Belt Bag", brand: "Matter Works", price: 79, originalPrice: 155, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", badge: "49% OFF", timeLeft: "3h 02m" },
      { id: 18, name: "Textured Blazer", brand: "Studio Minimal", price: 148, originalPrice: 295, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", badge: "50% OFF", timeLeft: "1h 45m" },
      { id: 19, name: "Striped Linen Shirt", brand: "Wardrobe Basics", price: 65, originalPrice: 120, img: "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=400&q=80", badge: "46% OFF", timeLeft: "4h 30m" },
    ],
  },
  {
    id: "dealofday",
    label: "Deal of the Day",
    tag: "TODAY ONLY",
    tagColor: "#C9A84C",
    accent: "#C9A84C",
    isDealOfDay: true,
    featured: { id: 20, name: "Premium Down Puffer", brand: "Foundry Label", price: 199, originalPrice: 450, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", badge: "56% OFF", sold: 140, stock: 200 },
    items: [
      { id: 21, name: "Cashmere Scarf", brand: "Soft Goods", price: 69, originalPrice: 145, img: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&q=80", badge: "52% OFF" },
      { id: 22, name: "Suede Chelsea Boot", brand: "Aesop Foot", price: 155, originalPrice: 310, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80", badge: "50% OFF" },
      { id: 23, name: "Cotton Canvas Cap", brand: "Form & Function", price: 35, originalPrice: 68, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80", badge: "49% OFF" },
    ],
  },
  {
    id: "editorspicks",
    label: "Editor's Picks",
    tag: "CURATED",
    tagColor: "#6B4FA0",
    accent: "#6B4FA0",
    editorial: true,
    items: [
      { id: 24, name: "Plissé Pleated Trousers", brand: "Forme d'Expression", price: 245, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", note: "The trouser of the season." },
      { id: 25, name: "Raw-Edge Shirt", brand: "Studio Minimal", price: 175, img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80", note: "Impeccably undone." },
      { id: 26, name: "Boucle Coat", brand: "Foundry Label", price: 520, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", note: "The investment piece." },
      { id: 27, name: "Slip Dress", brand: "Forme d'Expression", price: 185, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", note: "Quiet luxury, defined." },
      { id: 28, name: "Leather Derby", brand: "Aesop Foot", price: 340, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", note: "Sharp from heel to toe." },
    ],
  },
  {
    id: "mostloved",
    label: "Most Loved",
    tag: "TOP RATED",
    tagColor: "#D4447A",
    accent: "#D4447A",
    items: [
      { id: 29, name: "Cashmere Crewneck", brand: "Soft Goods", price: 265, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", rating: 4.9, reviews: 2130 },
      { id: 30, name: "Tailored Blazer", brand: "Foundry Label", price: 395, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", rating: 4.8, reviews: 1870 },
      { id: 31, name: "Wide Leg Trousers", brand: "Unstructured Co.", price: 155, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", rating: 4.8, reviews: 1540 },
      { id: 32, name: "Day Tote", brand: "Matter Works", price: 195, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", rating: 4.9, reviews: 1420 },
      { id: 33, name: "Block Heel Mule", brand: "Aesop Foot", price: 210, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", rating: 4.7, reviews: 1280 },
    ],
  },
  {
    id: "hotrightnow",
    label: "Hot Right Now",
    tag: "SURGING",
    tagColor: "#E8433A",
    accent: "#F05D27",
    items: [
      { id: 34, name: "Double-Breasted Vest", brand: "Studio Minimal", price: 165, img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80", velocity: "+280% in 2h" },
      { id: 35, name: "Barrel-Leg Jean", brand: "Denim Theory", price: 175, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", velocity: "+195% in 3h" },
      { id: 36, name: "Oversize Trench", brand: "Foundry Label", price: 540, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", velocity: "+170% in 4h" },
      { id: 37, name: "Micro Shoulder Bag", brand: "Matter Works", price: 185, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", velocity: "+140% in 2h" },
      { id: 38, name: "Knit Maxi Skirt", brand: "Forme d'Expression", price: 190, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", velocity: "+120% in 5h" },
    ],
  },
  {
    id: "recommended",
    label: "Recommended For You",
    tag: "PERSONAL",
    tagColor: "#1A73C9",
    accent: "#1A73C9",
    items: [
      { id: 39, name: "Tailored Chino", brand: "Unstructured Co.", price: 145, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", reason: "Based on your style" },
      { id: 40, name: "Cotton Poplin Shirt", brand: "Wardrobe Basics", price: 95, img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80", reason: "Matches your wishlist" },
      { id: 41, name: "Longline Trench", brand: "Foundry Label", price: 480, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", reason: "You'd love this" },
      { id: 42, name: "Platform Boot", brand: "Aesop Foot", price: 290, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", reason: "Your taste" },
      { id: 43, name: "Silk Cami Set", brand: "Forme d'Expression", price: 220, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", reason: "Trending in your size" },
    ],
  },
  {
    id: "continueshopping",
    label: "Continue Shopping",
    tag: "PICK UP WHERE YOU LEFT OFF",
    tagColor: "#555",
    accent: "#888",
    items: [
      { id: 44, name: "Boxy Linen Jacket", brand: "Studio Minimal", price: 310, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", lastSeen: "2h ago", progress: "In Cart" },
      { id: 45, name: "Ribbed Midi Skirt", brand: "Forme d'Expression", price: 155, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", lastSeen: "Yesterday", progress: "Saved" },
      { id: 46, name: "Suede Derby", brand: "Aesop Foot", price: 280, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", lastSeen: "2 days ago", progress: "Viewed" },
      { id: 47, name: "Canvas Backpack", brand: "Matter Works", price: 175, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", lastSeen: "3 days ago", progress: "Viewed" },
    ],
  },
  {
    id: "browsing",
    label: "Based On Your Browsing",
    tag: "JUST FOR YOU",
    tagColor: "#1A73C9",
    accent: "#1A73C9",
    items: [
      { id: 48, name: "Slim Wool Trousers", brand: "Foundry Label", price: 225, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", reason: "You browsed trousers" },
      { id: 49, name: "Leather Crossbody", brand: "Matter Works", price: 195, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", reason: "After viewing bags" },
      { id: 50, name: "Cashmere Polo", brand: "Soft Goods", price: 185, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", reason: "Related to knitwear" },
      { id: 51, name: "Mule Sandal", brand: "Aesop Foot", price: 175, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", reason: "You browsed shoes" },
      { id: 52, name: "Linen Co-ord Set", brand: "Studio Minimal", price: 260, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", reason: "Based on your style" },
    ],
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const DURATION = 5500;

  const go = useCallback((idx, dir = 1) => {
    setPrev(current);
    setDirection(dir);
    setCurrent(idx);
    setProgress(0);
  }, [current]);

  useEffect(() => {
    if (paused) return;
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + (100 / (DURATION / 60));
      });
    }, 60);
    timerRef.current = setTimeout(() => {
      const next = (current + 1) % HERO_SLIDES.length;
      go(next, 1);
    }, DURATION);
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [current, paused]);

  const slide = HERO_SLIDES[current];
  const prevSlide = prev !== null ? HERO_SLIDES[prev] : null;

  const textX = slide.position === "right" ? "flex-end" : slide.position === "center" ? "center" : "flex-start";
  const textAlign = slide.position === "right" ? "right" : slide.position === "center" ? "center" : "left";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "92vh",
        minHeight: 560,
        overflow: "hidden",
        background: "#0a0a0a",
      }}
      className="mt-14"
    >
      {/* Slides — pure background-image crossfade + Ken Burns */}
      {HERO_SLIDES.map((s, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              backgroundImage: `url(${s.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              opacity: isActive ? 1 : 0,
              transform: isActive ? "scale(1.06)" : "scale(1.0)",
              transition: isActive
                ? "opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 7s ease-out"
                : "opacity 1.0s cubic-bezier(0.4,0,0.2,1), transform 0.6s ease",
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* Dark overlay — layered for depth */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.1) 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 64px 64px",
      }}>
        {/* Eyebrow */}
        <div key={`eyebrow-${current}`} style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 18,
          animation: "heroFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
          animationDelay: "0.05s",
        }}>
          <span style={{
            display: "inline-block",
            width: 28, height: 2,
            background: slide.accent,
            borderRadius: 1,
          }} />
          <span style={{
            fontSize: 10, fontWeight: 800,
            letterSpacing: 3, textTransform: "uppercase",
            color: slide.accent,
            fontFamily: "'DM Mono', monospace",
          }}>
            {slide.eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h1
          key={`h-${current}`}
          style={{
            margin: "0 0 20px",
            fontSize: "clamp(40px, 6.5vw, 82px)",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: "#fff",
            fontFamily: "'Playfair Display', serif",
            whiteSpace: "pre-line",
            maxWidth: 680,
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.15s",
          }}
        >
          {slide.headline}
        </h1>

        {/* Sub */}
        <p
          key={`sub-${current}`}
          style={{
            margin: "0 0 36px",
            fontSize: 15,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 460,
            lineHeight: 1.65,
            fontWeight: 400,
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.25s",
          }}
        >
          {slide.sub}
        </p>

        {/* CTAs */}
        <div
          key={`cta-${current}`}
          style={{
            display: "flex", gap: 12, alignItems: "center",
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.35s",
          }}
        >
          <button style={{
            background: slide.accent,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "opacity 0.2s ease",
          }}>
            {slide.cta}
          </button>
          <button style={{
            background: "transparent",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            padding: "14px 24px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {slide.ctaSecondary}
          </button>
        </div>

        {/* Bottom bar: dots + slide counter + progress */}
        <div style={{
          position: "absolute",
          bottom: 64, right: 64,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16,
        }}>
          {/* Counter */}
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, color: "rgba(255,255,255,0.5)",
            letterSpacing: 1,
          }}>
            {String(current + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
          </div>

          {/* Dot Topbar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i, i > current ? 1 : -1)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {i === current && (
                  <span style={{
                    fontSize: 9, color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase", letterSpacing: 1.5,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {s.eyebrow.split("·")[0].trim()}
                  </span>
                )}
                <span style={{
                  display: "block",
                  width: i === current ? 32 : 6,
                  height: 3,
                  borderRadius: 2,
                  background: i === current ? slide.accent : "rgba(255,255,255,0.3)",
                  transition: "width 0.4s ease, background 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {i === current && (
                    <span style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: `${progress}%`,
                      background: "#fff",
                      opacity: 0.5,
                      transition: "width 0.06s linear",
                    }} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Prev/Next arrows */}
        <div style={{
          position: "absolute",
          top: "50%", right: 24,
          transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <button
            onClick={() => go((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length, -1)}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L3 7l6 5"/>
            </svg>
          </button>
          <button
            onClick={() => go((current + 1) % HERO_SLIDES.length, 1)}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 2l6 5-6 5"/>
            </svg>
          </button>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          opacity: 0.5,
          animation: "heroScrollBounce 2s ease-in-out infinite",
        }}>
          <span style={{ fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "#fff", fontFamily: "'DM Mono', monospace" }}>Scroll</span>
          <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="1.5">
            <path d="M8 3v10M4 9l4 4 4-4"/>
          </svg>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        zIndex: 5,
        display: "flex",
        height: 5,
      }}>
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            onClick={() => go(i, i > current ? 1 : -1)}
            style={{
              flex: 1,
              background: i === current ? s.accent : "rgba(255,255,255,0.15)",
              transition: "background 0.4s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(5px); }
        }
      `}</style>
    </div>
  );
}

const TOPBAR_LABELS = {
  trending: "Trending",
  bestsellers: "Best Sellers",
  newarrivals: "New Arrivals",
  flashdeals: "Flash Deals",
  dealofday: "Deal of the Day",
  editorspicks: "Editor's Picks",
  mostloved: "Most Loved",
  hotrightnow: "Hot Right Now",
  recommended: "For You",
  continueshopping: "Continue",
  browsing: "Browsing",
};

function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, ...options });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return isIntersecting;
}

function CountdownTimer({ label }) {
  const [time, setTime] = useState(() => {
    const parts = label.match(/(\d+)h (\d+)m/);
    if (!parts) return { h: 2, m: 30, s: 0 };
    return { h: parseInt(parts[1]), m: parseInt(parts[2]), s: 0 };
  });
  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => {
        let { h, m, s } = t;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return t;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, "0");
  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, color: "#E8433A", fontWeight: 600 }}>
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="9" height="9" viewBox="0 0 10 10" fill={i <= Math.round(rating) ? "#C9A84C" : "#ddd"}>
          <path d="M5 0.5l1.1 3.1H9.3L6.7 5.6l1 3.1L5 7l-2.7 1.7 1-3.1L.7 3.6h3.2z"/>
        </svg>
      ))}
    </span>
  );
}

function ProductCard({ item, accent, editorial, isMostLoved, isContinue, isBrowsing, isHot, delay = 0, visible }) {
  const [hovered, setHovered] = useState(false);
  const [wished, setWished] = useState(false);
  const discount = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "0 0 200px",
        width: 200,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        background: "#f4f3f0",
        aspectRatio: "3/4",
        marginBottom: 10,
      }}>
        <img
          src={item.img}
          alt={item.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.045)" : "scale(1)",
            transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
            display: "block",
          }}
        />
        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.18)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }} />
        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setWished(w => !w); }}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered || wished ? 1 : 0,
            transform: hovered || wished ? "scale(1)" : "scale(0.8)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            backdropFilter: "blur(4px)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? "#E8433A" : "none"} stroke={wished ? "#E8433A" : "#1a1a1a"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {/* Badge */}
        {item.badge && (
          <div style={{
            position: "absolute", bottom: 10, left: 10,
            background: discount ? accent : "rgba(0,0,0,0.8)",
            color: "#fff",
            fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 4,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}>
            {item.badge}
          </div>
        )}
        {/* Timer for flash */}
        {item.timeLeft && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "rgba(0,0,0,0.85)",
            padding: "4px 8px", borderRadius: 4,
          }}>
            <CountdownTimer label={item.timeLeft} />
          </div>
        )}
        {/* Quick Add */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 10px",
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          opacity: hovered ? 1 : 0,
          transition: "transform 0.3s ease, opacity 0.3s ease",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button style={{
            background: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            padding: "6px 12px",
            cursor: "pointer",
            color: "#1a1a1a",
          }}>
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        {isContinue && item.progress && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase", color: accent,
            display: "block", marginBottom: 3,
          }}>{item.progress} · {item.lastSeen}</span>
        )}
        {(isBrowsing || item.reason) && item.reason && (
          <span style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 3, letterSpacing: 0.3 }}>
            {item.reason}
          </span>
        )}
        {isHot && item.velocity && (
          <span style={{ fontSize: 9, color: accent, fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 3 }}>
            {item.velocity}
          </span>
        )}
        {isMostLoved && item.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <Stars rating={item.rating} />
            <span style={{ fontSize: 10, color: "#999" }}>{item.reviews?.toLocaleString()}</span>
          </div>
        )}
        {editorial && item.note && (
          <p style={{ fontSize: 10, color: "#999", margin: "0 0 3px", fontStyle: "italic", letterSpacing: 0.2 }}>
            "{item.note}"
          </p>
        )}
        <p style={{ margin: 0, fontSize: 10, color: "#888", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>{item.brand}</p>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#0f0f0f", lineHeight: 1.3, marginBottom: 5 }}>{item.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: discount ? accent : "#0f0f0f" }}>
            ₦{(item.price * 1500).toLocaleString()}
          </span>
          {item.originalPrice && (
            <span style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>
              ₦{(item.originalPrice * 1500).toLocaleString()}
            </span>
          )}
        </div>
        {item.sold && (
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "#aaa" }}>{item.sold.toLocaleString()} sold</p>
        )}
      </div>
    </div>
  );
}

function DealOfDaySection({ section, visible }) {
  const featured = section.featured;
  const pct = Math.round((featured.sold / featured.stock) * 100);
  const discount = Math.round((1 - featured.price / featured.originalPrice) * 100);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 20, marginBottom: 20,
      }}>
        {/* Featured */}
        <div style={{
          background: "#0f0f0f",
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}>
          <div style={{ position: "relative", flex: 1, minHeight: 300 }}>
            <img src={featured.img} alt={featured.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75, display: "block" }} />
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <span style={{
                background: section.accent, color: "#fff",
                fontSize: 12, fontWeight: 800,
                padding: "5px 12px", borderRadius: 5,
                letterSpacing: 1,
              }}>{discount}% OFF</span>
            </div>
          </div>
          <div style={{ padding: "20px 20px 22px" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 1 }}>{featured.brand}</p>
            <p style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{featured.name}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: section.accent }}>
                ₦{(featured.price * 1500).toLocaleString()}
              </span>
              <span style={{ fontSize: 14, color: "#555", textDecoration: "line-through" }}>
                ₦{(featured.originalPrice * 1500).toLocaleString()}
              </span>
            </div>
            {/* Progress bar */}
            <p style={{ fontSize: 10, color: "#666", marginBottom: 5 }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>{featured.sold}</span> of {featured.stock} sold
            </p>
            <div style={{ height: 4, background: "#2a2a2a", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: section.accent,
                borderRadius: 2,
                transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
              }} />
            </div>
            <button style={{
              width: "100%", marginTop: 16,
              background: section.accent, color: "#fff",
              border: "none", borderRadius: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: 1,
              textTransform: "uppercase",
              padding: "12px 0",
              cursor: "pointer",
            }}>Add to Cart</button>
          </div>
        </div>

        {/* Side items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {section.items.map((item, i) => {
            const d2 = Math.round((1 - item.price / item.originalPrice) * 100);
            return (
              <div key={item.id} style={{
                display: "flex", gap: 14, alignItems: "center",
                background: "#fafaf8",
                borderRadius: 12, overflow: "hidden",
                padding: 0,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(20px)",
                transition: `opacity 0.5s ease ${100 + i * 80}ms, transform 0.5s ease ${100 + i * 80}ms`,
              }}>
                <img src={item.img} alt={item.name}
                  style={{ width: 90, height: 90, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.brand}</p>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{item.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: section.accent }}>₦{(item.price * 1500).toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: "#bbb", textDecoration: "line-through" }}>₦{(item.originalPrice * 1500).toLocaleString()}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: section.accent, padding: "2px 5px", borderRadius: 3 }}>{d2}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HorizontalScroll({ children }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const scroll = dir => {
    ref.current?.scrollBy({ left: dir * 440, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>
      {canLeft && (
        <button onClick={() => scroll(-1)} style={{
          position: "absolute", left: -16, top: "38%", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff", border: "1px solid #e8e8e8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <svg width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M9 2L3 7l6 5"/>
          </svg>
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll(1)} style={{
          position: "absolute", right: -16, top: "38%", zIndex: 10,
          width: 36, height: 36, borderRadius: "50%",
          background: "#fff", border: "1px solid #e8e8e8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <svg width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M5 2l6 5-6 5"/>
          </svg>
        </button>
      )}
      <div ref={ref} style={{
        display: "flex", gap: 16,
        overflowX: "auto", overflowY: "visible",
        paddingBottom: 8, paddingTop: 4,
        scrollbarWidth: "none",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
      }}>
        {children}
      </div>
    </div>
  );
}

function SectionBlock({ section, activeId }) {
  const ref = useRef(null);
  const visible = useIntersectionObserver(ref);
  const isActive = activeId === section.id;

  const isHot = section.id === "hotrightnow";
  const isMostLoved = section.id === "mostloved";
  const isContinue = section.id === "continueshopping";
  const isBrowsing = section.id === "browsing";

  return (
    <section
      id={section.id}
      ref={ref}
      style={{ paddingBottom: 64 }}
    >
      {/* Section Header */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 24,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 800,
              letterSpacing: 1.5, textTransform: "uppercase",
              color: section.tagColor,
              display: "inline-block",
            }}>
              {section.tag}
            </span>
            {section.isFlash && <CountdownTimer label="2h 30m" />}
          </div>
          <h2 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#0f0f0f",
            letterSpacing: -0.5,
            fontFamily: "'Playfair Display', serif",
          }}>
            {section.label}
          </h2>
        </div>
        <a href="#" style={{
          fontSize: 11, fontWeight: 600,
          color: "#666", textDecoration: "none",
          letterSpacing: 0.5, textTransform: "uppercase",
          borderBottom: "1px solid #ccc",
          paddingBottom: 1,
          transition: "color 0.2s ease, border-color 0.2s ease",
        }}>
          View All →
        </a>
      </div>

      {/* Deal of the Day layout */}
      {section.isDealOfDay ? (
        <DealOfDaySection section={section} visible={visible} />
      ) : (
        <HorizontalScroll>
          {section.items.map((item, i) => (
            <ProductCard
              key={item.id}
              item={item}
              accent={section.accent}
              editorial={section.editorial}
              isMostLoved={isMostLoved}
              isContinue={isContinue}
              isBrowsing={isBrowsing}
              isHot={isHot}
              delay={i * 60}
              visible={visible}
            />
          ))}
        </HorizontalScroll>
      )}
    </section>
  );
}

export default function ShowcaseIndexPage() {
  const [activeId, setActiveId] = useState("trending");
  const topbarRef = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@500&display=swap";
    document.head.appendChild(link);
    link.onload = () => setFontsLoaded(true);
    setTimeout(() => setFontsLoaded(true), 2000);
  }, []);

  useEffect(() => {
    const observers = SECTIONS.map(s => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveId(s.id);
      }, { threshold: 0.2, rootMargin: "-20% 0px -60% 0px" });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const scrollToSection = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollTopbar = dir => {
    topbarRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#fff",
      minHeight: "100vh",
      color: "#1a1a1a",
    }}>
      {/* Sticky Topbar */}
      <div style={{
        position: "sticky", top: 70, zIndex: 100,
        background: "rgba(255,255,255,0.96)",
        borderBottom: "1px solid #f0f0f0",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 32px",
          display: "flex", alignItems: "center", gap: 0,
        }}>
          <button onClick={() => scrollTopbar(-1)} style={{
            padding: "14px 8px", background: "none", border: "none",
            cursor: "pointer", color: "#aaa", fontSize: 16, flexShrink: 0,
          }}>‹</button>
          <div ref={topbarRef} style={{
            display: "flex", gap: 0,
            overflowX: "auto", scrollbarWidth: "none",
            flex: 1,
          }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                style={{
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  borderBottom: activeId === s.id ? `2px solid ${s.accent}` : "2px solid transparent",
                  padding: "16px 14px",
                  fontSize: 11,
                  fontWeight: activeId === s.id ? 700 : 500,
                  color: activeId === s.id ? s.accent : "#888",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                  whiteSpace: "nowrap",
                  transition: "color 0.2s ease, border-color 0.2s ease",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {TOPBAR_LABELS[s.id]}
              </button>
            ))}
          </div>
          <button onClick={() => scrollTopbar(1)} style={{
            padding: "14px 8px", background: "none", border: "none",
            cursor: "pointer", color: "#aaa", fontSize: 16, flexShrink: 0,
          }}>›</button>
        </div>
      </div>

      {/* Full-bleed Hero */}
      <HeroBanner />

      {/* Sections */}
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "64px 48px 0",
      }}>
        {SECTIONS.map(section => (
          <SectionBlock key={section.id} section={section} activeId={activeId} />
        ))}
      </div>

      {/* Footer spacing */}
      <div style={{ height: 80 }} />
    </div>
  );
}