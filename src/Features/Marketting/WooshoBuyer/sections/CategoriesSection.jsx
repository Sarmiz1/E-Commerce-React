import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CategoriesSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardsRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleHover = (e, isEnter) => {
    const img = e.currentTarget.querySelector('img');
    const overlay = e.currentTarget.querySelector('.overlay');
    gsap.to(img, { scale: isEnter ? 1.05 : 1, duration: 0.5, ease: "power2.out" });
    gsap.to(overlay, { opacity: isEnter ? 0.4 : 0.2, duration: 0.3 });
  };

  const categories = [
    { title: "Fashion", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80", colSpan: "col-span-1 md:col-span-2" },
    { title: "Sneakers", img: "https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&w=400&q=80", colSpan: "col-span-1" },
    { title: "Electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80", colSpan: "col-span-1" },
    { title: "Gadgets", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", colSpan: "col-span-1 md:col-span-2" },
    { title: "Beauty", img: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=400&q=80", colSpan: "col-span-1" },
    { title: "Accessories", img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=400&q=80", colSpan: "col-span-1" },
    { title: "Home Essentials", img: "https://images.unsplash.com/photo-1556020685-e631950279c1?auto=format&fit=crop&w=600&q=80", colSpan: "col-span-1 md:col-span-2" }
  ];

  return (
    <section ref={sectionRef} className="w-full py-24 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-16 text-center tracking-tight">
          Everything You Need. <br/> <span className="text-neutral-500">One Platform.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              ref={el => cardsRef.current[i] = el}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
              className={`relative rounded-3xl overflow-hidden cursor-pointer ${cat.colSpan}`}
            >
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transform origin-center transition-transform" />
              <div className="overlay absolute inset-0 bg-black opacity-20 transition-opacity"></div>
              <div className="absolute inset-0 p-8 flex items-end">
                <h3 className="text-2xl font-semibold text-white drop-shadow-md">{cat.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
