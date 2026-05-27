import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { fmtFull } from '../utils/fmt';
import { BIcon } from './BuyerIcon';

export function ProductResult({ item, delay }) {
  const { colors, isDark } = useTheme();
  const [added, setAdded] = useState(false);
  const hue = item.name.charCodeAt(0) * 7 % 360;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.35 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-opacity"
      style={{ background: isDark ? colors.surface.tertiary : '#F9FAFB', border: `1px solid ${colors.border.subtle}` }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: `hsl(${hue}, 45%, ${isDark ? '15%' : '94%'})` }}>
        {item.category === 'Footwear' ? '👟' : item.category === 'Tech' ? '🎧' : '👕'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: colors.text.primary }}>{item.name}</p>
        <p className="text-[10px] mt-0.5 truncate" style={{ color: colors.text.tertiary }}>{item.reason}</p>
        <p className="text-sm font-black mt-0.5" style={{ color: '#667eea' }}>{fmtFull(item.price)}</p>
      </div>
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
        onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1600); }}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: added ? 'rgba(5,150,105,0.12)' : 'linear-gradient(135deg,#667eea,#764ba2)', color: added ? '#059669' : '#fff' }}>
        <BIcon name={added ? 'check' : 'plus'} size={14} />
      </motion.button>
    </motion.div>
  );
}
