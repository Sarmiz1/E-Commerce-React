import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function EmptyWishlist() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col items-center justify-center overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 px-6 py-32 text-center shadow-sm"
    >
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[24px] bg-slate-950 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-white/10"
      >
        <div className="absolute inset-0 rounded-[24px] bg-white/10 dark:bg-black/5 opacity-0 transition-opacity hover:opacity-100" />
        <Heart className="h-10 w-10" fill="currentColor" strokeWidth={1.5} />
      </motion.div>
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl"
      >
        Your wishlist is empty
      </motion.h2>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-slate-500 dark:text-slate-400"
      >
        Curate your personal collection. Save the products you love and they will await you here for later.
      </motion.p>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Link
          to="/products"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-xl bg-slate-950 dark:bg-white px-10 text-base font-bold text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:-translate-y-1 hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-2xl hover:shadow-slate-900/30 dark:hover:shadow-white/20 active:translate-y-0"
        >
          Explore Collections
        </Link>
      </motion.div>
    </motion.section>
  );
}
