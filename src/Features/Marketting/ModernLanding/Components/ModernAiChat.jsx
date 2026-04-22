import { memo } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Plus,
  Search,
  Sparkles,
  ShoppingCart,
  User,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import shoeImg from "../../../../assets/marketing/shoe-stealth.png";

const cta = [
  { label: 'Meet your Assistant', link: 'woosho-ai ' },
  { label: ' Learn More', link: 'buyer' }
]

const ModernAiChat = memo(function ModernAiChat() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gray-50 dark:bg-[#131315] transition-colors relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        {/* TEXT CONTENT */}
        <div className="order-2 lg:order-1">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-blue-600 font-bold tracking-widest text-xs uppercase"
          >
            Human-AI Collaboration
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mt-4 mb-6 text-gray-900 dark:text-white leading-tight"
          >
            A Shopping Assistant that{" "}
            <span className="text-blue-600">Actually Learns.</span>
          </motion.h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-[50ch] pr-4">
            Stop searching and start discovering. Describe what you need in
            plain English, and our Neural Engine finds the perfect match across
            all verified sellers.
          </p>

          <ul className="space-y-4 mb-10">
            {[
              "Multi-modal input (text & images)",
              "Budget-aware filtering",
              "Verified inventory only",
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Sparkles size={14} className="text-blue-600" />
                </div>
                {item}
              </motion.li>
            ))}
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-60  md:w-[30rem] lg:w-full">
            {cta.map((btn, i) => (
                <button className="px-8 py-4 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl hover:bg-blue-600 dark:hover:bg-gray-500"
                  key={i}
                  onClick={() => navigate(`/${btn.link}`)}
                >
                  {btn.label}
                </button>
            ))

            }

          </div>
        </div>

        {/* THE CHAT INTERFACE MOCKUP (USER REFERENCE) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2 flex justify-center"
        >
          <div className="w-full max-w-[400px] h-[750px] bg-white dark:bg-black rounded-[48px] border-[10px] border-gray-100 dark:border-[#1F1F23] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl">
                  <ArrowLeft size={18} className="text-gray-500" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  Woosho
                </span>
              </div>
              <button className="text-blue-600 font-bold text-sm">
                AI Shop
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="bg-gray-100 dark:bg-white/5 px-4 py-2.5 rounded-2xl rounded-tr-none">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    black sneakers under 50k
                  </p>
                </div>
              </div>

              {/* AI Intelligence Badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <Sparkles size={12} fill="white" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600">
                  Intelligence
                </span>
              </div>

              {/* AI Message */}
              <div className="bg-blue-50 dark:bg-blue-600/10 p-4 rounded-2xl rounded-tl-none border-l-4 border-blue-600">
                <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                  Got it. Showing 5 options for you.
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  I've filtered for performance models with high durability
                  ratings.
                </p>
              </div>

              {/* Product Card (Recommendation) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-white dark:bg-[#131315] rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-xl"
              >
                <div className="relative h-48 bg-gray-50 dark:bg-black/40 flex items-center justify-center p-4">
                  <div className="absolute top-3 left-3 bg-green-500 text-[10px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                    AI Recommendation
                  </div>
                  <img
                    src={shoeImg}
                    alt="Shoe"
                    className="h-[90%] object-contain drop-shadow-2xl mt-8 rounded-md"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                      Stealth Vector X1
                    </h4>
                    <span className="text-blue-600 font-bold">₦48,500</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                    Breathable mesh with adaptive carbon-fiber support.
                  </p>
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                    Quick Add
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Input Bar */}
            <div className="p-6 pt-2">
              <div className="bg-gray-100/80 dark:bg-white/10 rounded-3xl p-2.5 flex items-center gap-3 border border-gray-100 dark:border-white/5">
                <button className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500 group hover:bg-white dark:hover:bg-white/20 transition-all">
                  <Plus size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Refine your search..."
                  className="bg-transparent border-none focus:outline-none flex-1 text-sm text-gray-900 dark:text-white"
                />
                <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Send size={18} fill="white" />
                </button>
              </div>
            </div>

            {/* Bottom Nav Mockup */}
            <div className="px-8 py-6 flex justify-between items-center bg-gray-50/50 dark:bg-black/50 backdrop-blur-md border-t border-gray-100 dark:border-white/5">
              <button className="text-gray-400">
                <Search size={22} />
              </button>
              <button className="text-blue-600">
                <Sparkles size={26} fill="currentColor" />
              </button>
              <button className="text-gray-400">
                <ShoppingCart size={22} />
              </button>
              <button className="text-gray-400">
                <User size={22} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default ModernAiChat;
