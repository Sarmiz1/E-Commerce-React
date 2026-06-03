import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ic, UNDO_DURATION } from "./CartConstants";

export function UndoToast({ item, onUndo, onExpire, isPending = false }) {
  const [progress, setProgress] = useState(100);
  const [start] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100);
      setProgress(pct);
      if (pct === 0) { clearInterval(id); onExpire(); }
    }, 40);
    return () => clearInterval(id);
  }, [onExpire, start]);

  return (
    <motion.div
      initial={{ x: "-50%", y: 60, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      exit={{ x: "-50%", y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="fixed bottom-32 left-1/2 z-[99] flex w-[calc(100%-1rem)] max-w-[360px] items-center gap-2 rounded-2xl bg-gray-900 px-3 py-3 text-white shadow-2xl sm:w-[calc(100%-1.5rem)] sm:gap-4 sm:px-5 sm:py-3.5 lg:bottom-6"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">Removed "{item?.name}"</p>
        <div className="h-0.5 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-indigo-400 rounded-full transition-none" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        onClick={onUndo}
        disabled={isPending}
        className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-indigo-600 px-2.5 py-2 text-[11px] font-black text-white transition-colors hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60 sm:gap-1.5 sm:px-3 sm:text-xs"
      >
        <Ic.Undo c="w-3 h-3" /> {isPending ? "Restoring..." : "Undo"}
      </motion.button>
    </motion.div>
  );
}
