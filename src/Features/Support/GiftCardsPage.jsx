import React, { useEffect, useRef, useState } from 'react';
import { Gift, Sparkles, CreditCard, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import { gsap } from 'gsap';

export default function GiftCardsPage() {
  const cardRef = useRef(null);
  const bgRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(50000);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, 
        { y: 50, opacity: 0, rotateX: 10, rotateY: -15 }, 
        { y: 0, opacity: 1, rotateX: 0, rotateY: 0, duration: 1.5, ease: "power4.out" }
      );
      gsap.to(bgRef.current, {
        backgroundPosition: "200% center",
        duration: 20,
        repeat: -1,
        ease: "linear"
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Animated Background */}
      <div 
        ref={bgRef}
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, #5636F3 0%, transparent 40%), radial-gradient(circle at 80% 20%, #EAE5FE 0%, transparent 30%)",
          backgroundSize: "200% 200%"
        }}
      />

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center z-10">
        
        {/* Left: Text & Controls */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#EAE5FE] mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Premium Gifting
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              The Gift of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5636F3] to-[#A78BFA]">Choice.</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              Send a digital gift card instantly. Perfect for birthdays, anniversaries, or just because. Never expires.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-gray-500">Select Amount</h3>
            <div className="flex flex-wrap gap-3">
              {[10000, 25000, 50000, 100000].map(val => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${amount === val ? 'bg-white text-black scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                >
                  ₦{(val/1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          <button className="group w-full md:w-auto inline-flex items-center justify-center gap-3 bg-[#5636F3] hover:bg-[#4323E0] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02]">
            Buy Gift Card <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right: The Card Visual */}
        <div className="relative perspective-1000">
          <div 
            ref={cardRef}
            className="w-full max-w-md mx-auto aspect-[1.586/1] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_30px_60px_rgba(86,54,243,0.3)]"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            {/* Card Graphic overlays */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5636F3] rounded-full filter blur-[80px] opacity-40 mix-blend-screen translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="text-2xl font-extrabold tracking-tight">woosho</div>
              <CreditCard className="w-8 h-8 text-white/50" />
            </div>

            <div className="relative z-10 flex flex-col gap-1">
              <div className="text-5xl font-black tracking-tighter">₦{amount.toLocaleString()}</div>
              <div className="text-sm font-medium text-white/60 tracking-widest uppercase mt-2">Digital Gift Card</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
