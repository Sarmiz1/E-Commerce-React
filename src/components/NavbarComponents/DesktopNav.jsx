import { AnimatePresence, motion as Motion } from "framer-motion";
import { ChevronDown } from "./Icons";
import { MegaMenu } from "./MegaMenu";

export function DesktopNav({
  links,
  megaMenu,
  activeMenu,
  triggerRect,
  isTop,
  pathname,
  onNavigate,
  onOpenMega,
  onCloseMega,
  onKeepMega,
}) {
  return (
    <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center relative">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));
        const hasMega = link.hasMega && megaMenu[link.label];

        return (
          <div
            key={link.label}
            className="relative"
            onMouseEnter={(e) => (hasMega ? onOpenMega(link.label, e) : null)}
            onMouseLeave={() => (hasMega ? onCloseMega() : null)}
          >
            <button
              onClick={() => onNavigate(link.href)}
              className={`nb-navlink transition-all duration-200 ${
                isTop
                  ? `text-white/80 hover:text-white ${isActive ? "bg-white/12 text-white" : "hover:bg-white/10"}`
                  : `text-gray-600 hover:text-gray-900 ${isActive ? "bg-gray-100 text-gray-900 font-bold" : "hover:bg-gray-100/80"}`
              } ${link.accent ? (isTop ? "!text-orange-300 font-black" : "!text-orange-500 font-black") : ""}`}
            >
              {link.accent && <span className="text-xs">%</span>}
              {link.label}
              {hasMega && (
                <Motion.span animate={{ rotate: activeMenu === link.label ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className={`w-3 h-3 transition-colors ${isTop ? "text-white/50" : "text-gray-400"}`} />
                </Motion.span>
              )}
            </button>

            <AnimatePresence>
              {activeMenu === link.label && (
                <MegaMenu
                  data={megaMenu[link.label]}
                  triggerRect={triggerRect}
                  onNavigate={onNavigate}
                  onMouseEnter={onKeepMega}
                  onMouseLeave={onCloseMega}
                />
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
