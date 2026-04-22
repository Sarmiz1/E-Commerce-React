import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  const steps = [
    { num: "1", title: "Tell Woosho what you want", desc: "Just type it out naturally." },
    { num: "2", title: "AI understands your style & budget", desc: "We scan thousands of products." },
    { num: "3", title: "Get instant personalized results", desc: "Only the best matches, tailored for you." }
  ];

  return (
    <section ref={sectionRef} className="w-full py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-12 tracking-tight">
            Meet Your AI <br/> Shopping Assistant
          </h2>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} ref={el => stepsRef.current[i] = el} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">{step.title}</h3>
                  <p className="text-neutral-600 mt-2">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-200 shadow-lg relative h-[500px] flex flex-col">
           <div className="bg-white p-4 rounded-xl shadow-sm mb-6 max-w-[80%] self-end">
             <p className="text-neutral-800 font-medium text-sm md:text-base">"I need an outfit for a tech conference, smart casual, budget ₦150k"</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mt-auto">
             {[1,2,3,4].map((item, i) => (
               <div key={i} ref={el => gridRef.current[i] = el} className="bg-white p-2 rounded-xl shadow-sm border border-neutral-100">
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
