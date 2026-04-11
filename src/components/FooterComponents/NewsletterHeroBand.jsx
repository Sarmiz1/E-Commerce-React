import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";


const NewsletterHeroBand = () => {

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="relative z-10 border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left copy */}
        <div className="md:max-w-md">
          <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-amber-500/80 mb-3">
            Private Access
          </p>
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3" style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
            Join the Inner{" "}
            <span className="gold-text">Circle</span>
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Early access to drops, members-only pricing, and curated style edits — delivered before anyone else knows they exist.
          </p>
        </div>

        {/* Right input */}
        <div className="w-full md:w-auto md:min-w-[380px]">
          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="relative flex items-center gap-0">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    placeholder="your@email.com"
                    className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 text-sm px-5 py-4 rounded-l-2xl focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubscribe}
                  className="px-6 py-4 rounded-r-2xl font-bold text-sm tracking-widest uppercase text-black whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)", backgroundSize: "200% auto" }}
                >
                  Subscribe
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                <span className="text-2xl">✦</span>
                <div>
                  <p className="text-white font-bold text-sm">Welcome to the Circle</p>
                  <p className="text-gray-500 text-xs mt-0.5">Your first exclusive drop is on its way.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-gray-700 text-[11px] mt-3 tracking-wide">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NewsletterHeroBand
