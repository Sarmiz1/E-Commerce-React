import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Section2_PainClock() {
  const containerRef = useRef(null);
  const [cost, setCost] = useState(0);
  const [isCapped, setIsCapped] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate text elements into view
      gsap.from(".pain-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
      });

      // The Invisible Tax Clock Logic via a GSAP proxy object
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: 500,
        duration: 5,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        },
        onUpdate: () => setCost(Math.floor(proxy.val)),
        onComplete: () => setIsCapped(true)
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col xl:flex-row items-center justify-center p-8 bg-[#0a0a0a] gap-12 pt-20">
      
      {/* Left side: The Pain Mirror */}
      <div className="flex-[1.5] max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
          You're Working Too Hard For Too Little.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="pain-card bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-white font-bold block mb-2">You wake up to 40 DMs</span> asking the same 4 questions. You answer them one by one, every morning. It never gets easier.
            </p>
          </div>
          <div className="pain-card bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
             <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-white font-bold block mb-2">You post a product.</span> 200 people see it. 3 ask about it. You get 0 sales. You post again tomorrow and hope.
            </p>
          </div>
          <div className="pain-card bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
             <p className="text-gray-300 text-sm leading-relaxed">
              <span className="text-white font-bold block mb-2">Your prices are guesses.</span> Somewhere, a competitor charges 30% more for the same product and sells more.
            </p>
          </div>
          <div className="pain-card bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
             <p className="text-gray-300 text-sm leading-relaxed">
               <span className="text-white font-bold block mb-2">You do 6 jobs at once.</span> Photographer, copywriter, customer service rep, accountant. For the salary of zero.
            </p>
          </div>
        </div>

        <p className="pain-card text-xl text-gray-400 mt-8 italic">
          "The worst part? None of this is your fault. You just don't have the right tools yet."
        </p>
      </div>

      {/* Right side: The Tax Clock Widget */}
      <div className="flex-1 w-full max-w-sm pain-card">
        <div className="bg-neutral-900/50 backdrop-blur-3xl border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.05)]">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600/0 via-red-600 to-red-600/0 opacity-50" />
          
          <p className="text-gray-400 font-medium mb-4 uppercase tracking-widest text-xs">The Invisible Tax</p>
          
          <div className="flex items-start text-red-500 font-mono tracking-tighter shadow-sm mb-2 justify-center">
            <span className="text-4xl mt-2 font-bold opacity-80">₦</span>
            <span className={`text-8xl font-black tabular-nums transition-colors duration-500 ${isCapped ? 'text-red-500 shadow-red-500/50 drop-shadow-xl animate-pulse' : 'text-white'}`}>
              {cost}
            </span>
          </div>

          <p className="text-red-400/80 text-sm font-semibold mt-2">
            Lost while you were reading this page.
          </p>

          <div className="w-full h-px bg-neutral-800 my-6" />

          <div className="text-left w-full space-y-3">
             <div className="flex justify-between text-xs font-mono text-gray-500">
                <span>Loss Rate</span>
                <span>₦8.33 / min</span>
             </div>
             <div className="flex justify-between text-xs font-mono text-gray-500">
                <span>Daily Extrapolation</span>
                <span className="text-gray-300">₦12,000 / day</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
