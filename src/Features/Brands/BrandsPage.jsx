import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ModernNavbar from '../Marketting/ModernLanding/SharedComponents/ModernNavbar';
import { ModernFooter } from '../Marketting/ModernLanding/SharedComponents/ModernFooter';

gsap.registerPlugin(ScrollTrigger);

const FILTERS = ["All", "Streetwear", "Sneakers", "Luxury", "Tech", "Essentials", "Emerging Brands"];

const BRANDS = [
  { id: 'nike', name: 'NIKE', type: 'large', category: 'Sneakers', tagline: 'Just Do It.', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200' },
  { id: 'offwhite', name: 'OFF-WHITE', type: 'medium', category: 'Luxury', tagline: 'Defining the grey area.', img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=800' },
  { id: 'supreme', name: 'SUPREME', type: 'medium', category: 'Streetwear', tagline: 'New York skate culture.', img: 'https://images.unsplash.com/photo-1552346154-21d8212001bb?auto=format&fit=crop&q=80&w=800' },
  { id: 'sony', name: 'SONY', type: 'small', category: 'Tech', tagline: 'Be Moved.', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600' },
  { id: 'arcteryx', name: 'ARC\'TERYX', type: 'small', category: 'Streetwear', tagline: 'Evolution in action.', img: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&q=80&w=600' },
  { id: 'dior', name: 'DIOR', type: 'small', category: 'Luxury', tagline: 'Haute couture forever.', img: 'https://images.unsplash.com/photo-1563214532-6e2730fb5eec?auto=format&fit=crop&q=80&w=600' },
  { id: 'kith', name: 'KITH', type: 'small', category: 'Emerging Brands', tagline: 'Just us.', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
];

export default function BrandsPage() {
  const mainRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#050505';
    
    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal-up', 
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power4.out', stagger: 0.1,
          scrollTrigger: { trigger: '#brand-grid', start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      );
      
      gsap.fromTo('.featured-brand-text',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#featured-brand', start: 'top 75%' } }
      );
      
      gsap.fromTo('.featured-brand-img',
        { x: 50, opacity: 0, scale: 0.95 },
        { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#featured-brand', start: 'top 75%' } }
      );
    }, mainRef);

    return () => {
      ctx.revert();
      document.body.style.backgroundColor = '';
    };
  }, []);

  const filteredBrands = activeFilter === "All" ? BRANDS : BRANDS.filter(b => b.category === activeFilter);

  return (
    <div ref={mainRef} className="bg-[#050505] text-white min-h-screen selection:bg-blue-600/30" style={{ fontFamily: "'Inter', sans-serif" }}>
      <ModernNavbar navLinks={[
        { label: 'Shop',       href: '/products' },
        { label: 'Brands',     href: '/brands' },
        { label: 'Sellers',    href: '/seller' },
        { label: 'Features',   href: '/#platform' },
      ]} />

      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=2000" 
            alt="Brands Background" 
            className="w-full h-full object-cover scale-105"
          />
        </div>
        
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white mb-6 leading-[0.9]"
          >
            The Brands <br/> That Define <br/> Culture.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 font-medium mb-10 max-w-2xl uppercase tracking-widest"
          >
            Curated labels. Premium standards. No noise.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="px-10 py-5 bg-white text-black text-lg font-bold uppercase tracking-widest rounded-none hover:bg-blue-600 hover:text-white transition-colors duration-300"
            onClick={() => document.getElementById('brand-grid')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore All Brands
          </motion.button>
        </div>
      </section>

      {/* 2. FEATURED BRAND (Statement Section) */}
      <section id="featured-brand" className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto border-b border-white/10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="featured-brand-text">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-[0.3em] mb-6">Featured Label</h3>
            <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-8 leading-none">PRADA <br/> LINEA <br/> ROSSA</h2>
            <p className="text-2xl text-gray-400 max-w-md mb-12 font-medium leading-relaxed">
              Technical precision meets avant-garde luxury. The definitive uniform for the modern metropolis.
            </p>
            <Link to="/brands/prada" className="inline-flex items-center gap-3 text-xl font-bold uppercase tracking-widest hover:text-blue-500 transition-colors group">
              Shop This Brand 
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          <div className="featured-brand-img relative h-[600px] lg:h-[800px] w-full bg-zinc-900 group overflow-hidden">
             <img src="https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&q=80&w=1200" alt="Prada" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
               <span className="text-white font-black text-5xl uppercase tracking-tighter">FW26 Collection</span>
             </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORY FILTER BAR */}
      <section className="sticky top-20 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/10 py-6">
        <div className="max-w-[1600px] mx-auto px-6 overflow-x-auto scrollbar-hide flex gap-4">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                activeFilter === filter 
                  ? 'bg-white text-black' 
                  : 'bg-transparent text-gray-400 border border-white/20 hover:border-white hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* 3. BRAND GRID (Dynamic Layout) */}
      <section id="brand-grid" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[400px] gap-6">
          {filteredBrands.map((brand) => (
            <Link 
              to={`/brands/${brand.id}`} 
              key={brand.id}
              className={`reveal-up group relative overflow-hidden bg-zinc-900 block ${
                brand.type === 'large' ? 'md:col-span-4 row-span-2' : 
                brand.type === 'medium' ? 'md:col-span-2' : 
                'md:col-span-1'
              }`}
            >
              <img src={brand.img} alt={brand.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-40" />
              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest">
                    {brand.category}
                  </span>
                </div>
                <div>
                  <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-2">{brand.name}</h3>
                  <p className="text-lg text-gray-300 font-medium mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                    {brand.tagline}
                  </p>
                  <div className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                    Shop Brand <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ModernFooter />
    </div>
  );
}
