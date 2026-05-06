import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Bot, User, CheckCircle2 } from 'lucide-react';
import { formatMoneyCurrency } from '../../../../utils/FormatMoneyCents';

export default function Section5_DualAi() {
  const [phase, setPhase] = useState(0);
  const timers = useRef([]);
  const containerRef = useRef(null);
  
  // Trigger when any part of the element enters the viewport
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  useEffect(() => {
    if (!isInView) return;

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
        setTimeout(runSequence, 15000),
      ];
    };

    runSequence();
    return clear;
  }, [isInView]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-8 bg-[#0E0E10] pt-20"
    >

      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">One AI. Two Superpowers.</h2>
        <p className="text-gray-400 text-lg">Your AI works for you. Not instead of you — for you.</p>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 flex-1 min-h-[400px] max-h-[500px]">

        {/* LEFT PANE: Buyer View */}
        <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200">
          <div className="bg-gray-50 border-b border-gray-200 p-4 font-bold text-gray-800 flex items-center gap-3">
            <User size={20} className="text-blue-600" /> BUYER VIEW (Instagram / Web)
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4 bg-gray-100">
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  key="buyer-msg-1"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="self-end bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm"
                >
                  Hi, is this native gown still available? Do you deliver to Port Harcourt and can I get a 5% discount if I buy two?
                </motion.div>
              )}

              {phase >= 4 && phase < 5 && (
                <motion.div
                  key="buyer-typing"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="self-start text-xs text-gray-500 mt-2 flex gap-1 items-center"
                >
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </motion.div>
              )}

              {phase >= 5 && (
                <motion.div
                  key="buyer-msg-2"
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
              <AnimatePresence>
                {phase === 1 && (
                  <motion.div key="typing-indicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                    Typing<span className="inline-block animate-pulse">...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Seller AI Engine */}
        <div className={`flex-1 rounded-3xl overflow-hidden shadow-2xl flex flex-col border transition-all duration-700 ${phase === 5 ? 'bg-green-900/20 border-green-500/40' : 'bg-neutral-900 border-neutral-800'}`}>
          <div className="bg-black border-b border-neutral-800 p-4 font-bold text-gray-200 flex items-center gap-3 relative">
            <Bot size={20} className="text-indigo-400" /> SELLER AI ENGINE
            <AnimatePresence>
              {phase === 5 && (
                <motion.div
                  key="sale-made"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute right-4 text-green-400 flex items-center gap-1 text-sm bg-green-500/10 px-3 py-1 rounded-full"
                >
                  <CheckCircle2 size={16} /> SALE MADE
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 flex-1 flex flex-col gap-4 font-mono text-xs">
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div key="ai-step-1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <p className="text-gray-500 mb-1">&gt; INCOMING MESSAGE INTERCEPTED</p>
                  <p className="text-blue-400 mb-4">&gt; Analyzing intent: [Availability, Shipping Context, Negotiation]</p>
                </motion.div>
              )}

              {phase >= 4 && (
                <motion.div key="ai-step-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
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
                  key="ai-step-3"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300"
                >
                  &gt; TRANSACTION COMPLETED ({formatMoneyCurrency(4250000)})<br />
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