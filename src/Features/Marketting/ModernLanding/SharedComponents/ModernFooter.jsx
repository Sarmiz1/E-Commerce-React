import { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ModernCTA = memo(function ModernCTA() {
  return (
    <section className="py-24 bg-white dark:bg-[#0E0E10] transition-colors">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative rounded-[48px] bg-blue-600 p-12 md:p-20 text-center overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]"
        >
          <div className="absolute inset-0 opacity-10 bg-grid pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Experience <br className="hidden md:block" />
              Intelligent Commerce?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                <span>Start Shopping</span>
                <Sparkles size={20} fill="currentColor" />
              </button>
              <button className="px-10 py-5 bg-blue-700/50 text-white font-bold rounded-2xl border border-white/20 hover:bg-blue-700/70 transition-all text-lg">
                Grow Your Sales
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

// ── Marketplace link columns spread across full footer width ───────────────
const FOOTER_LINKS = {
  Shop: [
    { label: 'Browse All',       to: '/products'  },
    { label: 'New Arrivals',     to: '/products/New Arrivals'  },
    { label: 'Hot Deals',        to: '/Hot Deals'  },
    { label: 'Trending Now',     to: '/Trending Now'  },
  ],
  Sellers: [
    { label: 'Become a Seller',  to: '/seller'    },
    { label: 'Analytics',        to: '/analytics' },
    { label: 'Seller Support',   to: '/support/#seller'    },
  ],
  Categories: [
    { label: 'High Fashion',     to: '/products-category'  },
    { label: 'Sneakers',         to: '/products-category'  },
    { label: 'Electronics',      to: '/products-category'  },
    { label: 'Beauty & Care',    to: '/products-category'  },
  ],
  Company: [
    { label: 'About Woosho',     to: '/about'          },
    { label: 'Careers',          to:'careers'          },
    { label: 'Press',            to: '/press'          },
    { label: 'Contact',          to: '/contack'          },
  ],
};

export const ModernFooter = memo(function ModernFooter() {
  return (
    <footer className="pt-24 pb-12 bg-white dark:bg-[#0E0E10] border-t border-gray-100 dark:border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Top row: Brand + all link columns spanning full width ── */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-20">

          {/* Brand — 2 cols wide */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="text-white fill-white" size={18} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Woo<span className="text-blue-600">sho</span>
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed text-sm">
              Envisioning commerce that understands every individual path. Powered by AI, delivered with passion.
            </p>

            {/* Newsletter mini CTA */}
            <div className="mt-8 flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap">
                Join <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Marketplace columns — 1 col each, spreading the remaining 4 columns */}
          {Object.entries(FOOTER_LINKS).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-gray-900 dark:text-white mb-5 text-sm tracking-wide">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 dark:border-white/5 gap-4 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Woosho Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(label => (
              <button key={label} className="hover:text-blue-600 transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
});
