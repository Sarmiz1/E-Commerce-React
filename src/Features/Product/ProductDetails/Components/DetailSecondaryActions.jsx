import React from "react";
import { motion } from "framer-motion";
import { BellIcon, CheckIcon, HeartIcon } from "./Icons";

export default function DetailSecondaryActions({ 
  setAlertOpen, 
  hasAlert, 
  wishlisted, 
  toggleWishlist 
}) {
  return (
    <div className="pd-r flex flex-wrap gap-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setAlertOpen(true)}
        disabled={hasAlert}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
        style={{
          fontFamily: "Jost,sans-serif",
          background: hasAlert
            ? "rgba(74,222,128,0.06)"
            : "var(--pd-s2)",
          border:
            "1px solid " +
            (hasAlert ? "rgba(74,222,128,0.2)" : "var(--pd-b3)"),
          color: hasAlert ? "#4ade80" : "var(--silver)",
          cursor: hasAlert ? "default" : "pointer",
        }}
      >
        {hasAlert ? (
          <>
            <CheckIcon className="w-3 h-3" />
            Alert Set
          </>
        ) : (
          <>
            <BellIcon className="w-3 h-3" />
            Price Alert
          </>
        )}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={toggleWishlist}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
        style={{
          fontFamily: "Jost,sans-serif",
          background: wishlisted
            ? "rgba(244,63,94,0.06)"
            : "var(--pd-s2)",
          border:
            "1px solid " +
            (wishlisted ? "rgba(244,63,94,0.2)" : "var(--pd-b3)"),
          color: wishlisted ? "#f87171" : "var(--silver)",
        }}
      >
        <HeartIcon filled={wishlisted} className="w-3 h-3" />
        {wishlisted ? "Saved" : "Save"}
      </motion.button>
    </div>
  );
}
