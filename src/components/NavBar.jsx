// // src/components/Navbar.jsx
// import { useEffect, useRef, useState, useCallback } from "react";
// import { motion } from "framer-motion";
// import { useNavigate, useLocation } from "react-router-dom";
// import gsap from "gsap";
// import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import FixedWrapper from "./NavbarComponents/FixedWrapper";
// import SearchPanel from "./NavbarComponents/SearchPanel";
// import MobileDrawer from "./NavbarComponents/MobileDrawer";

// gsap.registerPlugin(ScrollToPlugin);

// // ─── SVG Icons ────────────────────────────────────────────────────────────────
// const BagIcon = ({ className = "w-6 h-6" }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
//     <line x1="3" y1="6" x2="21" y2="6" />
//     <path d="M16 10a4 4 0 01-8 0" />
//   </svg>
// );
// const SearchIcon = ({ className = "w-5 h-5" }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
//   </svg>
// );
// const CloseIcon = ({ className = "w-4 h-4" }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//     <path d="M18 6L6 18M6 6l12 12" />
//   </svg>
// );
// const HeartIcon = ({ className = "w-5 h-5" }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
//   </svg>
// );
// const UserIcon = ({ className = "w-5 h-5" }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
//   </svg>
// );
// const ChevronDown = ({ className = "w-3.5 h-3.5" }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M6 9l6 6 6-6" />
//   </svg>
// );
// const ArrowRight = ({ className = "w-4 h-4" }) => (
//   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M5 12h14M12 5l7 7-7 7" />
//   </svg>
// );

// // ─── Mega menu data ────────────────────────────────────────────────────────────
// const MEGA_MENU = {
//   Shop: {
//     featured: { title: "Summer Edit 2025", subtitle: "The season's must-haves", tag: "🔥 Trending", gradient: "from-orange-400 to-rose-500" },
//     columns: [
//       {
//         heading: "Women",
//         links: [
//           { label: "Dresses & Skirts", badge: null },
//           { label: "Tops & Blouses", badge: null },
//           { label: "Bags & Purses", badge: "New" },
//           { label: "Heels & Flats", badge: null },
//           { label: "Jewellery", badge: null },
//           { label: "Scarves", badge: "Hot" },
//         ],
//       },
//       {
//         heading: "Men",
//         links: [
//           { label: "Shirts & Polos", badge: null },
//           { label: "Trousers & Chinos", badge: null },
//           { label: "Sneakers", badge: "New" },
//           { label: "Watches", badge: null },
//           { label: "Belts & Wallets", badge: null },
//           { label: "Sunglasses", badge: null },
//         ],
//       },
//       {
//         heading: "Lifestyle",
//         links: [
//           { label: "Home Décor", badge: null },
//           { label: "Kitchen & Dining", badge: null },
//           { label: "Sports & Fitness", badge: "Sale" },
//           { label: "Tech Accessories", badge: null },
//           { label: "Gift Sets", badge: "🎁" },
//           { label: "Kids & Baby", badge: null },
//         ],
//       },
//     ],
//     promos: [
//       { label: "30% Off Bags", color: "bg-rose-50 text-rose-600 border-rose-100" },
//       { label: "Free Shipping $50+", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
//       { label: "New Member Gift", color: "bg-amber-50 text-amber-600 border-amber-100" },
//     ],
//   },
//   "New In": {
//     featured: { title: "Just Dropped", subtitle: "Fresh off the runway", tag: "✨ New", gradient: "from-violet-500 to-indigo-600" },
//     columns: [
//       {
//         heading: "This Week",
//         links: [
//           { label: "New Arrivals", badge: "68" },
//           { label: "Designer Picks", badge: null },
//           { label: "Trending Now", badge: null },
//           { label: "Staff Favourites", badge: null },
//         ],
//       },
//       {
//         heading: "Collections",
//         links: [
//           { label: "Summer 2025", badge: "New" },
//           { label: "Resort Collection", badge: null },
//           { label: "Workwear Edit", badge: null },
//           { label: "Weekend Casual", badge: null },
//         ],
//       },
//       {
//         heading: "By Category",
//         links: [
//           { label: "Footwear", badge: null },
//           { label: "Accessories", badge: null },
//           { label: "Fragrances", badge: "New" },
//           { label: "Beauty", badge: null },
//         ],
//       },
//     ],
//     promos: [
//       { label: "Early Access for Members", color: "bg-violet-50 text-violet-600 border-violet-100" },
//       { label: "See What's Trending", color: "bg-blue-50 text-blue-600 border-blue-100" },
//     ],
//   },
//   Brands: {
//     featured: { title: "Top Brands", subtitle: "Curated luxury labels", tag: "💎 Premium", gradient: "from-gray-700 to-gray-900" },
//     columns: [
//       {
//         heading: "Luxury",
//         links: [
//           { label: "Gucci", badge: null },
//           { label: "Prada", badge: null },
//           { label: "Versace", badge: null },
//           { label: "Dior", badge: null },
//         ],
//       },
//       {
//         heading: "Premium",
//         links: [
//           { label: "Zara Premium", badge: null },
//           { label: "H&M Studio", badge: null },
//           { label: "Balenciaga", badge: "Hot" },
//           { label: "Fendi", badge: null },
//         ],
//       },
//       {
//         heading: "Trending",
//         links: [
//           { label: "Off-White", badge: null },
//           { label: "Stone Island", badge: null },
//           { label: "Jacquemus", badge: "New" },
//           { label: "A-COLD-WALL*", badge: null },
//         ],
//       },
//     ],
//     promos: [
//       { label: "Brand Sale: Up to 40% Off", color: "bg-gray-50 text-gray-700 border-gray-200" },
//       { label: "Authenticity Guaranteed", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
//     ],
//   },
// };

