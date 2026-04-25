import { motion } from "framer-motion";
import NavLink from "./NavLink";
import { EXPO } from "./navConstants";

export default function DesktopLinks({ navLinks, handleHash, setMobileMenuOpen }) {
  return (
    <div className="hidden md:flex items-center gap-7">
      {navLinks.map((link, i) => (
        <motion.div
          key={link.label}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08 * i + 0.2,
            duration: 0.4,
            ease: EXPO,
          }}
        >
          <NavLink
            link={link}
            onClick={
              link.href.startsWith("#")
                ? (e) => handleHash(link.href, e)
                : () => setMobileMenuOpen(false)
            }
          />
        </motion.div>
      ))}
    </div>
  );
}
