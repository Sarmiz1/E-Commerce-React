import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useTheme } from '../theme/ThemeContext';

const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { isDark } = useTheme();

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const isErr = t.type === 'error';
            const isInfo = t.type === 'info';
            const color = isErr ? '#ef4444' : isInfo ? '#3b82f6' : '#10b981';
            const bg = isErr ? 'rgba(239,68,68,0.1)' : isInfo ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)';
            const Icon = isErr ? FiAlertCircle : isInfo ? FiInfo : FiCheckCircle;

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="pointer-events-auto px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3.5 min-w-[300px] max-w-[400px]"
                style={{
                  background: isDark ? 'rgba(20,20,25,0.85)' : 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isErr ? 'rgba(239,68,68,0.2)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  boxShadow: isErr ? '0 10px 40px rgba(239,68,68,0.15)' : '0 10px 40px rgba(0,0,0,0.08)'
                }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: bg, color: color }}>
                  <Icon size={18} />
                </div>
                <p className="text-[13px] leading-relaxed font-semibold flex-1" style={{ color: isDark ? '#fff' : '#000' }}>
                  {t.msg}
                </p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                  style={{ color: isDark ? '#fff' : '#000' }}
                >
                  <FiX size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