// const SIMPLE_LINKS = ["Home", "Sale"];
// const ALL_NAV_LINKS = [
//   { label: "Home", href: "/", hasMega: false },
//   { label: "Shop", href: "/products", hasMega: true },
//   { label: "New In", href: "/products?filter=new", hasMega: true },
//   { label: "Sale", href: "/products?filter=sale", hasMega: false, accent: true },
//   { label: "Brands", href: "/products?filter=brands", hasMega: true },
// ];

// const SUGGESTIONS = [
//   "Athletic socks", "Basketball", "Casual T-shirts", "Kitchen toaster",
//   "Dinner plates", "Cooking set", "Sports shoes", "Running gear", "Sunglasses", "Designer bags",
// ];

// // ─── Styles injected once ─────────────────────────────────────────────────────
// const NAVBAR_STYLES = `
//   .nb-pill {
//     transition: background 0.38s ease, box-shadow 0.38s ease, border-color 0.38s ease, margin-top 0.38s ease;
//   }
//   .nb-icon-btn {
//     display:flex;align-items:center;justify-content:center;
//     width:38px;height:38px;border-radius:9999px;
//     transition:background 0.18s,transform 0.14s;
//     cursor:pointer;border:none;outline:none;position:relative;flex-shrink:0;
//   }
//   .nb-icon-btn:hover  { transform:scale(1.09); }
//   .nb-icon-btn:active { transform:scale(0.94); }

//   .nb-navlink {
//     position:relative;font-size:0.8125rem;font-weight:600;letter-spacing:0.03em;
//     padding:6px 12px;border-radius:9999px;white-space:nowrap;
//     transition:color 0.2s,background 0.2s;cursor:pointer;border:none;outline:none;
//     display:flex;align-items:center;gap:4px;
//   }

//   /* Cart hover panel */
//   .nb-cart-panel {
//     position:absolute;top:calc(100% + 14px);right:0;
//     width:360px;max-height:480px;
//     border-radius:24px;overflow:hidden;
//     background:rgba(255,255,255,0.98);
//     backdrop-filter:blur(24px);
//     box-shadow:0 24px 80px rgba(0,0,0,0.18),0 4px 16px rgba(0,0,0,0.08);
//     border:1px solid rgba(0,0,0,0.06);
//   }

//   /* Badge pop */
//   @keyframes nb-pop { 0%{transform:scale(1)} 40%{transform:scale(1.6)} 70%{transform:scale(0.85)} 100%{transform:scale(1)} }
//   .nb-pop { animation: nb-pop 0.45s cubic-bezier(0.36,0.07,0.19,0.97) }

//   /* Mega menu link hover */
//   .nb-mega-link {
//     display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;
//     font-size:0.8125rem;font-weight:500;color:#4b5563;
//     transition:background 0.15s,color 0.15s,transform 0.15s;cursor:pointer;
//     border:none;outline:none;width:100%;text-align:left;
//   }
//   .nb-mega-link:hover { background:#f5f3ff;color:#4f46e5;transform:translateX(3px); }

//   /* Search input */
//   .nb-search-input:focus { outline:none; }

//   /* Scrollbar hide for cart panel */
//   .nb-cart-scroll::-webkit-scrollbar { width:4px; }
//   .nb-cart-scroll::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.12);border-radius:9999px; }
// `;



// export default function Navbar({ cart = [] }) {

//   const navigate = useNavigate();
//   const location = useLocation();

//   // Scroll state — two separate values to avoid coupling
//   const [scrollY, setScrollY] = useState(0);
//   const [scrolled, setScrolled] = useState(false);

//   // UI state
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [cartHover, setCartHover] = useState(false);
//   const [activeMenu, setActiveMenu] = useState(null); // label of open mega menu
//   const [cartBadgeKey, setCartBadgeKey] = useState(0);   // trigger badge animation
//   const [wishlistTip, setWishlistTip] = useState(false);
//   const [accountTip, setAccountTip] = useState(false);
//   const [searchTip, setSearchTip] = useState(false);

//   const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
//   const prevCartCount = useRef(cartCount);
//   const searchRef = useRef(null);
//   const cartBtnRef = useRef(null);
//   const cartHoverTimer = useRef(null);
//   const megaTimer = useRef(null);
//   const pillRef = useRef(null);

//   // register Nav ref
//   useRegisterCartIcon(cartBtnRef)


//   // Expose cart icon ref for fly animation (parent can pass externalCartIconRef)
//   const cartRef = cartBtnRef;


//   // Stable scroll handler — NO hide-on-scroll-down (that was the bug)
//   useEffect(() => {
//     const onScroll = () => {
//       const y = window.scrollY;
//       setScrollY(y);
//       setScrolled(y > 50);
//     };
//     window.addEventListener("scroll", onScroll, { passive: true });
//     onScroll();
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   // Cart count change → badge pop
//   useEffect(() => {
//     if (cartCount !== prevCartCount.current) {
//       setCartBadgeKey((k) => k + 1);
//       prevCartCount.current = cartCount;
//     }
//   }, [cartCount]);

//   // Focus search input when opened
//   useEffect(() => {
//     if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60);
//   }, [searchOpen]);

//   // Close search when mobile opens, close mobile when search opens
//   useEffect(() => {
//     if (mobileOpen) {
//       setSearchOpen(false);
//       setActiveMenu(null);
//     }
//   }, [mobileOpen]);

//   useEffect(() => {
//     if (searchOpen) setMobileOpen(false);
//   }, [searchOpen]);

