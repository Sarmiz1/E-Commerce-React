import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const AuthTabs = ({ mode, setMode, colors, cta, ctaText }) => {
  return (
    <AnimatePresence initial={false}>
      {mode !== "forgot" && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 22 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              background: colors.surface.secondary,
              borderRadius: 14,
              padding: 5,
              border: `1px solid ${colors.border.default}`,
            }}
          >
            {[
              ["login", "Sign In"],
              ["register", "Register"],
            ].map(([m, label]) => (
              <button
                key={m}
                className="auth-tab"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: 10,
                  background: mode === m ? cta : "transparent",
                  color: mode === m ? ctaText : colors.text.tertiary,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  boxShadow: mode === m ? `0 4px 14px ${cta}44` : "none",
                  transition: "all 0.22s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthTabs;
