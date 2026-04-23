// ModernFooter.jsx — Woosho · Premium Footer
// Editorial luxury · GSAP ScrollTrigger · Retained blue-600 brand palette
// Light + Dark mode · Senior UI/UX quality

import { memo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ArrowUpRight, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ── Social SVGs ────────────────────────────────────────────────────────────────
const Socials = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4.5"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.77 1.52V7.01a4.85 4.85 0 0 1-1-.32z"/>
      </svg>
    ),
  },
];

// ── Link columns ──────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Shop: [
    { label: "Browse All",   to: "/products"              },
    { label: "New Arrivals", to: "/products/New Arrivals" },
    { label: "Hot Deals",    to: "/Hot Deals"             },
    { label: "Trending Now", to: "/Trending Now"          },
  ],
  Sellers: [
    { label: "Become a Seller", to: "/seller"          },
    { label: "Analytics",       to: "/analytics"       },
    { label: "Seller Support",  to: "/support/#seller" },
  ],
  Categories: [
    { label: "High Fashion",  to: "/products-category" },
    { label: "Sneakers",      to: "/products-category" },
    { label: "Electronics",   to: "/products-category" },
    { label: "Beauty & Care", to: "/products-category" },
  ],
  Company: [
    { label: "About Woosho", to: "/about"   },
    { label: "Careers",      to: "/careers" },
    { label: "Press",        to: "/press"   },
    { label: "Contact",      to: "/contact" },
  ],
};

const LEGAL = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

