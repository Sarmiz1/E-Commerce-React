import { Sparkles } from "lucide-react";
import logoDarkmode from "../../assets/logos/logo-darkmode.png";
import logoLightmode from "../../assets/logos/logo-lightmode.png";


export const Logo = ({ size = 10, pageView, isScrolled }) => {
  // When isScrolled is explicitly provided (navbar context), use it directly
  // to pick the logo — both Navbar and ModernNavbar always go white-bg when
  // scrolled regardless of global dark/light theme, so dark: classes can't be used.
  const navbarControlled = typeof isScrolled === "boolean";

  // Determine which image to show
  // - Navbar + unscrolled (dark/transparent bg) → white logo (logoDarkmode)
  // - Navbar + scrolled   (white bg)            → dark logo  (logoLightmode)
  // - No navbar context                         → fall back to dark: toggle
  const sizeClass = size === 7 ? "h-7  sm:h-8" : "h-8 sm:h-10  ml-1";
  const baseClass = `${sizeClass} w-auto object-contain scale-[1.5] origin-left`;

  return (
    <div className="flex items-center gap-0">
      {/* Compact logo mark */}
      <div
        className={`${size === 7 ? "w-7 h-7" : "w-10 h-10" } rounded-lg bg-blue-600 flex items-center justify-center shrink-0`}      
        style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
      >
        <Sparkles className="text-white fill-white" size={size === 7 ? 15 : 18} />
      </div>

      <div className="flex items-center">
        {navbarControlled ? (
          /* Navbar context: pick logo based on scroll state directly */
          <img
            src={isScrolled ? logoLightmode : logoDarkmode}
            alt="Woosho Logo"
            className={baseClass}
          />
        ) : (
          /* Non-navbar: standard dark: class toggle */
          <>
            <img
              src={logoLightmode}
              alt="Woosho Logo"
              className={`${baseClass} block dark:hidden`}
            />
            <img
              src={logoDarkmode}
              alt="Woosho Logo"
              className={`${baseClass} hidden dark:block`}
            />
          </>
        )}
      </div>
    </div>
  );
};
