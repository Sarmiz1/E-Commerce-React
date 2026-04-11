import { useState } from "react";


const MainLinksGrid = () => {

  const [hoveredCol, setHoveredCol] = useState(null);


  const SOCIALS = [
    {
      name: "Instagram",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "X / Twitter",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: "Pinterest",
      href: "#",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      ),
    },
  ];

  const LINKS = {
    Shop: ["New Arrivals", "Trending Now", "Flash Sales", "Members Only", "Gift Cards"],
    Company: ["About ShopEase", "Careers", "Press & Media", "Sustainability", "Investors"],
    Support: ["Help Center", "Track Your Order", "Returns & Exchanges", "Size Guide", "Contact Us"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Settings", "Accessibility", "Sitemap"],
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-10">

        {/* Brand column — takes 2 cols */}
        <div className="col-span-2">
          {/* Logo wordmark */}
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-amber-500/60 mb-1">Est. 2024</p>
            <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
              <span className="gold-text">Woo</span>
              <span className="text-white">Sho</span>
            </h2>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-[220px]">
            Redefining premium commerce. Curated with intention, delivered with precision.
          </p>

          {/* Trust badges */}
          <div className="space-y-3 mb-8">
            {[
              { icon: "⬡", text: "Verified Luxury Retailer" },
              { icon: "◈", text: "SSL Secured & Encrypted" },
              { icon: "◇", text: "2M+ Satisfied Members" },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2.5">
                <span className="text-amber-500/70 text-xs">{badge.icon}</span>
                <span className="text-gray-600 text-xs tracking-wide">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex gap-3 flex-wrap">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.href} aria-label={s.name} className="footer-social-btn">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, links], idx) => (
          <div key={col} onMouseEnter={() => setHoveredCol(col)} onMouseLeave={() => setHoveredCol(null)}>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 transition-colors duration-300"
              style={{ color: hoveredCol === col ? "#c9a84c" : "#374151" }}>
              {col}
            </h4>
            <ul className="space-y-3.5">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="footer-link">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MainLinksGrid
