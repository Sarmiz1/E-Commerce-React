import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoogleIcon from "../Components/GoogleIcon";

const SocialAuth = ({ mode, role, buyerStep, sellerStep, colors, isDark }) => {
  return (
    <AnimatePresence initial={false}>
      {mode !== "forgot" &&
        !(mode === "register" && role === "seller" && sellerStep > 1) &&
        !(mode === "register" && role === "buyer" && buyerStep > 1) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <button
              className="google-btn"
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                border: `1.5px solid ${colors.border.default}`,
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                cursor: "pointer",
                marginBottom: 18,
                color: colors.text.primary,
                fontSize: 14,
                fontWeight: 600,
                boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <GoogleIcon /> Continue with Google
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: colors.border.default,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: colors.text.tertiary,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                or
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: colors.border.default,
                }}
              />
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
};

export default SocialAuth;
