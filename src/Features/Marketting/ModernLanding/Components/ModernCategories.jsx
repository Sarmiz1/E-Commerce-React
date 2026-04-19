import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import fashionImg from '../../../../assets/marketing/cat-fashion.png';
import sneakersImg from '../../../../assets/marketing/cat-sneakers.png';

export default function ModernCategories() {
  const categories = [
    {
      title: "High Fashion",
      desc: "Curated luxury collections",
      image: fashionImg,
      size: "large",
      link: "/products"
    },
    {
      title: "Sneakers",
      desc: "Limited drops & grail kicks",
      image: sneakersImg,
      size: "small",
      link: "/products"
    },
    {
      title: "Electronics",
      desc: "Next-gen tech gear",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
      size: "small",
      link: "/products"
    },
    {
      title: "Beauty",
      desc: "Ethical & effective care",
      image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800",
      size: "medium",
      link: "/products"
    },
    {
      title: "Accessories",
      desc: "The finishing touches",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      size: "medium",
      link: "/products"
    },
    {
      title: "Home Decor",
      desc: "Minimalist living spaces",
      image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=800",
      size: "medium",
      link: "/products"
    }
  ];

  return (
    <section id="categories" className="py-24 bg-white dark:bg-[#0E0E10] transition-colors">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-blue-600 font-bold tracking-widest text-xs uppercase"
            >
              Curated Collections
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mt-4 text-gray-900 dark:text-white"
            >
              Everything You Need.
            </motion.h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-blue-600 font-bold group">
            View all categories
            <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {/* MASONRY-STYLE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-[32px] overflow-hidden group cursor-pointer ${
                cat.size === 'large' ? 'md:col-span-2 md:row-span-2' : 
                cat.size === 'medium' ? 'md:col-span-2 md:row-span-1' : 
                'md:col-span-1 md:row-span-1'
              }`}
            >
              <img 
                src={cat.image} 
                alt={cat.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-white mb-1">{cat.title}</h3>
                <p className="text-white/60 text-sm mb-4">{cat.desc}</p>
                <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  Explore Collection <ArrowUpRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
