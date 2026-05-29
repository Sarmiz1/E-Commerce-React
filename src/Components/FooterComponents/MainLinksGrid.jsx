import { useState } from "react";
import { Link } from "react-router-dom";
import { SOCIALS } from "../../Data/Socials";
import { ROUTE_MAP } from "../../Data/routeMap";


const MainLinksGrid = () => {

  const [hoveredCol, setHoveredCol] = useState(null);

  const LINKS = {
    Shop: ["New Arrivals", "Trending Now", "Flash Sales", "Members Only", "Gift Cards"],
    Company: ["About WooSho", "Careers", "Press & Media", "Sustainability", "Investors"],
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
            <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-amber-500/60 mb-1">Est. 2026</p>
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
              <a key={s.name}
                href={s.href}
                aria-label={s.name}
                className="footer-social-btn">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, links]) => (
          <div
            key={col}
            onMouseEnter={() => setHoveredCol(col)}
            onMouseLeave={() => setHoveredCol(null)}
          >
            <h4
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 transition-colors duration-300"
              style={{ color: hoveredCol === col ? "#c9a84c" : "#374151" }}
            >
              {col}
            </h4>

            <ul className="space-y-3.5">
              {links.map((link) => {
                const routeKey = link.toLowerCase();
                const slug = routeKey.replace(/\s+/g, "-");
                const fallbackPath =
                  col.toLowerCase() === "shop" ? `/products/${slug}` : `/${slug}`;

                return (
                  <li key={link}>
                    <Link
                      to={ROUTE_MAP[routeKey] ?? fallbackPath}
                      className="footer-link"
                    >
                      {link}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MainLinksGrid
