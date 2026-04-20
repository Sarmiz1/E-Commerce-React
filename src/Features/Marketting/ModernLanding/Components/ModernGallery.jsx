import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import images from assets
import img1 from '../../../../assets/marketing/shoe-stealth.png';
import img2 from '../../../../assets/marketing/cat-sneakers.png';
import img3 from '../../../../assets/marketing/neural-preview.png';
import img4 from '../../../../assets/marketing/hero-blur.png';
import img5 from '../../../../assets/marketing/cat-fashion.png';

gsap.registerPlugin(ScrollTrigger);

const GALLERY_ITEMS = [
  { 
    id: 1, 
    title: "Strada Café", 
    subtitle: "Parisian café canteen, where you can taste exceptional coffees and simple, gourmet, colorful and seasonal cuisine.", 
    price: "€75", 
    img: img1,
    tag: "FRENCH, EUROPEAN"
  },
  { 
    id: 2, 
    title: "Bleu Matin", 
    subtitle: "A small family-owned Paris restaurant & coffee shop inspired by fresh produce, vibrant flavors and good vibes.", 
    price: "€90", 
    img: img2,
    tag: "FRESH, VIBRANT"
  },
  { 
    id: 3, 
    title: "The Collective", 
    subtitle: "Modern shared spaces designed for creativity and collaboration in the heart of the city.", 
    price: "€120", 
    img: img3,
    tag: "CREATIVE, SPACE"
  },
  { 
    id: 4, 
    title: "Urban Loft", 
    subtitle: "Minimalist living with maximum style. Experience the pinnacle of urban industrial design.", 
    price: "€250", 
    img: img4,
    tag: "MODERN, LIVING"
  },
  { 
    id: 5, 
    title: "Gourmet Lab", 
    subtitle: "Experimental dining where science meets culinary art for an unforgettable sensory experience.", 
    price: "€180", 
    img: img5,
    tag: "CULINARY, ART"
  }
];

export default function ModernGallery() {
  const containerRef = useRef(null);
  const horizontalRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.gallery-item');
      
      const scrollTween = gsap.to(horizontalRef.current, {
        x: () => -(horizontalRef.current.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          end: () => "+=" + horizontalRef.current.scrollWidth,
        }
      });

      // Individual parallax/reveal effects
      items.forEach((item, i) => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title');

        // Image parallax inside its container
        gsap.to(img, {
          x: 60,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            containerAnimation: scrollTween,
            scrub: true,
          }
        });

        // Title parallax
        gsap.fromTo(title, 
          { x: -100 },
          { 
            x: 100, 
            ease: "none",
            scrollTrigger: {
              trigger: item,
              containerAnimation: scrollTween,
              scrub: true,
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-[#0E0E10]">
      {/* Background large number or text can go here */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 text-[30vw] font-black text-white/[0.02] pointer-events-none select-none uppercase">
        Explore
      </div>

      <div ref={horizontalRef} className="flex h-screen items-center px-[10vw] gap-[15vw] will-change-transform">
        {GALLERY_ITEMS.map((item, idx) => (
          <div 
            key={item.id} 
            className="gallery-item flex-shrink-0 w-[80vw] md:w-[65vw] lg:w-[45vw] h-[70vh] flex flex-col justify-center relative"
          >
            {/* Tag / Index */}
            <div className="absolute -top-12 left-0 flex items-center gap-4">
              <span className="text-blue-600 font-mono text-sm tracking-tighter">0{idx + 1}</span>
              <div className="w-12 h-px bg-blue-600/30" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{item.tag}</span>
            </div>

            {/* Image Container */}
            <div className="relative w-full h-full overflow-hidden rounded-[2px] shadow-2xl group">
               <img 
                 src={item.img} 
                 alt={item.title} 
                 className="w-full h-full object-cover scale-110 transition-transform duration-700 group-hover:scale-100"
               />
               {/* Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </div>

            {/* Text Overlay - Replicating the "Strada Café" look */}
            <div className="absolute bottom-0 left-0 translate-y-1/2 md:translate-y-1/3 z-20 w-full pointer-events-none">
              <h2 className="gallery-title text-7xl md:text-9xl lg:text-[10rem] font-serif font-black text-white leading-none tracking-tighter mix-blend-difference">
                {item.title}
              </h2>
            </div>

            {/* Subtitle & Price */}
            <div className="mt-20 md:mt-32 max-w-sm ml-auto text-right">
               <p className="gallery-desc text-sm md:text-base text-white/60 leading-relaxed font-light">
                 {item.subtitle}
               </p>
               <div className="mt-6 flex items-center justify-end gap-4">
                 <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Average Bill</div>
                 <div className="text-xl font-serif text-white italic">{item.price}</div>
               </div>
            </div>
          </div>
        ))}

        {/* Final Slide */}
        <div className="flex-shrink-0 w-[50vw] flex items-center justify-center">
            <button className="group relative">
                <div className="text-[8vw] font-black text-white/10 group-hover:text-blue-600 transition-colors duration-500">Discover More</div>
                <div className="absolute bottom-0 left-0 w-0 h-2 bg-blue-600 transition-all duration-500 group-hover:w-full" />
            </button>
        </div>
      </div>
    </section>
  );
}