//   // Close everything on route change
//   useEffect(() => {
//     setMobileOpen(false);
//     setSearchOpen(false);
//     setActiveMenu(null);
//   }, [location.pathname]);


//   // Mega menu hover helpers (delayed open/close to prevent flicker)
//   const openMega = (label) => {
//     clearTimeout(megaTimer.current);
//     if (MEGA_MENU[label]) setActiveMenu(label);
//   };
//   const closeMega = () => {
//     megaTimer.current = setTimeout(() => setActiveMenu(null), 150);
//   };
//   const keepMega = () => clearTimeout(megaTimer.current);

//   // Cart panel hover helpers
//   const openCart = () => { clearTimeout(cartHoverTimer.current); setCartHover(true); };
//   const closeCart = () => { cartHoverTimer.current = setTimeout(() => setCartHover(false), 180); };
//   const keepCart = () => clearTimeout(cartHoverTimer.current);

//   const handleSearch = useCallback((e) => {
//     e?.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
//       setSearchOpen(false);
//       setSearchQuery("");
//     }
//   }, [searchQuery, navigate]);

//   const suggestions = searchQuery
//     ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
//     : SUGGESTIONS.slice(0, 6);

//   const isTop = !scrolled;

//   // Pill style — morphs on scroll
//   const pillStyle = isTop ? {
//     background: "rgba(8,8,16,0.72)",
//     boxShadow: "none",
//     borderColor: "rgba(255,255,255,0.1)",
//     marginTop: "10px",
//   } : {
//     background: "rgba(255,255,255,0.94)",
//     boxShadow: "0 8px 48px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)",
//     borderColor: "rgba(0,0,0,0.07)",
//     marginTop: "8px",
//   };

//   return (
//     <>
//       <style>{NAVBAR_STYLES}</style>

//       {/* ════════════════════════════════════════════════
//           FIXED WRAPPER — always visible, no y-animation
//       ════════════════════════════════════════════════ */}
//       <FixedWrapper
//         mobileOpen={mobileOpen}
//         pillRef={pillRef}
//         pillStyle={pillStyle}
//         navigate={navigate}
//         isTop={isTop}
//         ALL_NAV_LINKS={ALL_NAV_LINKS}
//         MEGA_MENU={MEGA_MENU}
//         openMega={openMega}
//         closeMega={closeMega}
//         setActiveMenu={setActiveMenu}
//         activeMenu={activeMenu}
//         keepMega={keepMega}
//         searchTip={searchTip}
//         searchOpen={searchOpen}
//         setSearchTip={setSearchTip}
//         setAccountTip={setAccountTip}
//         setSearchOpen={setSearchOpen}
//         setWishlistTip={setWishlistTip}
//         wishlistTip={wishlistTip}
//         openCart={openCart}
//         closeCart={closeCart}
//         accountTip={accountTip}
//         cartRef={cartRef}
//         cartCount={cartCount}
//         cartBadgeKey={cartBadgeKey}
//         cartHover={cartHover}
//         setMobileOpen={setMobileOpen}
//         keepCart={keepCart}
//         BagIcon={BagIcon}
//         ArrowRight={ArrowRight}
//         setCartHover={setCartHover}
//         ChevronDown={ChevronDown}
//         SearchIcon={SearchIcon}
//         HeartIcon={HeartIcon}
//         UserIcon={UserIcon}
//         CloseIcon={CloseIcon}
//       />

//       {/* ════════════════════════════════════════════════
//           SEARCH PANEL
//       ════════════════════════════════════════════════ */}
//       <SearchPanel
//         searchOpen={searchOpen}
//         setSearchOpen={setSearchOpen}
//         navigate={navigate}
//         SearchIcon={SearchIcon}
//         CloseIcon={CloseIcon}
//         ArrowRight={ArrowRight}
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         suggestions={suggestions}
//         searchRef={searchRef}
//         handleSearch={handleSearch}
//       />

//       {/* ════════════════════════════════════════════════
//           MOBILE DRAWER
//       ════════════════════════════════════════════════ */}
//       <MobileDrawer
//         mobileOpen={mobileOpen}
//         setMobileOpen={setMobileOpen}
//         ALL_NAV_LINKS={ALL_NAV_LINKS}
//         location={location}
//         navigate={navigate}
//         CloseIcon={CloseIcon}
//         UserIcon={UserIcon}
//         HeartIcon={HeartIcon}
//         BagIcon={BagIcon}
//         ArrowRight={ArrowRight}
//       />
//     </>
//   );
// }
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//                                            OLD CODE

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++









// src/components/Navbar.jsx
import  { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRegisterCartIcon } from "../Context/cart/CartAnimationContext";
import { getData } from "../api/apiClients";
import { formatMoneyCents } from "../Utils/formatMoneyCents";
import { useCartState } from "../Context/cart/CartContext";
import { mockedCart } from "../Data/mockedCart";

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
const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
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

// ─── Static popular searches (shown when search field is empty) ──────────────
const POPULAR_SEARCHES = [
  "Athletic socks", "Basketball", "Casual T-shirts", "Kitchen toaster",
  "Dinner plates", "Cooking set", "Sports shoes", "Running gear", "Sunglasses", "Designer bags",
];

