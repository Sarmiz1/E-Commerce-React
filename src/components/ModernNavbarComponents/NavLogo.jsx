import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../assets/logos/logo2.png";

export default function NavLogo({ pageView }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      {pageView === "home" ? (
        <div
          className="flex items-center cursor-pointer mix-blend-multiply dark:mix-blend-normal dark:invert"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={logo}
            alt="Woosho Logo"
            className="w-auto h-12 object-contain"
          />
        </div>
      ) : (
        <Link
          to="/"
          className="flex items-center mix-blend-multiply dark:mix-blend-normal dark:invert"
        >
          <img
            src={logo}
            alt="Woosho Logo"
            className="w-auto h-12 object-contain"
          />
        </Link>
      )}
    </motion.div>
  );
}
