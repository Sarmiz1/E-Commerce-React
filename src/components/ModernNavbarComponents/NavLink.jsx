import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { EXPO } from "./navConstants";

export default function NavLink({ link, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === link.href;

  if (link.href.startsWith("#")) {
    return (
      <button
        onClick={onClick}
        className="relative text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
      >
        {link.label}
        <motion.span
          className="absolute -bottom-1 left-0 h-0.5 bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3, ease: EXPO }}
        />
      </button>
    );
  }

  return (
    <Link
      to={link.href}
      onClick={onClick}
      className="relative text-sm font-medium transition-colors group"
      style={{ color: isActive ? "#2563eb" : undefined }}
    >
      <span
        className={`${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"}`}
      >
        {link.label}
      </span>
      <motion.span
        className="absolute -bottom-1 left-0 h-0.5 bg-blue-600 rounded-full"
        initial={{ width: isActive ? "100%" : 0 }}
        animate={{ width: isActive ? "100%" : 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3, ease: EXPO }}
      />
    </Link>
  );
}