// ─── Static category shortcuts ───────────────────────────────────────────────
const SEARCH_CATEGORIES = [
  { label: "Bags", emoji: "👜", query: "bags" },
  { label: "Watches", emoji: "⌚", query: "watches" },
  { label: "Shoes", emoji: "👠", query: "shoes" },
  { label: "Tech", emoji: "📱", query: "tech" },
  { label: "Sports", emoji: "🏀", query: "sports" },
  { label: "Perfumes", emoji: "🧴", query: "perfumes" },
  { label: "Sunglasses", emoji: "🕶️", query: "sunglasses" },
  { label: "Scarves", emoji: "🧣", query: "scarves" },
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

// ─── Cart Preview Panel ───────────────────────────────────────────────────────
function CartPreview({ cart, onRemove, onNavigate, formatMoney }) {
  const totalPrice = cart.reduce((a, i) => a + i.priceCents * i.quantity, 0);

  return (
    <div className="nb-cart-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BagIcon className="w-5 h-5 text-indigo-600" />
          <span className="font-black text-gray-900 text-sm">Your Bag</span>
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full">
            {cart.reduce((a, i) => a + i.quantity, 0)} items
          </span>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate("/cart")}
          className="text-indigo-600 text-xs font-bold hover:text-indigo-800 transition-colors flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Items */}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BagIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-bold text-gray-400 text-sm">Your bag is empty</p>
          <p className="text-gray-300 text-xs mt-1">Add some items to get started</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("/products")}
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md">
            Start Shopping →
          </motion.button>
        </div>
      ) : (
        <>
          <div className="nb-cart-scroll overflow-y-auto max-h-[260px] px-4 py-3 space-y-3">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex gap-3 items-start group">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-xs leading-tight line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Qty: {item.quantity}</p>
                    <p className="font-black text-indigo-600 text-sm mt-0.5">{formatMoney(item.priceCents * item.quantity)}</p>
                  </div>
                  {/* Remove */}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => onRemove(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrashIcon className="w-3 h-3 text-red-400" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-500 text-xs font-medium">Subtotal</span>
              <span className="font-black text-gray-900 text-base">{formatMoney(totalPrice)}</span>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("/checkout")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 rounded-2xl text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
              Checkout  <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="text-center text-[10px] text-gray-400 mt-2">🔒 Secure checkout · Free returns</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Mega Menu Panel ──────────────────────────────────────────────────────────
// MegaMenu uses fixed positioning relative to its trigger button rect,
// so it can never be clipped by the pill's overflow or stacking context.
function MegaMenu({ data, triggerRect, onNavigate, onMouseEnter, onMouseLeave }) {
  const PANEL_WIDTH = 660;
  const GAP = 12;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;

  // Centre the panel under the trigger, then clamp to viewport
  let left = triggerRect
    ? triggerRect.left + triggerRect.width / 2 - PANEL_WIDTH / 2
    : vw / 2 - PANEL_WIDTH / 2;

  const maxLeft = vw - PANEL_WIDTH - GAP;
  left = Math.max(GAP, Math.min(left, maxLeft));

  const top = triggerRect ? triggerRect.bottom + 10 : 70;

  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        top,
        left,
        width: Math.min(PANEL_WIDTH, vw - GAP * 2),
        background: "rgba(255,255,255,0.99)",
        backdropFilter: "blur(32px)",
        zIndex: 200,
      }}
      className="rounded-3xl overflow-hidden shadow-2xl shadow-black/15 border border-gray-100/80"
    >
      <div className="grid grid-cols-4 gap-0">
        {/* Featured card */}
        <div className={`relative bg-gradient-to-br ${data.featured.gradient} p-6 flex flex-col justify-between min-h-[280px]`}>
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{data.featured.tag}</span>
            <h3 className="text-white font-black text-xl leading-tight mt-2">{data.featured.title}</h3>
            <p className="text-white/70 text-xs mt-1">{data.featured.subtitle}</p>
          </div>
          <motion.button whileHover={{ x: 4 }} onClick={() => onNavigate("/products")}
            className="relative z-10 flex items-center gap-1.5 text-white font-bold text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-2 rounded-full w-fit mt-4">
            Explore <ArrowRight className="w-3 h-3" />
          </motion.button>
        </div>

        {/* Link columns */}
        <div className="col-span-3 grid grid-cols-3 gap-0 divide-x divide-gray-100">
          {data.columns.map((col) => (
            <div key={col.heading} className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{col.heading}</p>
              <div className="space-y-0.5">
                {col.links.map((link) => (
                  <button key={link.label} onClick={() => onNavigate("/products")} className="nb-mega-link">
                    <span className="flex-1 text-left">{link.label}</span>
                    {link.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${link.badge === "New" ? "bg-blue-100 text-blue-600"
                          : link.badge === "Hot" ? "bg-orange-100 text-orange-600"
                            : link.badge === "Sale" ? "bg-red-100 text-red-600"
                              : typeof link.badge === "number" || /^\d+$/.test(link.badge) ? "bg-gray-100 text-gray-500"
                                : "bg-yellow-100 text-yellow-600"
                        }`}>
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo strip */}
      {data.promos?.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-3 bg-gray-50/60 flex-wrap">
          {data.promos.map((p) => (
            <span key={p.label} className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${p.color}`}>{p.label}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function Navbar({ onRemoveFromCart, cartIconRef: externalCartIconRef }) {

  //+++++++++++++++++++++++++++++++++++++++++++++++
  //        FAKE CART
  const cart = mockedCart
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll state — two separate values to avoid coupling
  const [scrollY, setScrollY] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // UI state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);   // live API results
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);   // in-session history
  const [focusedIdx, setFocusedIdx] = useState(-1);   // keyboard nav index
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // label of open mega menu
  const [megaTriggerRect, setMegaTriggerRect] = useState(null); // bounding rect of the hovered trigger
  const [cartBadgeKey, setCartBadgeKey] = useState(0);   // trigger badge animation
  const [wishlistTip, setWishlistTip] = useState(false);
  const [accountTip, setAccountTip] = useState(false);
  const [searchTip, setSearchTip] = useState(false);

  // Read cart count from context (authoritative) with prop as fallback.
  // This ensures the badge updates even when the parent forgets to pass cart.
  const { cart: ctxCart, cartCount: ctxCartCount } = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useCartState();
    } catch {
      return { cart: null, cartCount: null };
    }
  })();
  const cartCount = ctxCartCount ?? (ctxCart ?? cart).reduce((a, i) => a + (i.quantity || 0), 0);
  const prevCartCount = useRef(cartCount);
  const searchRef = useRef(null);
  const cartBtnRef = useRef(null);
  const cartHoverTimer = useRef(null);
  const megaTimer = useRef(null);
  const pillRef = useRef(null);
  const searchDebounce = useRef(null);   // debounce timer for live search
  const searchResultsRef = useRef(null);  // scrollable results container

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

  // Close mobile menu when search opens
  useEffect(() => {
    if (searchOpen) {
      setMobileOpen(false);
      setActiveMenu(null);
    }
  }, [searchOpen]);

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

  // Register the cart icon globally so any page's fly-to-cart animation
  // can locate this element without prop-drilling.
  useRegisterCartIcon(cartRef);

  // Mega menu hover helpers (delayed open/close to prevent flicker)
  const openMega = (label, e) => {
    clearTimeout(megaTimer.current);
    if (MEGA_MENU[label]) {
      setActiveMenu(label);
      // Capture the trigger button's rect for precise panel positioning
      const btn = e?.currentTarget?.querySelector("button") || e?.currentTarget;
      if (btn) setMegaTriggerRect(btn.getBoundingClientRect());
    }
  };
  const closeMega = () => {
    megaTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };
  const keepMega = () => clearTimeout(megaTimer.current);

  // Cart panel hover helpers
  const openCart = () => { clearTimeout(cartHoverTimer.current); setCartHover(true); };
  const closeCart = () => { cartHoverTimer.current = setTimeout(() => setCartHover(false), 180); };
  const keepCart = () => clearTimeout(cartHoverTimer.current);

  // ── Live search: debounce 320ms then hit API ──────────────────────────────
  useEffect(() => {
    clearTimeout(searchDebounce.current);
    const q = searchQuery.trim();

    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(false);
      setFocusedIdx(-1);
      return;
    }

    setSearchLoading(true);
    setSearchError(false);

    searchDebounce.current = setTimeout(async () => {
      try {
        const data = await getData(`/products?search=${encodeURIComponent(q)}&limit=8`);
        // Normalise: API may return array directly or { products: [] } or { data: [] }
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.products) ? data.products
            : Array.isArray(data?.data) ? data.data
              : [];
        setSearchResults(items.slice(0, 8));
        setSearchError(false);
      } catch {
        setSearchResults([]);
        setSearchError(true);
      } finally {
        setSearchLoading(false);
        setFocusedIdx(-1);
      }
    }, 320);

    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery]);

  // ── Reset results when panel closes ────────────────────────────────────────
  useEffect(() => {
    if (!searchOpen) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(false);
      setFocusedIdx(-1);
      setSearchQuery("");
    }
  }, [searchOpen]);

  // ── Commit a search: navigate + record in recent searches ──────────────────
  const commitSearch = useCallback((query) => {
    const q = query?.trim();
    if (!q) return;
    setRecentSearches((prev) => [q, ...prev.filter((s) => s !== q)].slice(0, 8));
    navigate(`/products?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  }, [navigate]);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    commitSearch(searchQuery);
  }, [searchQuery, commitSearch]);

  // ── Keyboard navigation inside search results ──────────────────────────────
  const handleSearchKeyDown = useCallback((e) => {
    const total = searchResults.length + POPULAR_SEARCHES.slice(0, 6).length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && focusedIdx >= 0 && searchResults[focusedIdx]) {
      e.preventDefault();
      const product = searchResults[focusedIdx];
      navigate(`/products/${product.id}`);
      setSearchOpen(false);
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  }, [searchResults, focusedIdx, navigate]);

  // ── Remove a recent search ────────────────────────────────────────────────
  const removeRecentSearch = useCallback((term) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  }, []);

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
      <motion.div
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 md:px-6 pointer-events-none"
        animate={
          mobileOpen
            ? { opacity: 0, y: -16, scale: 0.97, pointerEvents: "none" }
            : { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }
        }
        transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      >

        {/* Pill */}
        <div
          ref={pillRef}
          className="nb-pill pointer-events-auto w-full max-w-[1100px] rounded-full border flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 relative"
          style={pillStyle}
        >
          {/* ── LOGO ── */}
          <button onClick={() => navigate("/")}
            className="flex items-center gap-2 flex-shrink-0 mr-1 group">
            {/* Logomark */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className={`absolute inset-0 rounded-full transition-all duration-400 ${isTop ? "bg-gradient-to-br from-blue-400 to-violet-500" : "bg-gradient-to-br from-blue-600 to-indigo-600"}`} />
              <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-400 ${isTop ? "bg-gradient-to-br from-blue-400 to-violet-500" : "bg-gradient-to-br from-blue-600 to-indigo-600"}`} />
              </div>
            </div>
            <span className="font-black text-[1.05rem] tracking-tight leading-none hidden sm:block transition-colors duration-300"
              style={{ fontFamily: "'Georgia','Palatino Linotype',serif", color: isTop ? "#fff" : "#111827" }}>
              Shop<span style={{ color: isTop ? "#a5b4fc" : "#4f46e5" }}>Ease</span>
            </span>
          </button>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center relative">
            {ALL_NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href.split("?")[0]));
              const hasMega = link.hasMega && MEGA_MENU[link.label];
              return (
                <div key={link.label}
                  className="relative"
                  onMouseEnter={(e) => hasMega ? openMega(link.label, e) : null}
                  onMouseLeave={() => hasMega ? closeMega() : null}
                >
                  <button
                    onClick={() => { navigate(link.href); setActiveMenu(null); }}
                    className={`nb-navlink transition-all duration-200 ${isTop
                        ? `text-white/80 hover:text-white ${isActive ? "bg-white/12 text-white" : "hover:bg-white/10"}`
                        : `text-gray-600 hover:text-gray-900 ${isActive ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100/80"}`
                      } ${link.accent ? (isTop ? "!text-orange-300 font-black" : "!text-orange-500 font-black") : ""}`}
                  >
                    {link.accent && <span className="text-xs">🔥</span>}
                    {link.label}
                    {hasMega && (
                      <motion.span animate={{ rotate: activeMenu === link.label ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className={`w-3 h-3 transition-colors ${isTop ? "text-white/50" : "text-gray-400"}`} />
                      </motion.span>
                    )}
                  </button>

                  {/* Mega menu — rendered into portal-like fixed layer */}
                  <AnimatePresence>
                    {activeMenu === link.label && (
                      <MegaMenu
                        data={MEGA_MENU[link.label]}
                        triggerRect={megaTriggerRect}
                        onNavigate={(href) => { navigate(href); setActiveMenu(null); }}
                        onMouseEnter={keepMega}
                        onMouseLeave={closeMega}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-1 ml-auto flex-shrink-0">

            {/* Search */}
            <div className="relative"
              onMouseEnter={() => setSearchTip(true)}
              onMouseLeave={() => setSearchTip(false)}>
              <button
                onClick={() => setSearchOpen((o) => !o)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                className={`nb-icon-btn transition-all duration-200 ${isTop ? "text-white/80 hover:text-white hover:bg-white/12" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  } ${searchOpen ? (isTop ? "bg-white/15 text-white" : "bg-indigo-50 !text-indigo-600") : ""}`}>
                <AnimatePresence mode="wait">
                  {searchOpen
                    ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><CloseIcon /></motion.span>
                    : <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><SearchIcon /></motion.span>
                  }
                </AnimatePresence>
              </button>
              <AnimatePresence>
                {searchTip && !searchOpen && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50">
                    Search
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search tooltip — mobile hint */}
            <div className="relative md:hidden"
              onMouseEnter={() => setSearchTip(true)}
              onMouseLeave={() => setSearchTip(false)}>
              <AnimatePresence>
                {searchTip && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg">
                    Search
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist — desktop */}
            <div className="relative hidden md:block"
              onMouseEnter={() => setWishlistTip(true)}
              onMouseLeave={() => setWishlistTip(false)}>
              <button
                onClick={() => navigate("/wishlist")}
                className={`nb-icon-btn transition-all duration-200 ${isTop ? "text-white/80 hover:text-white hover:bg-white/12" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                aria-label="Wishlist">
                <HeartIcon />
              </button>
              <AnimatePresence>
                {wishlistTip && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50">
                    Wishlist
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account — desktop */}
            <div className="relative hidden md:block"
              onMouseEnter={() => setAccountTip(true)}
              onMouseLeave={() => setAccountTip(false)}>
              <button
                onClick={() => navigate("/account")}
                className={`nb-icon-btn transition-all duration-200 ${isTop ? "text-white/80 hover:text-white hover:bg-white/12" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                aria-label="My Account">
                <UserIcon />
              </button>
              <AnimatePresence>
                {accountTip && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50">
                    My Account
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className={`hidden md:block w-px h-5 mx-1 transition-colors duration-300 ${isTop ? "bg-white/15" : "bg-gray-200"}`} />

            {/* Cart bag — with hover preview */}
            <div className="relative" onMouseEnter={openCart} onMouseLeave={closeCart}>
              <button
                ref={cartRef}
                title={cartCount > 0 ? `Shopping bag · ${cartCount} item${cartCount !== 1 ? "s" : ""}` : "Shopping bag · Empty"}
                className={`nb-icon-btn transition-all duration-200 ${isTop ? "text-white hover:bg-white/12" : "text-gray-700 hover:bg-gray-100"
                  }`}
                aria-label={`Shopping bag, ${cartCount} items`}
              >
                <BagIcon className="w-[22px] h-[22px]" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartBadgeKey}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`nb-pop absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow ${isTop ? "bg-indigo-400" : "bg-indigo-600"}`}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Cart hover panel — desktop only */}
              <div className="hidden md:block">
                <AnimatePresence>
                  {cartHover && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                      onMouseEnter={keepCart}
                      onMouseLeave={closeCart}
                    >
                      <CartPreview
                        cart={cart}
                        onRemove={onRemoveFromCart || (() => { })}
                        onNavigate={(href) => { navigate(href); setCartHover(false); }}
                        formatMoney={formatMoneyCents}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA button — desktop */}
            <button
              onClick={() => navigate("/products")}
              className="hidden lg:flex items-center gap-1.5 font-bold text-[0.8125rem] px-4 py-2 rounded-full transition-all duration-300 ml-1"
              style={
                isTop
                  ? { background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }
                  : { background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.32)" }
              }
            >
              Shop Now
            </button>

            {/* Hamburger — mobile & tablet only (hidden on lg+) */}
            <button
              onClick={() => { setMobileOpen((o) => !o); setSearchOpen(false); setActiveMenu(null); }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              title={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className={`nb-icon-btn lg:hidden transition-all duration-200 ${isTop ? "text-white hover:bg-white/12" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <AnimatePresence mode="wait">
                {mobileOpen
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><CloseIcon className="w-5 h-5" /></motion.span>
                  : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="16" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════
          SEARCH PANEL — live API, keyboard nav, recent history
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-[98] bg-black/40"
              style={{ backdropFilter: "blur(6px)" }}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
              className="fixed z-[99] left-0 right-0 flex justify-center px-3 sm:px-4"
              style={{ top: 76 }}
            >
              <div
                className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl shadow-black/25 border border-gray-100/80"
                style={{ background: "rgba(255,255,255,0.99)", backdropFilter: "blur(40px)", maxHeight: "calc(100vh - 100px)" }}
              >

                {/* ── Input row ── */}
                <form onSubmit={handleSearch} className="flex items-center px-4 sm:px-5 py-4 gap-3 border-b border-gray-100">
                  {/* Icon: spinner while loading, magnifier otherwise */}
                  <div className="flex-shrink-0 w-5 h-5">
                    {searchLoading
                      ? <svg className="w-5 h-5 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      : <SearchIcon className="w-5 h-5 text-gray-400" />
                    }
                  </div>

                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setFocusedIdx(-1); }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search products, brands, categories…"
                    className="nb-search-input flex-1 text-gray-900 text-[15px] placeholder-gray-400 bg-transparent font-medium min-w-0"
                    autoComplete="off"
                    spellCheck="false"
                  />

                  {/* Clear button */}
                  {searchQuery && (
                    <button type="button" onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0">
                      <CloseIcon className="w-3 h-3 text-gray-500" />
                    </button>
                  )}

                  {/* Submit */}
                  <motion.button type="submit" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm px-4 sm:px-5 py-2.5 rounded-2xl shadow-md shadow-indigo-500/25 transition-all">
                    Search
                  </motion.button>
                </form>

                {/* ── Body (scrollable) ── */}
                <div ref={searchResultsRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 190px)" }}>

                  {/* ── STATE: has query → show live results ── */}
                  {searchQuery.trim() && (
                    <div className="px-4 sm:px-5 py-4">
                      <AnimatePresence mode="wait">

                        {/* Loading skeletons */}
                        {searchLoading && (
                          <motion.div key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="space-y-2">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                                <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-14" />
                              </div>
                            ))}
                          </motion.div>
                        )}

                        {/* Error */}
                        {!searchLoading && searchError && (
                          <motion.div key="error"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center py-8 text-center">
                            <div className="text-4xl mb-3">⚠️</div>
                            <p className="font-bold text-gray-700 text-sm">Search unavailable</p>
                            <p className="text-gray-400 text-xs mt-1">Check your connection and try again.</p>
                            <button onClick={() => setSearchQuery(searchQuery + " ")}
                              className="mt-4 text-indigo-600 text-xs font-bold hover:underline">Retry</button>
                          </motion.div>
                        )}

                        {/* No results */}
                        {!searchLoading && !searchError && searchQuery.trim() && searchResults.length === 0 && (
                          <motion.div key="empty"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center py-8 text-center">
                            <div className="text-5xl mb-3">🔍</div>
                            <p className="font-black text-gray-800 text-base">No results for <span className="text-indigo-600">"{searchQuery}"</span></p>
                            <p className="text-gray-400 text-xs mt-1 max-w-xs">Try a shorter keyword, check spelling, or browse a category below.</p>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                              {POPULAR_SEARCHES.slice(0, 4).map((s) => (
                                <button key={s} onClick={() => setSearchQuery(s)}
                                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                  {s}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        {/* Results list */}
                        {!searchLoading && !searchError && searchResults.length > 0 && (
                          <motion.div key="results"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                              </p>
                              <button onClick={() => commitSearch(searchQuery)}
                                className="text-[10px] text-indigo-500 font-bold hover:text-indigo-700 transition-colors">
                                See all →
                              </button>
                            </div>
                            <div className="space-y-1">
                              {searchResults.map((product, i) => (
                                <motion.button
                                  key={product.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.035 }}
                                  onClick={() => { navigate(`/products/${product.id}`); setSearchOpen(false); }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 group text-left ${focusedIdx === i
                                      ? "bg-indigo-50 ring-2 ring-inset ring-indigo-200"
                                      : "hover:bg-gray-50"
                                    }`}
                                >
                                  {/* Product thumbnail */}
                                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                    {product.image
                                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                                    }
                                  </div>

                                  {/* Name + keywords */}
                                  <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                                      {product.name}
                                    </p>
                                    {product.keywords?.length > 0 && (
                                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                                        {product.keywords.slice(0, 3).join(" · ")}
                                      </p>
                                    )}
                                  </div>

                                  {/* Price */}
                                  <p className="font-black text-gray-900 text-sm flex-shrink-0">
                                    {formatMoneyCents(product.priceCents)}
                                  </p>

                                  {/* Arrow */}
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100" />
                                </motion.button>
                              ))}
                            </div>

                            {/* View all results CTA */}
                            <motion.button
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              onClick={() => commitSearch(searchQuery)}
                              className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md shadow-indigo-500/20">
                              View all results for "{searchQuery}"
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        )}

                      </AnimatePresence>
                    </div>
                  )}

                  {/* ── STATE: no query → show recent + popular + categories ── */}
                  {!searchQuery.trim() && (
                    <div className="px-4 sm:px-5 py-4 space-y-5">

                      {/* Recent searches */}
                      {recentSearches.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recent</p>
                            <button onClick={() => setRecentSearches([])}
                              className="text-[10px] text-gray-400 hover:text-red-500 font-bold transition-colors">
                              Clear all
                            </button>
                          </div>
                          <div className="space-y-0.5">
                            {recentSearches.slice(0, 5).map((term) => (
                              <div key={term} className="flex items-center gap-2 group">
                                <motion.button
                                  whileHover={{ x: 2 }}
                                  onClick={() => setSearchQuery(term)}
                                  className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-left">
                                  <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </span>
                                  <span className="text-sm text-gray-700 font-medium">{term}</span>
                                </motion.button>
                                <button onClick={() => removeRecentSearch(term)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all text-gray-400">
                                  <CloseIcon className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Popular searches */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">
                          {recentSearches.length > 0 ? "Trending" : "Popular Searches"}
                        </p>
                        <div className="space-y-0.5">
                          {POPULAR_SEARCHES.slice(0, recentSearches.length > 0 ? 4 : 6).map((s, i) => (
                            <motion.button key={s}
                              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              onClick={() => setSearchQuery(s)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-all duration-150 group text-left">
                              <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
                                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                                </svg>
                              </span>
                              <span className="text-sm text-gray-700 group-hover:text-indigo-700 font-medium flex-1">{s}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Category shortcuts */}
                      <div className="pb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Browse Categories</p>
                        <div className="grid grid-cols-4 gap-2">
                          {SEARCH_CATEGORIES.map((cat) => (
                            <motion.button key={cat.label}
                              whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
                              onClick={() => { navigate(`/products?search=${cat.query}`); setSearchOpen(false); }}
                              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border border-gray-100 transition-all group">
                              <span className="text-xl">{cat.emoji}</span>
                              <span className="text-[10px] font-bold text-gray-600 group-hover:text-indigo-700 transition-colors">{cat.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[97] bg-black/45 lg:hidden" style={{ backdropFilter: "blur(4px)" }} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-[98] lg:hidden flex flex-col"
              style={{ width: "min(360px, 88vw)", background: "rgba(255,255,255,0.99)", backdropFilter: "blur(32px)", boxShadow: "-8px 0 60px rgba(0,0,0,0.2)" }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                  <span className="font-black text-gray-900 text-base" style={{ fontFamily: "'Georgia','Palatino Linotype',serif" }}>
                    Shop<span className="text-indigo-600">Ease</span>
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                  <CloseIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Main links */}
                <div className="px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Menu</p>
                  {ALL_NAV_LINKS.map((link, i) => {
                    const isActive = location.pathname === link.href;
                    return (
                      <motion.button key={link.label}
                        initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => { navigate(link.href); setMobileOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left font-semibold text-sm transition-all duration-180 mb-1 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                          } ${link.accent ? "!text-orange-500 font-black" : ""}`}
                      >
                        <span>{link.accent && "🔥 "}{link.label}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Mega content — compact mobile version */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-3">Shop by Category</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Women's", emoji: "👗", color: "from-rose-400 to-pink-500" },
                      { label: "Men's", emoji: "👔", color: "from-sky-400 to-blue-500" },
                      { label: "Bags", emoji: "👜", color: "from-amber-400 to-orange-500" },
                      { label: "Watches", emoji: "⌚", color: "from-emerald-400 to-teal-500" },
                      { label: "Shoes", emoji: "👠", color: "from-violet-400 to-purple-500" },
                      { label: "Beauty", emoji: "🧴", color: "from-pink-400 to-rose-500" },
                    ].map((cat, i) => (
                      <motion.button key={cat.label}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                        onClick={() => { navigate("/products"); setMobileOpen(false); }}
                        className={`bg-gradient-to-br ${cat.color} text-white p-4 rounded-2xl text-left flex flex-col gap-1`}
                      >
                        <span className="text-2xl">{cat.emoji}</span>
                        <span className="font-bold text-sm">{cat.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Special offers */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-3">Offers</p>
                  <div className="space-y-2">
                    {[
                      { label: "🔥 Flash Sale", desc: "Up to 70% off today only", color: "bg-orange-50 border-orange-100", textColor: "text-orange-600" },
                      { label: "✨ New Arrivals", desc: "68 new items this week", color: "bg-indigo-50 border-indigo-100", textColor: "text-indigo-600" },
                      { label: "🎁 Gift Sets", desc: "Perfect presents from $29", color: "bg-rose-50 border-rose-100", textColor: "text-rose-600" },
                    ].map((offer, i) => (
                      <motion.button key={offer.label}
                        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                        onClick={() => { navigate("/products"); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all hover:scale-[1.01] ${offer.color}`}
                      >
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${offer.textColor}`}>{offer.label}</p>
                          <p className="text-gray-500 text-xs">{offer.desc}</p>
                        </div>
                        <ArrowRight className={`w-4 h-4 ${offer.textColor} opacity-60`} />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Account links */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Account</p>
                  {[
                    { icon: <UserIcon className="w-4 h-4" />, label: "My Account" },
                    { icon: <HeartIcon className="w-4 h-4" />, label: "Wishlist" },
                    { icon: <BagIcon className="w-4 h-4" />, label: "My Orders" },
                  ].map((item, i) => (
                    <motion.button key={item.label}
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 + i * 0.05 }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all mb-1 text-sm font-semibold text-left"
                    >
                      <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">{item.icon}</span>
                      {item.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="px-4 py-5 border-t border-gray-100 bg-gray-50/50">
                <button onClick={() => { navigate("/products"); setMobileOpen(false); }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-sm shadow-lg shadow-indigo-500/30">
                  Shop All Products →
                </button>
                <p className="text-center text-gray-400 text-[11px] mt-2.5">🚀 Free shipping on orders over $50</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
