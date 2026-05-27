import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../../Store/useThemeStore";
import { useBuyer } from '../context/BuyerContext';
import { fmtFull } from '../utils/fmt';
import { BIcon } from './BuyerIcon';

const AI_TAG_COLORS = {
  'Best Time Soon':  { bg: 'rgba(102,126,234,0.1)', color: '#667eea' },
  'Low Stock':       { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  'Out of Stock':    { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  'Price Drop':      { bg: 'rgba(5,150,105,0.1)',   color: '#059669' },
  'Alt. Available':  { bg: 'rgba(139,92,246,0.1)',  color: '#8b5cf6' },
};

export default function BuyerWishlist() {
  const { colors, isDark } = useTheme();
  const { wishlist: liveWishlist, reorders: REORDER_SUGGESTIONS, removeFromWishlist } = useBuyer();
  const WISHLIST = liveWishlist ?? [];
  const [localWishlist, setLocalWishlist] = useState(null);
  const wishlist = localWishlist ?? WISHLIST;
  const [alerts, setAlerts] = useState({});
  const [added, setAdded] = useState({});

  const remove = async (id) => {
    setLocalWishlist(w => (w ?? WISHLIST).filter(i => i.id !== id));
    await removeFromWishlist(id);
  };

  const addToCart = async (id) => {
    setAdded(a => ({ ...a, [id]: 'loading' }));
    await new Promise(r => setTimeout(r, 800));
    setAdded(a => ({ ...a, [id]: 'done' }));
    setTimeout(() => setAdded(a => ({ ...a, [id]: null })), 1800);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: colors.text.primary }}>Wishlist</h2>
        <span className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>{wishlist.length} items</span>
      </div>

      {/* Smart Reorder Suggestions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.06))', border: '1px solid rgba(102,126,234,0.15)' }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(102,126,234,0.1)' }}>
          <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }}>✦</motion.span>
          <p className="font-bold text-sm" style={{ color: colors.text.primary }}>AI Reorder Suggestions</p>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full ml-auto"
            style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>Predictive</span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {REORDER_SUGGESTIONS.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex-1 rounded-xl p-4 flex flex-col gap-2"
              style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
              <p className="text-sm font-bold" style={{ color: colors.text.primary }}>{s.name}</p>
              <p className="text-[11px]" style={{ color: '#667eea' }}>{s.reason}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-black" style={{ color: colors.text.primary }}>{fmtFull(s.price)}</span>
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                  <BIcon name="repeat" size={12} /> Reorder
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Wishlist grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {wishlist.map((item, i) => {
            const tag = AI_TAG_COLORS[item.tag] || {};
            const savedPct = item.originalPrice > item.price ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
            const itemName = item.name || item.products?.name || 'Unknown Product';
            const hue = itemName.charCodeAt(0) * 7 % 360;

            return (
              <motion.div key={item.id} layout
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden shadow-sm flex flex-col"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
                {/* Visual */}
                <div className="h-40 flex items-center justify-center relative overflow-hidden"
                  style={{ background: `hsl(${hue}, 40%, ${isDark ? '14%' : '96%'})` }}>
                  {(item.products?.image || item.image) ? (
                    <img src={item.products?.image || item.image} alt={itemName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl select-none">
                      {itemName.toLowerCase().includes('shoe') || itemName.toLowerCase().includes('oxford') ? '👟'
                        : itemName.toLowerCase().includes('watch') ? '⌚'
                        : '👕'}
                    </span>
                  )}
                  {savedPct > 0 && (
                    <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: '#059669', color: '#fff' }}>-{savedPct}%</span>
                  )}
                  {/* Remove button */}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => remove(item.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow"
                    style={{ background: colors.surface.elevated, color: '#ef4444' }}>
                    <BIcon name="x" size={13} />
                  </motion.button>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* AI tag */}
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full self-start"
                    style={{ background: tag.bg, color: tag.color }}>
                    ✦ {item.tag}
                  </span>

                  <p className="font-bold text-sm" style={{ color: colors.text.primary }}>{itemName}</p>

                  {/* AI note */}
                  <p className="text-[11px] leading-relaxed" style={{ color: colors.text.tertiary }}>{item.aiNote}</p>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base" style={{ color: colors.text.primary }}>{fmtFull(item.price)}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs line-through" style={{ color: colors.text.tertiary }}>{fmtFull(item.originalPrice)}</span>
                    )}
                  </div>

                  {/* Stock status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: item.inStock ? '#059669' : '#ef4444' }}>
                      {item.inStock ? (item.stock < 5 ? `Only ${item.stock} left!` : `${item.stock} in stock`) : 'Out of stock'}
                    </span>

                    {/* Price alert toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]" style={{ color: colors.text.tertiary }}>Alert</span>
                      <motion.button onClick={() => setAlerts(a => ({ ...a, [item.id]: !a[item.id] }))}
                        className="relative w-9 h-5 rounded-full"
                        style={{ background: alerts[item.id] ? '#667eea' : colors.border.strong }}>
                        <motion.div animate={{ x: alerts[item.id] ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                      </motion.button>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                    onClick={() => item.inStock && addToCart(item.id)}
                    disabled={!item.inStock}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: !item.inStock ? (isDark ? colors.surface.tertiary : '#F3F4F6')
                        : added[item.id] === 'done' ? 'rgba(5,150,105,0.1)'
                        : 'linear-gradient(135deg,#667eea,#764ba2)',
                      color: !item.inStock ? colors.text.tertiary
                        : added[item.id] === 'done' ? '#059669'
                        : '#fff',
                    }}>
                    {added[item.id] === 'loading'
                      ? <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full block" /> Adding…</>
                      : added[item.id] === 'done' ? <><BIcon name="check" size={15} /> Added to Cart!</>
                      : !item.inStock ? 'Notify Me When Back'
                      : <><BIcon name="cart" size={15} /> Add to Cart</>}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
