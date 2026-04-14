// src/components/Navbar.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useRegisterCartIcon } from "../Context/cart/CartAnimationContext";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import FixedWrapper from "./NavbarComponents/FixedWrapper";
import SearchPanel from "./NavbarComponents/SearchPanel";
import MobileDrawer from "./NavbarComponents/MobileDrawer";

gsap.registerPlugin(ScrollToPlugin);

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BagIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const CloseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const ChevronDown = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const ArrowRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Mega menu data ────────────────────────────────────────────────────────────
const MEGA_MENU = {
  Shop: {
    featured: { title: "Summer Edit 2025", subtitle: "The season's must-haves", tag: "🔥 Trending", gradient: "from-orange-400 to-rose-500" },
    columns: [
      {
        heading: "Women",
        links: [
          { label: "Dresses & Skirts", badge: null },
          { label: "Tops & Blouses", badge: null },
          { label: "Bags & Purses", badge: "New" },
          { label: "Heels & Flats", badge: null },
          { label: "Jewellery", badge: null },
          { label: "Scarves", badge: "Hot" },
        ],
      },
      {
        heading: "Men",
        links: [
          { label: "Shirts & Polos", badge: null },
          { label: "Trousers & Chinos", badge: null },
          { label: "Sneakers", badge: "New" },
          { label: "Watches", badge: null },
          { label: "Belts & Wallets", badge: null },
          { label: "Sunglasses", badge: null },
        ],
      },
      {
        heading: "Lifestyle",
        links: [
          { label: "Home Décor", badge: null },
          { label: "Kitchen & Dining", badge: null },
          { label: "Sports & Fitness", badge: "Sale" },
          { label: "Tech Accessories", badge: null },
          { label: "Gift Sets", badge: "🎁" },
          { label: "Kids & Baby", badge: null },
        ],
      },
    ],
    promos: [
      { label: "30% Off Bags", color: "bg-rose-50 text-rose-600 border-rose-100" },
      { label: "Free Shipping $50+", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
      { label: "New Member Gift", color: "bg-amber-50 text-amber-600 border-amber-100" },
    ],
  },
  "New In": {
    featured: { title: "Just Dropped", subtitle: "Fresh off the runway", tag: "✨ New", gradient: "from-violet-500 to-indigo-600" },
    columns: [
      {
        heading: "This Week",
        links: [
          { label: "New Arrivals", badge: "68" },
          { label: "Designer Picks", badge: null },
          { label: "Trending Now", badge: null },
          { label: "Staff Favourites", badge: null },
        ],
      },
      {
        heading: "Collections",
        links: [
          { label: "Summer 2025", badge: "New" },
          { label: "Resort Collection", badge: null },
          { label: "Workwear Edit", badge: null },
          { label: "Weekend Casual", badge: null },
        ],
      },
      {
        heading: "By Category",
        links: [
          { label: "Footwear", badge: null },
          { label: "Accessories", badge: null },
          { label: "Fragrances", badge: "New" },
          { label: "Beauty", badge: null },
        ],
      },
    ],
    promos: [
      { label: "Early Access for Members", color: "bg-violet-50 text-violet-600 border-violet-100" },
      { label: "See What's Trending", color: "bg-blue-50 text-blue-600 border-blue-100" },
    ],
  },
  Brands: {
    featured: { title: "Top Brands", subtitle: "Curated luxury labels", tag: "💎 Premium", gradient: "from-gray-700 to-gray-900" },
    columns: [
      {
        heading: "Luxury",
        links: [
          { label: "Gucci", badge: null },
          { label: "Prada", badge: null },
          { label: "Versace", badge: null },
          { label: "Dior", badge: null },
        ],
      },
      {
        heading: "Premium",
        links: [
          { label: "Zara Premium", badge: null },
          { label: "H&M Studio", badge: null },
          { label: "Balenciaga", badge: "Hot" },
          { label: "Fendi", badge: null },
        ],
      },
      {
        heading: "Trending",
        links: [
          { label: "Off-White", badge: null },
          { label: "Stone Island", badge: null },
          { label: "Jacquemus", badge: "New" },
          { label: "A-COLD-WALL*", badge: null },
        ],
      },
    ],
    promos: [
      { label: "Brand Sale: Up to 40% Off", color: "bg-gray-50 text-gray-700 border-gray-200" },
      { label: "Authenticity Guaranteed", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    ],
  },
};

const SIMPLE_LINKS = ["Home", "Sale"];
const ALL_NAV_LINKS = [
  { label: "Home", href: "/", hasMega: false },
  { label: "Shop", href: "/products", hasMega: true },
  { label: "New In", href: "/products?filter=new", hasMega: true },
  { label: "Sale", href: "/products?filter=sale", hasMega: false, accent: true },
  { label: "Brands", href: "/products?filter=brands", hasMega: true },
];

const SUGGESTIONS = [
  "Athletic socks", "Basketball", "Casual T-shirts", "Kitchen toaster",
  "Dinner plates", "Cooking set", "Sports shoes", "Running gear", "Sunglasses", "Designer bags",
];

// ─── Styles injected once ─────────────────────────────────────────────────────
const NAVBAR_STYLES = `
  .nb-pill {
    transition: background 0.38s ease, box-shadow 0.38s ease, border-color 0.38s ease, margin-top 0.38s ease;
  }
  .nb-icon-btn {
    display:flex;align-items:center;justify-content:center;
    width:38px;height:38px;border-radius:9999px;
    transition:background 0.18s,transform 0.14s;
    cursor:pointer;border:none;outline:none;position:relative;flex-shrink:0;
  }
  .nb-icon-btn:hover  { transform:scale(1.09); }
  .nb-icon-btn:active { transform:scale(0.94); }

  .nb-navlink {
    position:relative;font-size:0.8125rem;font-weight:600;letter-spacing:0.03em;
    padding:6px 12px;border-radius:9999px;white-space:nowrap;
    transition:color 0.2s,background 0.2s;cursor:pointer;border:none;outline:none;
    display:flex;align-items:center;gap:4px;
  }

  /* Cart hover panel */
  .nb-cart-panel {
    position:absolute;top:calc(100% + 14px);right:0;
    width:360px;max-height:480px;
    border-radius:24px;overflow:hidden;
    background:rgba(255,255,255,0.98);
    backdrop-filter:blur(24px);
    box-shadow:0 24px 80px rgba(0,0,0,0.18),0 4px 16px rgba(0,0,0,0.08);
    border:1px solid rgba(0,0,0,0.06);
  }

  /* Badge pop */
  @keyframes nb-pop { 0%{transform:scale(1)} 40%{transform:scale(1.6)} 70%{transform:scale(0.85)} 100%{transform:scale(1)} }
  .nb-pop { animation: nb-pop 0.45s cubic-bezier(0.36,0.07,0.19,0.97) }

  /* Mega menu link hover */
  .nb-mega-link {
    display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;
    font-size:0.8125rem;font-weight:500;color:#4b5563;
    transition:background 0.15s,color 0.15s,transform 0.15s;cursor:pointer;
    border:none;outline:none;width:100%;text-align:left;
  }
  .nb-mega-link:hover { background:#f5f3ff;color:#4f46e5;transform:translateX(3px); }

  /* Search input */
  .nb-search-input:focus { outline:none; }

  /* Scrollbar hide for cart panel */
  .nb-cart-scroll::-webkit-scrollbar { width:4px; }
  .nb-cart-scroll::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.12);border-radius:9999px; }
`;



export default function Navbar({ cart = [] }) {
  const { cartIconRef: externalCartIconRef } = useRegisterCartIcon()

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll state — two separate values to avoid coupling
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // UI state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // label of open mega menu
  const [cartBadgeKey, setCartBadgeKey] = useState(0);   // trigger badge animation
  const [wishlistTip, setWishlistTip] = useState(false);
  const [accountTip, setAccountTip] = useState(false);
  const [searchTip, setSearchTip] = useState(false);

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const prevCartCount = useRef(cartCount);
  const searchRef = useRef(null);
  const cartBtnRef = useRef(null);
  const cartHoverTimer = useRef(null);
  const megaTimer = useRef(null);
  const pillRef = useRef(null);

  // Stable scroll handler — NO hide-on-scroll-down (that was the bug)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setScrolled(y > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cart count change → badge pop
  useEffect(() => {
    if (cartCount !== prevCartCount.current) {
      setCartBadgeKey((k) => k + 1);
      prevCartCount.current = cartCount;
    }
  }, [cartCount]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [searchOpen]);

  // Close search when mobile opens, close mobile when search opens
  useEffect(() => {
    if (mobileOpen) {
      setSearchOpen(false);
      setActiveMenu(null);
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) setMobileOpen(false);
  }, [searchOpen]);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveMenu(null);
  }, [location.pathname]);

  // Expose cart icon ref for fly animation (parent can pass externalCartIconRef)
  const cartRef = externalCartIconRef || cartBtnRef;

  // Mega menu hover helpers (delayed open/close to prevent flicker)
  const openMega = (label) => {
    clearTimeout(megaTimer.current);
    if (MEGA_MENU[label]) setActiveMenu(label);
  };
  const closeMega = () => {
    megaTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };
  const keepMega = () => clearTimeout(megaTimer.current);

  // Cart panel hover helpers
  const openCart = () => { clearTimeout(cartHoverTimer.current); setCartHover(true); };
  const closeCart = () => { cartHoverTimer.current = setTimeout(() => setCartHover(false), 180); };
  const keepCart = () => clearTimeout(cartHoverTimer.current);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }, [searchQuery, navigate]);

  const suggestions = searchQuery
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : SUGGESTIONS.slice(0, 6);

  const isTop = !scrolled;

  // Pill style — morphs on scroll
  const pillStyle = isTop ? {
    background: "rgba(8,8,16,0.72)",
    boxShadow: "none",
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: "10px",
  } : {
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 8px 48px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
    borderColor: "rgba(0,0,0,0.07)",
    marginTop: "8px",
  };

  return (
    <>
      <style>{NAVBAR_STYLES}</style>

      {/* ════════════════════════════════════════════════
          FIXED WRAPPER — always visible, no y-animation
      ════════════════════════════════════════════════ */}
      <FixedWrapper
        mobileOpen={mobileOpen}
        pillRef={pillRef}
        pillStyle={pillStyle}
        navigate={navigate}
        isTop={isTop}
        ALL_NAV_LINKS={ALL_NAV_LINKS}
        MEGA_MENU={MEGA_MENU}
        openMega={openMega}
        closeMega={closeMega}
        setActiveMenu={setActiveMenu}
        activeMenu={activeMenu}
        keepMega={keepMega}
        searchTip={searchTip}
        searchOpen={searchOpen}
        setSearchTip={setSearchTip}
        setAccountTip={setAccountTip}
        setSearchOpen={setSearchOpen}
        setWishlistTip={setWishlistTip}
        wishlistTip={wishlistTip}
        openCart={openCart}
        closeCart={closeCart}
        accountTip={accountTip}
        cartRef={cartRef}
        cartCount={cartCount}
        cartBadgeKey={cartBadgeKey}
        cartHover={cartHover}
        setMobileOpen={setMobileOpen}
        keepCart={keepCart}
        BagIcon={BagIcon}
        ArrowRight={ArrowRight}
        setCartHover={setCartHover}
        ChevronDown={ChevronDown}
        SearchIcon={SearchIcon}
        HeartIcon={HeartIcon}
        UserIcon={UserIcon}
        CloseIcon={CloseIcon}
      />

      {/* ════════════════════════════════════════════════
          SEARCH PANEL
      ════════════════════════════════════════════════ */}
      <SearchPanel
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        navigate={navigate}
        SearchIcon={SearchIcon}
        CloseIcon={CloseIcon}
        ArrowRight={ArrowRight}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={suggestions}
        searchRef={searchRef}
        handleSearch={handleSearch}
      />

      {/* ════════════════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════════════ */}
      <MobileDrawer
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        ALL_NAV_LINKS={ALL_NAV_LINKS}
        location={location}
        navigate={navigate}
        CloseIcon={CloseIcon}
        UserIcon={UserIcon}
        HeartIcon={HeartIcon}
        BagIcon={BagIcon}
        ArrowRight={ArrowRight}
      />
    </>
  );
}












