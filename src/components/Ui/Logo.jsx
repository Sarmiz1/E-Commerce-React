import { Sparkles } from "lucide-react";
import WooshoAppIcon from "./WooshoAppIcon";
import logoDarkmode from "../../assets/logos/logo-lightmode.png";
import logoLightmode from "../../assets/logos/logo-darkmode.png";

export const Logo = ({
  size = 9,
  variant = "navbar", // "navbar" (responsive), "footer" (wordmark only), "icon" (icon only), "wordmark" (wordmark only)
  pageView,
  isScrolled,
  isDark: explicitDark,
}) => {
  const navbarControlled = typeof isScrolled === "boolean";

  // Base height determined by size prop (Tailwind scale)
  const sizeClass = `h-${size}`;
  
  // Scaling factor for wordmark to make it pop
  // Navbar gets the aggressive scale, footer/others get a standard scale unless specified
  const scale = variant === "navbar" ? "scale-[2.2]" : "scale-[1.5]";
  const baseClass = `${sizeClass} w-auto object-contain ${scale} origin-left transition-transform duration-300`;

  // Helper to render the wordmark images
  const renderWordmark = (extraClass = "") => (
    <div className={`items-center relative z-20 ${sizeClass} ${extraClass}`}>
      <div className="overflow-visible flex items-center h-full">
        {typeof explicitDark === "boolean" ? (
          <img
            src={explicitDark ? logoDarkmode : logoLightmode}
            alt="Woosho Logo"
            className={baseClass}
          />
        ) : navbarControlled ? (
          <img
            src={isScrolled ? logoLightmode : logoDarkmode}
            alt="Woosho Logo"
            className={baseClass}
          />
        ) : (
          <div className="relative">
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
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex items-center">
      {/* Icon Display Logic */}
      {(variant === "navbar" || variant === "icon") && (
        <div className={`items-center ${variant === "navbar" ? "flex md:hidden" : "flex"}`}>
          <WooshoAppIcon explicitDark={explicitDark} />
        </div>
      )}

      {/* Wordmark Display Logic */}
      {(variant === "navbar" || variant === "footer" || variant === "wordmark") && (
        renderWordmark(variant === "navbar" ? "hidden md:flex ml-3" : "flex")
      )}
    </div>
  );
};
