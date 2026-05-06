import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ic, UNDO_DURATION } from "./CartConstants";

export function UndoToast({ item, onUndo, onExpire }) {
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
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99] flex items-center gap-4 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl min-w-[280px] max-w-[360px]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">Removed "{item?.name}"</p>
        <div className="h-0.5 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-indigo-400 rounded-full transition-none" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
        onClick={onUndo}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-3 py-2 rounded-xl flex-shrink-0 transition-colors"
      >
        <Ic.Undo c="w-3 h-3" /> Undo
      </motion.button>
    </motion.div>
  );
}
