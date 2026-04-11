// src/components/MegaMenu.jsx
// Drop-in replacement — uses position:fixed so it NEVER clips past viewport edges.
// Import into Navbar.jsx and use as shown below.
//
// Usage in Navbar:
//   import MegaMenu from "./MegaMenu";
//   <MegaMenu
//     data={MEGA_MENU[activeLabel]}
//     triggerRect={megaTriggerRect}   // getBoundingClientRect() of the hovered nav button
//     onNavigate={(href) => { navigate(href); setActiveMenu(null); }}
//     onMouseEnter={keepMega}         // keeps panel open while mouse is over it
//     onMouseLeave={closeMega}        // starts close timer
//   />
//
// Required peer imports (already in Navbar.jsx):
//   import { motion } from "framer-motion";
//   import ArrowRight from "./icons"; // or your ArrowRight SVG



import { motion } from "framer-motion";

const ArrowRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);



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
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        link.badge === "New" ? "bg-blue-100 text-blue-600"
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

export default MegaMenu;