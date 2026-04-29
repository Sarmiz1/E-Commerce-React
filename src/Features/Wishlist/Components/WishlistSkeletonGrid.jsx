import { motion } from "framer-motion";

export default function WishlistSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="relative flex h-[460px] flex-col overflow-hidden rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
        >
          <div className="h-[60%] w-full animate-pulse bg-slate-50 dark:bg-slate-800/50" />

          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <div className="flex justify-between">
              <div className="h-2.5 w-12 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-2.5 w-10 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-1 h-5 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
