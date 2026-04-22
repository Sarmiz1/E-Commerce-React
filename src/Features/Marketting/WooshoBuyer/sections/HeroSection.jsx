import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MessageSquare, ShoppingBag } from 'lucide-react';

const HeroSection = () => {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subtextRef = useRef(null);
  const buttonsRef = useRef(null);
  const chatBubbleRef = useRef(null);
  const productCardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(headlineRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
        .fromTo(subtextRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .fromTo(buttonsRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.2")
        .fromTo(chatBubbleRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }, "-=0.1");
        
      gsap.fromTo(productCardsRef.current, 
        { x: 50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 1 }
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full min-h-screen flex items-center justify-center pt-24 pb-12 px-6 md:px-12 bg-white">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text content */}
        <div className="flex flex-col items-start space-y-6">
          <h1 ref={headlineRef} className="text-5xl md:text-7xl font-extrabold text-neutral-900 leading-tight tracking-tight">
            Shopping Just <br/> Got <span className="text-blue-600">Smarter.</span>
          </h1>
          <p ref={subtextRef} className="text-lg md:text-xl text-neutral-600 max-w-md leading-relaxed">
            Let AI find what fits your style, budget, and vibe — instantly.
          </p>
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <button className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-full font-medium hover:bg-neutral-800 transition-colors">
              <MessageSquare className="w-5 h-5" />
              Start Shopping with AI
            </button>
            <button className="flex items-center justify-center gap-2 bg-neutral-100 text-neutral-900 px-8 py-4 rounded-full font-medium hover:bg-neutral-200 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              Browse Categories
            </button>
          </div>
        </div>
        
        {/* Right: AI Mock UI */}
        <div className="relative w-full h-[500px] bg-neutral-50 rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-xl overflow-hidden flex flex-col justify-between">
          <div 
            ref={chatBubbleRef}
            className="self-end bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md"
          >
            <p className="text-sm md:text-base font-medium overflow-hidden whitespace-nowrap border-r-2 border-white/50 animate-pulse">
              Affordable black sneakers under ₦40k
            </p>
          </div>
          
          <div className="flex flex-col gap-4 mt-8">
            {[
              { title: "Urban Black Kicks", price: "₦35,000", img: "https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=200&q=80" },
              { title: "Midnight Runners", price: "₦38,500", img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=200&q=80" },
              { title: "Stealth Trainers", price: "₦39,900", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=200&q=80" }
            ].map((item, index) => (
              <div 
                key={index}
                ref={el => productCardsRef.current[index] = el}
                className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-neutral-100"
              >
                <img src={item.img} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                <div>
                  <h4 className="font-semibold text-neutral-900">{item.title}</h4>
                  <p className="text-blue-600 font-medium">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
