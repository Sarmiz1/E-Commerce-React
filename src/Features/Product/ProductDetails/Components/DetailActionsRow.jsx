import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ShareButton from "../../../../components/Ui/ShareButton";
import { ChevronLeft, HeartIcon } from "./Icons";

export default function DetailActionsRow({ 
  product,
  wishlisted, 
  toggleWishlist,
}) {
  const navigate = useNavigate();
  const productName = product?.name || "this product";

  return (
    <div className="pd-r flex items-center justify-between">
      <motion.button
        whileHover={{ x: -3 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs transition-colors pd-link-hover"
        style={{
          color: "var(--mist)",
          fontFamily: "Jost,sans-serif",
        }}
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </motion.button>
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleWishlist}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: wishlisted
              ? "rgba(244,63,94,0.1)"
              : "var(--pd-s2)",
            border:
              "1px solid " +
              (wishlisted ? "rgba(244,63,94,0.3)" : "var(--pd-b3)"),
            color: wishlisted ? "#f43f5e" : "var(--mist)",
          }}
        >
          <HeartIcon filled={wishlisted} className="w-3.5 h-3.5" />
        </motion.button>
        <ShareButton
          title={productName}
          text={`Check out ${productName} on WooSho`}
          panelTitle="Share this item"
        />
      </div>
    </div>
  );
}
