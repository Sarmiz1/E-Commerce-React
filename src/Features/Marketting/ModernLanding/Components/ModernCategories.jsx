import { memo, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import fashionImg from '../../../../assets/marketing/cat-fashion.png';
import sneakersImg from '../../../../assets/marketing/cat-sneakers.png';

const MarqueeText = ({ children, direction = 1 }) => {
  return (
    <div className="flex whitespace-nowrap overflow-hidden select-none py-4">
      <motion.div
        animate={{ x: direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="flex whitespace-nowrap text-[8rem] md:text-[12rem] font-black uppercase tracking-tighter"
      >
        <span className="mr-8 text-transparent [-webkit-text-stroke:2px_rgba(156,163,175,0.3)] dark:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)] hover:text-blue-500 hover:[-webkit-text-stroke:0px] transition-colors duration-500 cursor-default">
          {children}
        </span>
        <span className="mr-8 text-transparent [-webkit-text-stroke:2px_rgba(156,163,175,0.3)] dark:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)] hover:text-blue-500 hover:[-webkit-text-stroke:0px] transition-colors duration-500 cursor-default">
          {children}
        </span>
        <span className="mr-8 text-transparent [-webkit-text-stroke:2px_rgba(156,163,175,0.3)] dark:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)] hover:text-blue-500 hover:[-webkit-text-stroke:0px] transition-colors duration-500 cursor-default">
          {children}
        </span>
        <span className="mr-8 text-transparent [-webkit-text-stroke:2px_rgba(156,163,175,0.3)] dark:[-webkit-text-stroke:2px_rgba(255,255,255,0.1)] hover:text-blue-500 hover:[-webkit-text-stroke:0px] transition-colors duration-500 cursor-default">
          {children}
        </span>
      </motion.div>
    </div>
  );
};

const ModernCategories = memo(function ModernCategories() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "High Fashion",
      desc: "Curated luxury collections",
      image: fashionImg,
      size: "large",
      link: "/high-fashion"
    },
    {
      title: "Sneakers",
      desc: "Limited drops & grail kicks",
      image: sneakersImg,
      size: "small",
      link: "/sneakers"
    },
    {
      title: "Electronics",
      desc: "Next-gen tech gear",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
      size: "small",
      link: "/electronics"
    },
    {
      title: "Beauty",
      desc: "Ethical & effective care",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
      size: "medium",
      link: "/beauty"
    },
    {
      title: "Accessories",
      desc: "The finishing touches",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      size: "medium",
      link: "/accessories"
    },
    {
      title: "Home Decor",
      desc: "Minimalist living spaces",
      image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=800",
      size: "medium",
      link: "/home-decor"
    }
  ];

  return (
    <section id="categories" className="py-32 bg-white dark:bg-[#0E0E10] transition-colors relative overflow-hidden">
      
      {/* INFINITE MARQUEE BACKGROUND */}
      <div className="absolute top-10 left-0 w-full z-0 opacity-50 dark:opacity-30 pointer-events-none">
        <MarqueeText direction={1}>EXPLORE COLLECTIONS • TRENDING NOW •</MarqueeText>
      </div>

      <div className="w-full px-6 md:px-12 relative z-10 mt-20 md:mt-40">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-blue-600 font-bold tracking-widest text-xs uppercase"
            >
              Curated Collections
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-bold mt-4 text-gray-900 dark:text-white tracking-tight"
            >
              Everything You Need.
            </motion.h2>
          </div>
          <button 
            className="flex items-center gap-2 text-blue-600 font-bold group px-6 py-3 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            onClick={() => navigate('/products')}
          >
            View all categories
            <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {/* MASONRY-STYLE GRID WITH SPOTLIGHT */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className={`relative rounded-[32px] overflow-hidden group cursor-pointer border border-gray-200/50 dark:border-white/10 ${
                cat.size === 'large' ? 'md:col-span-2 md:row-span-2' : 
                cat.size === 'medium' ? 'md:col-span-2 md:row-span-1' : 
                'md:col-span-1 md:row-span-1'
              }`}
            >
              <img 
                src={cat.image} 
                alt={cat.title} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 transition-opacity duration-500">
                <motion.div
                   initial={false}
                   className="transform transition-transform duration-500 group-hover:-translate-y-2"
                >
                  <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{cat.title}</h3>
                  <p className="text-white/70 text-base mb-4 font-medium">{cat.desc}</p>
                  <div 
                    className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0"
                    onClick={() => navigate(`/products`)}
                  >
                    Explore Collection <ArrowUpRight size={16} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default ModernCategories;
