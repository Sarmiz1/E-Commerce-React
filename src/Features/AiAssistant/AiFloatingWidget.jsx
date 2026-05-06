import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Send, Plus } from 'lucide-react';
import { useTheme } from "../../Store/useThemeStore";

export default function AiFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, colors } = useTheme();

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
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group overflow-hidden"
        style={{ background: colors.cta.primary, color: colors.cta.primaryText, boxShadow: `0 8px 30px ${colors.cta.primary}60` }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative">
              <MessageSquare size={24} fill="currentColor" className="opacity-20" />
              <Sparkles size={24} className="absolute inset-0" style={{ color: colors.cta.primaryText }} fill="currentColor" />
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
            className="fixed z-[100000] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[350px] md:h-[500px] md:max-h-[80vh] md:max-w-[90vw] md:rounded-[32px] md:border"
            style={{ background: colors.surface.elevated, borderColor: colors.border.default }}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between" style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Sparkles size={20} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold">Woosho AI</h4>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Online Assistant</p>
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
            <div className="flex-1 overflow-y-auto p-5 space-y-6" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(249,250,251,0.5)' }}>
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl rounded-tl-none border text-sm max-w-[85%] shadow-sm" style={{ background: colors.surface.secondary, borderColor: colors.border.subtle, color: colors.text.primary }}>
                  Hi there! I'm your AI shopping guide. Looking for something specific today?
                </div>
              </div>

              {/* Mock AI Response */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <Sparkles size={12} style={{ color: colors.cta.primary }} />
                   <span className="text-[10px] uppercase font-bold" style={{ color: colors.cta.primary }}>Intelligence</span>
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none shadow-lg" style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
                  <p className="text-sm font-medium">I can help you find the perfect product. Try describing what you need!</p>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t" style={{ borderColor: colors.border.subtle, background: colors.surface.primary }}>
              <div className="rounded-2xl p-1.5 flex items-center gap-2 border" style={{ background: colors.surface.tertiary, borderColor: colors.border.subtle }}>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: colors.surface.secondary, color: colors.text.tertiary }}>
                  <Plus size={18} />
                </button>
                <input 
                  type="text" 
                  placeholder="Ask me anything..." 
                  className="bg-transparent border-none focus:outline-none flex-1 text-xs"
                  style={{ color: colors.text.primary }}
                />
                <button className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ background: colors.cta.primary, color: colors.cta.primaryText }}>
                   <Send size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
