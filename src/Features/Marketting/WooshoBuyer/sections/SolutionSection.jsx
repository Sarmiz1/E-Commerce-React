import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatMoneyCurrency } from '../../../../utils/FormatMoneyCents';
import { BUYER_RESULT_PLACEHOLDERS, BUYER_SOLUTION_PROMPT, BUYER_SOLUTION_STEPS } from '../Data/sectionsData.jsx';

// FIX: removed duplicate gsap.registerPlugin(ScrollTrigger)

const SolutionSection = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);
  const gridRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Steps sequence
      gsap.fromTo(stepsRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, stagger: 0.4, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 60%" } }
      );

      // Grid appearance
      gsap.fromTo(gridRef.current,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 50%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-24 px-6 md:px-12 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-12 tracking-tight">
            Meet Your AI <br/> Shopping Assistant
          </h2>
          <div className="space-y-8">
            {BUYER_SOLUTION_STEPS.map((step, i) => (
              <div key={i} ref={el => stepsRef.current[i] = el} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{step.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-2">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-neutral-50 dark:bg-white/5 p-8 rounded-3xl border border-neutral-200 dark:border-white/10 shadow-lg relative h-[500px] flex flex-col">
           <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl shadow-sm mb-6 max-w-[80%] self-end">
             <p className="text-neutral-800 dark:text-neutral-200 font-medium text-sm md:text-base">"{BUYER_SOLUTION_PROMPT.text} {formatMoneyCurrency(BUYER_SOLUTION_PROMPT.budgetCents).replace(".00", "")}"</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mt-auto">
             {BUYER_RESULT_PLACEHOLDERS.map((item, i) => (
               <div key={i} ref={el => gridRef.current[i] = el} className="bg-white dark:bg-[#0a0a0a] p-2 rounded-xl shadow-sm border border-neutral-100 dark:border-white/10">
                 <div className="w-full h-32 bg-neutral-200 rounded-lg mb-3 object-cover overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-${1550000000000 + i}?auto=format&fit=crop&w=300&q=80`} alt="" className="w-full h-full object-cover grayscale opacity-50" />
                 </div>
                 <div className="h-3 w-3/4 bg-neutral-200 rounded mb-2"></div>
                 <div className="h-3 w-1/2 bg-blue-100 rounded"></div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
