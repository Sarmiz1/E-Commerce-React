import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HeartIcon, ShareIcon, CheckIcon } from "./Icons";

export default function DetailActionsRow({ 
  wishlisted, 
  toggleWishlist, 
  shareOpen, 
  handleShare, 
  shareToURL, 
  handleCopyLink, 
  copied, 
  copyLabel 
}) {
  const navigate = useNavigate();

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
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="pd-share-btn w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: shareOpen
                ? "rgba(201,169,110,0.1)"
                : "var(--pd-s2)",
              border:
                "1px solid " +
                (shareOpen
                  ? "rgba(201,169,110,0.3)"
                  : "var(--pd-b3)"),
              color: shareOpen ? "var(--gold)" : "var(--mist)",
            }}
          >
            <ShareIcon className="w-3.5 h-3.5" />
          </motion.button>
          <AnimatePresence>
            {shareOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 6 }}
                transition={{ duration: 0.18 }}
                className="pd-share-panel absolute right-0 top-11 z-[200] rounded-2xl shadow-2xl p-4 w-[220px]"
                style={{
                  background: "var(--pd-overlay)",
                  border: "1px solid var(--pd-b5)",
                }}
              >
                <p
                  className="pd-chip mb-3 px-1"
                  style={{ color: "var(--mist)" }}
                >
                  Share this item
                </p>
                <div className="space-y-0.5">
                  {[
                    {
                      id: "whatsapp",
                      label: "WhatsApp",
                      bg: "#25D366",
                    },
                    {
                      id: "twitter",
                      label: "X (Twitter)",
                      bg: "#000",
                    },
                    {
                      id: "facebook",
                      label: "Facebook",
                      bg: "#1877f2",
                    },
                    {
                      id: "telegram",
                      label: "Telegram",
                      bg: "#0088cc",
                    },
                  ].map((p) => (
                    <motion.button
                      key={p.id}
                      whileHover={{ x: 3 }}
                      onClick={() => shareToURL(p.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        color: "var(--silver)",
                        fontFamily: "Jost,sans-serif",
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold"
                        style={{ background: p.bg }}
                      >
                        {p.label[0]}
                      </span>
                      {p.label}
                    </motion.button>
                  ))}
                </div>
                <div
                  className="my-3"
                  style={{ borderTop: "1px solid var(--pd-b2)" }}
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all"
                  style={{
                    background: copied
                      ? "rgba(74,222,128,0.06)"
                      : "transparent",
                    borderColor: copied
                      ? "rgba(74,222,128,0.2)"
                      : "var(--pd-b3)",
                    color: copied ? "#4ade80" : "var(--silver)",
                    fontFamily: "Jost,sans-serif",
                  }}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      {copyLabel}
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