// ── Animated link item ────────────────────────────────────────────────────────
function FooterLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        className="woo-footer-link group relative inline-flex items-center gap-1.5
          text-sm text-gray-500 dark:text-gray-400
          hover:text-blue-600 dark:hover:text-blue-400
          transition-colors duration-200"
      >
        <span className="relative">
          {label}
          {/* Sliding underline */}
          <span className="
            absolute -bottom-px left-0 h-px w-0 bg-blue-600 dark:bg-blue-400
            transition-all duration-300 group-hover:w-full
          " />
        </span>
        <ArrowRight
          size={11}
          className="opacity-0 -translate-x-1
            group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-200"
        />
      </Link>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const ModernFooter = memo(function ModernFooter() {
  // GSAP refs
  const footerRef   = useRef(null);
  const wordRef     = useRef(null);
  const taglineRef  = useRef(null);
  const divider1Ref = useRef(null);
  const colsRef     = useRef(null);
  const newsletterRef = useRef(null);
  const divider2Ref = useRef(null);
  const bottomRef   = useRef(null);
  const socialsRef  = useRef(null);
  const dotRef      = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      // ── 1. Big wordmark clips up ───────────────────────────────────────────
      gsap.fromTo(wordRef.current,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0, opacity: 1, duration: 1.05,
          ease: "expo.out",
          scrollTrigger: {
            trigger: wordRef.current,
            start: "top 92%",
          },
        }
      );

      // ── 2. Tagline fades + slides up ──────────────────────────────────────
      gsap.fromTo(taglineRef.current,
        { y: 22, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.75,
          ease: "power3.out", delay: 0.18,
          scrollTrigger: {
            trigger: taglineRef.current,
            start: "top 92%",
          },
        }
      );

      // ── 3. First divider draws left → right ───────────────────────────────
      gsap.fromTo(divider1Ref.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.1, ease: "expo.out",
          scrollTrigger: {
            trigger: divider1Ref.current,
            start: "top 90%",
          },
        }
      );

      // ── 4. Link columns stagger up ────────────────────────────────────────
      const cols = colsRef.current?.querySelectorAll(".footer-col");
      if (cols?.length) {
        gsap.fromTo(cols,
          { y: 36, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.65, ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: {
              trigger: colsRef.current,
              start: "top 88%",
            },
          }
        );
      }

      // ── 5. Newsletter band slides up ──────────────────────────────────────
      gsap.fromTo(newsletterRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: {
            trigger: newsletterRef.current,
            start: "top 90%",
          },
        }
      );

      // ── 6. Second divider draws ───────────────────────────────────────────
      gsap.fromTo(divider2Ref.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.0, ease: "expo.out",
          scrollTrigger: {
            trigger: divider2Ref.current,
            start: "top 95%",
          },
        }
      );

      // ── 7. Bottom bar fades up ────────────────────────────────────────────
      gsap.fromTo(bottomRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, ease: "power3.out",
          scrollTrigger: {
            trigger: bottomRef.current,
            start: "top 98%",
          },
        }
      );

      // ── 8. Social icons pop in with stagger ──────────────────────────────
      const socials = socialsRef.current?.querySelectorAll(".social-icon");
      if (socials?.length) {
        gsap.fromTo(socials,
          { scale: 0.6, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)",
            stagger: 0.07,
            scrollTrigger: {
              trigger: socialsRef.current,
              start: "top 96%",
            },
          }
        );
      }

      // ── 9. Pulsing dot in logo ─────────────────────────────────────────────
      gsap.to(dotRef.current, {
        scale: 1.22, duration: 1.4, ease: "sine.inOut",
        repeat: -1, yoyo: true,
      });

    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer
        ref={footerRef}
        className="
          relative overflow-hidden
          bg-white dark:bg-[#0E0E10]
          border-t border-gray-100 dark:border-white/[0.06]
          transition-colors duration-300
        "
      >
        {/* Subtle radial glow — top-left corner */}
        <div className="
          pointer-events-none absolute -top-48 -left-48
          w-[600px] h-[600px] rounded-full
          bg-blue-600/[0.04] dark:bg-blue-500/[0.07]
          blur-3xl
        " />

        <div className="relative max-w-7xl mx-auto px-6">

          {/* ── BIG WORDMARK SECTION ──────────────────────────────────────── */}
          <div className="pt-20 pb-12 overflow-hidden">
            <div ref={wordRef} className="overflow-hidden" style={{ opacity: 0 }}>
              <h2 className="
                font-serif tracking-tight leading-none select-none
                text-[clamp(72px,10vw,148px)]
                text-gray-950 dark:text-white
              "
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Woo
                <span className="text-blue-600 italic">sho</span>
                {/* Animated dot */}
                <span
                  ref={dotRef}
                  className="inline-block w-3 h-3 md:w-4 md:h-4 rounded-full
                    bg-blue-600 ml-1 mb-4 md:mb-6 align-bottom"
                />
              </h2>
            </div>

            <p
              ref={taglineRef}
              className="
                mt-4 text-base md:text-lg font-light leading-relaxed
                text-gray-500 dark:text-gray-400 max-w-sm
              "
              style={{ opacity: 0 }}
            >
              Commerce that understands every&nbsp;individual path.
              Powered by&nbsp;AI, delivered with passion.
            </p>
          </div>

          {/* ── DIVIDER 1 ─────────────────────────────────────────────────── */}
          <div
            ref={divider1Ref}
            className="w-full h-px bg-gray-100 dark:bg-white/[0.07]"
            style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
          />

          {/* ── LINK COLUMNS + NEWSLETTER ─────────────────────────────────── */}
          <div
            ref={colsRef}
            className="
              grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
              gap-x-6 gap-y-12 py-16
            "
          >
            {/* Link columns — 4 columns, each 1fr on lg */}
            {Object.entries(FOOTER_LINKS).map(([title, items]) => (
              <div key={title} className="footer-col" style={{ opacity: 0 }}>
                <p className="
                  text-[10px] font-black tracking-[0.18em] uppercase mb-6
                  text-gray-400 dark:text-gray-500
                ">
                  {title}
                </p>
                <ul className="space-y-3.5">
                  {items.map(item => (
                    <FooterLink key={item.label} {...item} />
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter CTA — takes 2 columns on lg */}
            <div
              ref={newsletterRef}
              className="footer-col col-span-2 lg:col-span-2"
              style={{ opacity: 0 }}
            >
              <p className="
                text-[10px] font-black tracking-[0.18em] uppercase mb-6
                text-gray-400 dark:text-gray-500
              ">
                Stay in the loop
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                New drops, exclusive deals, and seller tips — straight to your inbox.
              </p>

              {/* Input row */}
              <div className="flex gap-2.5">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="
                    flex-1 min-w-0 h-11 px-4 rounded-xl text-sm
                    bg-gray-100 dark:bg-white/[0.05]
                    border border-gray-200 dark:border-white/[0.09]
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-600
                    focus:outline-none focus:ring-2 focus:ring-blue-500/30
                    focus:border-blue-500/50
                    transition-all duration-200
                  "
                />
                <button className="
                  h-11 px-5 rounded-xl
                  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                  text-white text-sm font-bold
                  flex items-center gap-1.5 whitespace-nowrap
                  transition-all duration-200
                  hover:shadow-lg hover:shadow-blue-600/25
                  hover:-translate-y-px
                ">
                  Join <ArrowUpRight size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Trust line */}
              <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* ── DIVIDER 2 ─────────────────────────────────────────────────── */}
          <div
            ref={divider2Ref}
            className="w-full h-px bg-gray-100 dark:bg-white/[0.07]"
            style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
          />

          {/* ── BOTTOM BAR ─────────────────────────────────────────────────── */}
          <div
            ref={bottomRef}
            className="py-8 flex flex-col md:flex-row items-center justify-between gap-5"
            style={{ opacity: 0 }}
          >
            {/* Left: Logo + copyright */}
            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
              {/* Compact logo mark */}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center"
                  style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
                >
                  <Sparkles className="text-white fill-white" size={15} />
                </div>
                <span
                  className="text-base font-bold tracking-tight text-gray-900 dark:text-white"
                  style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                >
                  Woo<span className="text-blue-600">sho</span>
                </span>
              </div>

              {/* Dot separator */}
              <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20" />

              <span className="text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} Woosho Inc. All rights reserved.
              </span>
            </div>

            {/* Center: Social icons */}
            <div ref={socialsRef} className="flex items-center gap-2 order-first md:order-none">
              {Socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="
                    social-icon
                    w-9 h-9 rounded-xl
                    bg-gray-100 dark:bg-white/[0.05]
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-500 dark:text-gray-400
                    hover:bg-blue-600 hover:text-white hover:border-blue-600
                    dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600
                    flex items-center justify-center
                    transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-600/20
                  "
                  style={{ opacity: 0 }}
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Right: Legal links */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {LEGAL.map((label, i) => (
                <span key={label} className="flex items-center gap-1">
                  <button className="
                    text-xs text-gray-400 dark:text-gray-500
                    hover:text-blue-600 dark:hover:text-blue-400
                    transition-colors duration-150 px-1 py-0.5 rounded
                    hover:bg-blue-50 dark:hover:bg-blue-500/10
                  ">
                    {label}
                  </button>
                  {i < LEGAL.length - 1 && (
                    <span className="w-px h-3 bg-gray-200 dark:bg-white/10 block" />
                  )}
                </span>
              ))}
            </div>
          </div>

        </div>
      </footer>

      {/* ── Google Font import ──────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');

        /* Silky smooth link hover underlines */
        .woo-footer-link { text-underline-offset: 4px; }

        /* Force hardware acceleration on animated elements */
        footer [ref], footer .footer-col, footer .social-icon {
          will-change: transform, opacity;
        }
      `}
      </style>
    </>
  );
});