import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../../../store/useThemeStore";

const FEEDBACK = [
  { id: 1, user: "Sarah M.", item: "Silk Evening Gown", rating: 5, text: "Absolutely stunning quality. The fit is perfect and the seller shipped it the very next day. 10/10 recommend!", date: "2 days ago" },
  { id: 2, user: "James T.", item: "Mechanical Keyboard", rating: 5, text: "Switches are buttery smooth. Best purchase I've made all year.", date: "1 week ago" },
  { id: 3, user: "Elena R.", item: "Minimalist Watch", rating: 4, text: "Gorgeous design, gets me compliments every time I wear it.", date: "2 weeks ago" },
];

export default function RealPurchaseFeedbackSection() {
  const { isDark, colors } = useTheme();

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: isDark ? '#09090b' : '#fafafa' }}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 mb-2 block">Verified Reviews</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold italic" style={{ color: colors.text.primary }}>
              Real purchase feedback
            </h2>
            <p className="mt-4 text-sm font-medium" style={{ color: colors.text.secondary }}>
              Unfiltered reviews from verified buyers across the globe.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border" style={{ borderColor: colors.border.subtle }}>
            <span className="text-4xl font-black" style={{ color: colors.text.primary }}>4.9</span>
            <div className="flex flex-col">
              <span className="text-amber-500 text-lg tracking-widest">★★★★★</span>
              <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: colors.text.tertiary }}>Global Average Rating</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEEDBACK.map((fb, i) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
              className="p-8 rounded-[2rem] relative flex flex-col"
              style={{ background: colors.surface.primary, border: `1px solid ${colors.border.subtle}` }}
            >
              <div className="flex text-amber-500 text-sm mb-6">
                {Array(fb.rating).fill('★').join('')}
              </div>
              <p className="text-base font-medium mb-8 leading-relaxed italic" style={{ color: colors.text.primary }}>
                "{fb.text}"
              </p>
              <div className="mt-auto border-t pt-5 flex justify-between items-center" style={{ borderColor: colors.border.subtle }}>
                <div>
                  <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{fb.user}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest mt-1" style={{ color: colors.text.tertiary }}>Purchased: <span style={{ color: colors.text.secondary }}>{fb.item}</span></p>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 rounded-md" style={{ background: colors.surface.tertiary, color: colors.text.secondary }}>{fb.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="text-xs font-bold uppercase tracking-widest hover:underline" style={{ color: colors.text.secondary }}>
            Read all 12,000+ reviews
          </button>
        </div>
      </div>
    </section>
  );
}
