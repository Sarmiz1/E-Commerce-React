import { motion, AnimatePresence } from "framer-motion";
import MegaMenu from "./MegaMenu";

const DesktopNav = ({
  ALL_NAV_LINKS,
  MEGA_MENU,
  openMega,
  closeMega,
  navigate,
  setActiveMenu,
  isTop,
  activeMenu,
  keepMega,
  ChevronDown 
}) => {
  return (
    <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center relative">
      {ALL_NAV_LINKS.map((link) => {
        const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href.split("?")[0]));
        const hasMega = link.hasMega && MEGA_MENU[link.label];
        return (
          <div key={link.label}
            className="relative"
            onMouseEnter={() => hasMega ? openMega(link.label) : null}
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

            {/* Mega menu */}
            <AnimatePresence>
              {activeMenu === link.label && (
                <div onMouseEnter={keepMega} onMouseLeave={closeMega}>
                  <MegaMenu
                    data={MEGA_MENU[link.label]}
                    isTop={isTop} onNavigate={(href) => { navigate(href); setActiveMenu(null); }}
                    onMouseEnter={keepMega}
                    onMouseLeave={closeMega}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  )
}

export default DesktopNav
