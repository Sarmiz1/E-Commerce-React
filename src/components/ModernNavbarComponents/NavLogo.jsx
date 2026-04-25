import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import logoDarkmode from "../../assets/logos/logo-darkmode.png";
import logoLightmode from "../../assets/logos/logo-lightmode.png";

export default function NavLogo({ pageView }) {
  const LogoContent = () => (
    <div className="flex items-center gap-2">
      {/* Compact logo mark */}
      <div
        className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0"
        style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
      >
        <Sparkles className="text-white fill-white" size={18} />
      </div>

      <div className="flex items-center">
        {/* We use dark:hidden and hidden dark:block. If it's not working, ensure your parent has .dark class. */}
        <img
          src={logoLightmode}
          alt="Woosho Logo"
          className="w-auto h-8 sm:h-10 object-contain block dark:hidden scale-[1.5] origin-left ml-2"
        />
        <img
          src={logoDarkmode}
          alt="Woosho Logo"
          className="w-auto h-8 sm:h-10 object-contain hidden dark:block scale-[1.5] origin-left ml-2"
        />
      </div>
    </div>
  );

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      {pageView === "home" ? (
        <div
          className="cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <LogoContent />
        </div>
      ) : (
        <Link to="/">
          <LogoContent />
        </Link>
      )}
    </motion.div>
  );
}
