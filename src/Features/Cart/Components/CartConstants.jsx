// src/Features/Cart/Components/CartConstants.jsx
import { motion } from "framer-motion";

export const CT_STYLES = `
  /* Clip-path wipe: left → right */
  @keyframes ct-clip-wipe{
    from{clip-path:inset(0 100% 0 0)}
    to  {clip-path:inset(0 0%   0 0)}
  }
  .ct-clip-wipe{clip-path:inset(0 100% 0 0);animation:ct-clip-wipe .55s cubic-bezier(.4,0,.2,1) forwards}

  /* Digit-flip (mechanical counter) */
  @keyframes ct-flip-up  {from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes ct-flip-down{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
  .ct-flip-up  {animation:ct-flip-up   .22s ease-out forwards}
  .ct-flip-down{animation:ct-flip-down .22s ease-out forwards}

  /* Savings shimmer (gold) */
  @keyframes ct-shimmer-gold{
    0%{background-position:-200% center}
    100%{background-position:200% center}
  }
  .ct-shimmer-gold{
    background:linear-gradient(90deg,#d97706 0%,#fbbf24 30%,#f59e0b 60%,#fcd34d 90%);
    background-size:200% auto;
    -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
    animation:ct-shimmer-gold 2.8s linear infinite;
  }

  /* Total breathe */
  @keyframes ct-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.018)}}
  .ct-breathe{animation:ct-breathe 3.5s ease-in-out infinite}

  /* Savings ticker tape */
  @keyframes ct-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .ct-ticker{animation:ct-ticker 22s linear infinite}
  .ct-ticker:hover{animation-play-state:paused}

  /* Bubble pop */
  @keyframes ct-pop{0%{transform:scale(1)}40%{transform:scale(1.55)}70%{transform:scale(.88)}100%{transform:scale(1)}}
  .ct-pop{animation:ct-pop .38s cubic-bezier(.36,.07,.19,.97)}

  /* Mobile sticky bar rise */
  @keyframes ct-sticky-rise{from{transform:translateY(100%)}to{transform:translateY(0)}}
  .ct-sticky-rise{animation:ct-sticky-rise .32s cubic-bezier(.32,.72,0,1) forwards}

  /* Spinner */
  @keyframes ct-spin{to{transform:rotate(360deg)}}
  .ct-spin{animation:ct-spin .7s linear infinite}

  /* Input focus glow */
  .ct-input:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
  .dark .ct-input:focus{border-color:#818cf8;box-shadow:0 0 0 3px rgba(129,140,248,.15)}

  /* Row highlight flash */
  @keyframes ct-highlight{
    0%  {background:rgba(99,102,241,.12)}
    100%{background:transparent}
  }
  .ct-highlight{animation:ct-highlight .6s ease-out forwards}
  .dark .ct-highlight{animation:ct-highlight-dark .6s ease-out forwards}
  @keyframes ct-highlight-dark{
    0%  {background:rgba(129,140,248,.15)}
    100%{background:transparent}
  }

  /* No scrollbar */
  .ct-no-scroll::-webkit-scrollbar{display:none}
  .ct-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
`;

export const PROMOS = {
  SAVE10: { type: "percent", value: 10, label: "10% off everything" },
  WELCOME20: { type: "percent", value: 20, label: "20% off — welcome gift" },
  FREESHIP: { type: "shipping", value: 0, label: "Free shipping" },
  FLAT5: { type: "fixed", value: 500, label: "$5 off" },
};

export const SHIPPING_COST = 499;   // cents ($4.99)
export const FREE_SHIP_THRESHOLD = 5000;  // cents ($50)
export const UNDO_DURATION = 5000;

export const Ic = {
  Trash: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
  Heart: ({ c = "w-4 h-4", filled = false }) => <svg className={c} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  Bag: ({ c = "w-5 h-5" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>,
  Tag: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  Truck: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  Lock: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Check: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>,
  Close: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  Undo: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" /></svg>,
  Star: ({ c = "w-4 h-4" }) => <svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  Chev: ({ dir = "right", c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{dir === "right" ? <path d="M9 18l6-6-6-6" /> : dir === "down" ? <path d="M6 9l6 6 6-6" /> : <path d="M15 18l-6-6 6-6" />}</svg>,
  Gift: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" /></svg>,
  Notes: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  Arrow: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
  Sparkles: ({ c = "w-4 h-4" }) => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" /><path d="M5 3l.618 1.854a1 1 0 00.528.528L8 6l-1.854.618a1 1 0 00-.528.528L5 9l-.618-1.854a1 1 0 00-.528-.528L2 6l1.854-.618a1 1 0 00.528-.528L5 3z" /></svg>,
};

export const Spinner = ({ c = "w-4 h-4" }) => (
  <svg className={`${c} ct-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);
