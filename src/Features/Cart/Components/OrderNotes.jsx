import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ic } from "./CartConstants";

export function OrderNotes({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <Ic.Notes c="w-4 h-4" />
        Add order note
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <Ic.Chev dir="down" c="w-3.5 h-3.5" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Gift message, delivery instructions, special requests…"
              rows={3}
              className="ct-input w-full mt-3 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 resize-none placeholder-gray-400 transition"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
