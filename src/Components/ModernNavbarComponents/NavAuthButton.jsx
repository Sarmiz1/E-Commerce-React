import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/auth/AuthContext";
import { User, LogOut, LogIn } from "lucide-react";

const NavAuthButton = ({ variant = "desktop", onAction }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isMobile = variant === "mobile";

  const navigateTo = (path) => {
    navigate(path);
    onAction?.();
  };

  const handleSignOut = () => {
    onAction?.();
    signOut();
  };

  if (user) {
    return (
      <div className={isMobile ? "grid grid-cols-2 gap-3" : "flex items-center gap-2"}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateTo("/account")}
          className={
            isMobile
              ? "flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              : "flex items-center justify-center rounded-full p-2 text-black transition-colors hover:text-blue-400 dark:text-white"
          }
          title="Account"
        >
          <User size={20} />
          {isMobile && "Account"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className={
            isMobile
              ? "flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-800 transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              : "flex items-center justify-center rounded-full p-2 text-black transition-colors hover:text-red-400 dark:text-white"
          }
          title="Logout"
        >
          <LogOut size={isMobile ? 17 : 16} />
          {isMobile && "Logout"}
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigateTo("/login")}
      className={
        isMobile
          ? "flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          : "flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-black transition-all hover:border-gray-400 hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:border-white/50 dark:hover:bg-white/10"
      }
    >
      <LogIn size={16} />
      Login
    </motion.button>
  );
};

export default NavAuthButton;
