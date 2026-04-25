import { Sparkles } from "lucide-react";
import logoDarkmode from "../../assets/logos/logo-darkmode.png";
import logoLightmode from "../../assets/logos/logo-lightmode.png";


export const Logo = ({ size = 10 }) => (
  <div className="flex items-center gap-0">
    {/* Compact logo mark */}
    <div
      className={`${size === 7 ? "w-7 h-7" : "w-10 h-10" } rounded-lg bg-blue-600 flex items-center justify-center shrink-0`}      
      style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
    >
      <Sparkles className="text-white fill-white" size={size === 7 ? 15 : 18} />
    </div>

    <div className="flex items-center">
      {/* We use dark:hidden and hidden dark:block. If it's not working, ensure your parent has .dark class. */}
      <img
        src={logoLightmode}
        alt="Woosho Logo"
        className={`${ size === 7 ? "h-7  sm:h-8" : "h-8 sm:h-10  ml-1" } w-auto object-contain block dark:hidden scale-[1.5] origin-left`}
      />

      <img
        src={logoDarkmode}
        alt="Woosho Logo"
        className={`${ size === 7 ? "h-7  sm:h-8" : "h-8 sm:h-10  ml-1" } w-auto object-contain hidden dark:block scale-[1.5] origin-left`}
      />
    </div>
  </div>
);


