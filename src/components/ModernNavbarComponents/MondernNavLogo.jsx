import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Logo } from "../../Components/Ui/Logo";
export default function MondernNavLogo({ pageView, isScrolled }) {

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      {pageView === "home" ? (
        <div
          className="cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Logo pageView={pageView} isScrolled={isScrolled} />
        </div>
      ) : (
        <Link to="/">
          <Logo pageView={pageView} isScrolled={isScrolled} />
        </Link>
      )}
    </motion.div>
  );
}