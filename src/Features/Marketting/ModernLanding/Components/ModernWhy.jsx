import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Lock, Globe, BarChart3, Users } from 'lucide-react';

export default function ModernWhy() {
  const benefits = [
    {
      group: "For Buyers",
      items: [
        { title: "AI Personalization", desc: "Your taste, perfectly understood.", icon: <Zap /> },
        { title: "Saves Time", desc: "Less scrolling, more discovery.", icon: <Globe /> },
        { title: "Secure Checkout", desc: "Zero-knowledge encryption.", icon: <Lock /> },
        { title: "Fast Delivery", desc: "Global logistics at AI speed.", icon: <Globe /> }
      ]
    },
    {
      group: "For Sellers",
      items: [
        { title: "Predictive Demand", desc: "Know what will sell before you stock.", icon: <BarChart3 /> },
        { title: "Lower Ad Spend", desc: "High-intent matching reduces CAC.", icon: <Users /> },
        { title: "Verified Customers", desc: "Say goodbye to fraudulent orders.", icon: <ShieldCheck /> },
        { title: "Yield Management", desc: "Maximize margin on every sale.", icon: <BarChart3 /> }
      ]
    }
  ];

  return (
    <section id="why-woosho" className="py-24 bg-gray-50 dark:bg-[#131315] transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white"
          >
            Why Woosho Works
          </motion.h2>
          <p className="mt-6 text-xl text-gray-500 dark:text-gray-400">The first platform built for the relationship between buyer and seller.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {benefits.map((group, gIdx) => (
            <motion.div 
               key={group.group}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: gIdx * 0.2 }}
               className="p-10 rounded-[40px] bg-white dark:bg-[#19191C] border border-gray-100 dark:border-white/5"
            >
              <h3 className={`text-2xl font-bold mb-10 ${gIdx === 0 ? 'text-blue-600' : 'text-green-500'}`}>
                {group.group}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {group.items.map((item, iIdx) => (
                  <div key={item.title} className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      gIdx === 0 ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600' : 'bg-green-50 dark:bg-green-600/10 text-green-500'
                    }`}>
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Trusted By strip */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 opacity-30 text-gray-900 dark:text-white transition-colors duration-500">
           {[1,2,3,4].map(i => (
             <div key={i} className="text-2xl font-black italic tracking-tighter">PARTNER_{i}</div>
           ))}
        </div>
      </div>
    </section>
  );
}
