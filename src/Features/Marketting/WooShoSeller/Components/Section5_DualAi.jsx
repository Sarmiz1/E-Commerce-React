import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, CheckCircle2 } from 'lucide-react';


// FIX: removed gsap.registerPlugin(ScrollTrigger) — registered once in SellerLanding.jsx
// FIX: replaced individual let t1..t6 variables with a stable ref array.
//
// The original bug: `runSequence` reassigns `t6` on every cycle, but the
// useEffect cleanup function closes over the *initial* binding of t6 (undefined
// on first run). Subsequent cycles wrote new timer IDs to t6 but cleanup never
// saw them — the recurring setTimeout leaked on every loop iteration, stacking
// up until the component unmounted or the tab was closed.
//
// The fix: store all active timer IDs in a ref array. A single `clear()`
// helper cancels every ID in the array regardless of when they were scheduled,
// and `runSequence` repopulates the array fresh each cycle.



export default function Section5_DualAi() {
  const [phase, setPhase] = useState(0);
  const timers = useRef([]); // stable ref — always holds the current cycle's IDs


  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    const runSequence = () => {
      clear();
      setPhase(0);
      timers.current = [
        setTimeout(() => setPhase(1), 1000),
        setTimeout(() => setPhase(2), 3500),
        setTimeout(() => setPhase(3), 4500),
        setTimeout(() => setPhase(4), 6500),
        setTimeout(() => setPhase(5), 9500),
        // Loop: schedule next cycle — the ID lands in timers.current so
        // cleanup will always find and cancel it, even mid-cycle
        setTimeout(runSequence, 15000),
      ];
    };

    runSequence();
    return clear; // cleanup cancels every pending timer
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0E0E10] pt-20">

      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">One AI. Two Superpowers.</h2>
        <p className="text-gray-400 text-lg">Your AI works for you. Not instead of you — for you.</p>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 flex-1 max-h-[500px]">

        {/* LEFT PANE: Buyer View */}
        <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200">
          <div className="bg-gray-50 border-b border-gray-200 p-4 font-bold text-gray-800 flex items-center gap-3">
            <User size={20} className="text-blue-600" /> BUYER VIEW (Instagram / Web)
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4 bg-gray-100">
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="self-end bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm"
                >
                  Hi, is this native gown still available? Do you deliver to Port Harcourt and can I get a 5% discount if I buy two?
                </motion.div>
              )}

              {phase >= 4 && phase < 5 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="self-start text-xs text-gray-500 mt-2 flex gap-1 items-center"
                >
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </motion.div>
              )}

              {phase >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="self-start bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm"
                >
                  Hello! Yes, we have 3 pieces left in stock. We deliver nationwide via DHL to Port Harcourt (takes 2 days). And absolutely, I've just applied a 5% bundle discount to your cart. 🛍️
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Buyer Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 flex items-center">
            <div className="bg-gray-100 rounded-full h-10 w-full px-4 flex items-center text-sm text-gray-500">
              {phase === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                  Typing<span className="inline-block animate-pulse">...</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Seller AI Engine */}
        <div className={`flex-1 rounded-3xl overflow-hidden shadow-2xl flex flex-col border transition-all duration-700 ${phase === 5 ? 'bg-green-900/20 border-green-500/40' : 'bg-neutral-900 border-neutral-800'}`}>
          <div className="bg-black border-b border-neutral-800 p-4 font-bold text-gray-200 flex items-center gap-3 relative">
            <Bot size={20} className="text-indigo-400" /> SELLER AI ENGINE
            {phase === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute right-4 text-green-400 flex items-center gap-1 text-sm bg-green-500/10 px-3 py-1 rounded-full"
              >
                <CheckCircle2 size={16} /> SALE MADE
              </motion.div>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4 font-mono text-xs">
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <p className="text-gray-500 mb-1">&gt; INCOMING MESSAGE INTERCEPTED</p>
                  <p className="text-blue-400 mb-4">&gt; Analyzing intent: [Availability, Shipping Context, Negotiation]</p>
                </motion.div>
              )}

              {phase >= 4 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <p className="text-gray-500 mb-1">&gt; CHECKING INVENTORY: Native Gown [SKU-892]</p>
                  <p className="text-green-400 mb-1">   Found 3 in stock.</p>
                  <p className="text-gray-500 mb-1">&gt; CHECKING LOGISTICS RULES</p>
                  <p className="text-green-400 mb-1">   Port Harcourt routing active (DHL, 2 days).</p>
                  <p className="text-gray-500 mb-1">&gt; CHECKING PROFIT MARGIN FOR 5% DISCOUNT</p>
                  <p className="text-green-400 mb-4">   Margin OK (22% &rarr; 17%). Pre-approved.</p>

                  <p className="text-gray-500 mb-1">&gt; COMPOSING RESPONSE (Brand Voice: Friendly/Professional)</p>
                  <div className="h-1 w-24 bg-indigo-500/30 rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </motion.div>
              )}

              {phase >= 5 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300"
                >
                  &gt; TRANSACTION COMPLETED (₦42,500)<br />
                  &gt; Stripe Payout initiated.<br />
                  &gt; Awaiting pickup.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}