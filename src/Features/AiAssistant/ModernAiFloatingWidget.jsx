import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Send, Plus } from 'lucide-react';
import shoeImg from '../../assets/marketing/shoe-stealth.png';

export default function ModernAiFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
              <MessageSquare size={24} fill="currentColor" className="opacity-20" />
              <Sparkles size={24} className="absolute inset-0 text-white fill-white" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Subtle pulse effect */}
        <div className="absolute inset-0 bg-white/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* CHAT MODAL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed z-[100000] bg-white dark:bg-[#0E0E10] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col
              ${/* MOBILE: Full page | DESKTOP: Floating */ ""}
              inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[350px] md:h-[500px] md:max-h-[80vh] md:max-w-[90vw] md:rounded-[32px] md:border md:border-gray-100 md:dark:border-white/10
            `}
          >
            {/* Header */}
            <div className="p-6 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Sparkles size={20} fill="white" />
                </div>
                <div>
                  <h4 className="font-bold">Woosho AI</h4>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Online Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 dark:bg-black/20">
              <div className="flex justify-start">
                <div className="bg-white dark:bg-white/5 p-3.5 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5 text-sm max-w-[85%] shadow-sm text-gray-800 dark:text-gray-200">
                  Hi there! I'm your AI shopping guide. Looking for something specific today?
                </div>
              </div>

              {/* Mock AI Response based on reference */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <Sparkles size={12} className="text-blue-600" />
                   <span className="text-[10px] uppercase font-bold text-blue-600">Intelligence</span>
                </div>
                <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tl-none shadow-lg">
                  <p className="text-sm font-medium">I've found some "Stealth Vector" sneakers in your size.</p>
                </div>
                <div className="bg-white dark:bg-[#131315] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-md">
                   <div className="h-32 bg-gray-50 dark:bg-black/40 flex items-center justify-center p-2 relative">
                     <span className="absolute top-2 left-2 bg-green-500 text-[8px] font-bold text-white px-2 py-0.5 rounded-full uppercase">AI Recommendation</span>
                     <img src={shoeImg} alt="Shoe" className="h-full object-contain" />
                   </div>
                   <div className="p-3">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-gray-900 dark:text-white">Stealth Vector X1</span>
                       <span className="text-xs font-bold text-blue-600">₦48,500</span>
                     </div>
                     <button className="w-full py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg mt-2">Quick Add</button>
                   </div>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0E0E10]">
              <div className="bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5 flex items-center gap-2 border border-gray-100 dark:border-white/5">
                <button className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500">
                  <Plus size={18} />
                </button>
                <input 
                  type="text" 
                  placeholder="Ask me anything..." 
                  className="bg-transparent border-none focus:outline-none flex-1 text-xs text-gray-900 dark:text-white"
                />
                <button className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                   <Send size={16} fill="white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
