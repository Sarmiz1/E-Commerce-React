import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { EXIT_INTENT_CONTENT } from "../Data/exitIntentContent";

const EXIT_INTENT_KEY = "woosho.exit-intent-dismissed";

const ExitIntentPopup = memo(function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      sessionStorage.setItem(EXIT_INTENT_KEY, "true");
    } catch {}
  }, []);

  useEffect(() => {
    // Don't show if already dismissed this session
    try {
      if (sessionStorage.getItem(EXIT_INTENT_KEY)) return;
    } catch {}

    const handleMouseLeave = (e) => {
      // Only trigger when cursor moves toward the top of the viewport (close/tab bar)
      if (e.clientY <= 5 && !show) {
        setShow(true);
      }
    };

    // Wait 8 seconds before arming the exit-intent detector
    const armTimer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 8000);

    return () => {
      clearTimeout(armTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    // In production, you'd POST this to your lead capture endpoint
    setTimeout(() => dismiss(), 2500);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-[#1A1A1E] rounded-[32px] border border-gray-200 dark:border-white/10 shadow-2xl max-w-md w-full p-8 relative overflow-hidden pointer-events-auto">
              {/* Background decoration */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-[80px] opacity-20" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-[80px] opacity-15" />

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
                  <Sparkles className="text-white" size={28} />
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                      {EXIT_INTENT_CONTENT.successTitle}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {EXIT_INTENT_CONTENT.successDescription}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                      {EXIT_INTENT_CONTENT.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                      {EXIT_INTENT_CONTENT.description}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={EXIT_INTENT_CONTENT.inputPlaceholder}
                        required
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 text-gray-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30 transition placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                      <button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      >
                        {EXIT_INTENT_CONTENT.cta}
                        <ArrowRight size={16} />
                      </button>
                    </form>

                    <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center mt-4">
                      {EXIT_INTENT_CONTENT.finePrint}
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default ExitIntentPopup;
