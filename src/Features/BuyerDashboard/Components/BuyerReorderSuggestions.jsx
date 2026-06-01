import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../Store/useThemeStore';
import { formatMoneyMinor } from '../../../utils/formatMoneyMinor';
import { useBuyer } from '../context/BuyerContext';
import { BIcon } from './BuyerIcon';

export default function BuyerReorderSuggestions() {
  const { colors } = useTheme();
  const {
    addProductsToCart,
    reorders = [],
    reordersLoading,
    reordersError,
    refreshReorders,
  } = useBuyer();
  const [added, setAdded] = useState({});

  const addToCart = async (item) => {
    setAdded(current => ({ ...current, [item.id]: 'loading' }));
    const result = await addProductsToCart(item);
    setAdded(current => ({ ...current, [item.id]: result?.success ? 'done' : null }));
    if (result?.success) {
      setTimeout(() => setAdded(current => ({ ...current, [item.id]: null })), 1800);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.06))', border: '1px solid rgba(102,126,234,0.15)' }}>
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(102,126,234,0.1)' }}>
        <BIcon name="sparkle" size={14} style={{ color: '#667eea' }} />
        <p className="font-bold text-sm" style={{ color: colors.text.primary }}>AI Reorder Suggestions</p>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>Predictive</span>
      </div>
      <div className="p-4">
        {reordersLoading ? (
          <p className="py-4 text-center text-sm font-semibold" style={{ color: colors.text.tertiary }}>
            Loading available data...
          </p>
        ) : reordersError ? (
          <div className="py-4 text-center">
            <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>No available data</p>
            <button type="button" onClick={() => refreshReorders?.()} className="mt-2 text-xs font-bold" style={{ color: '#667eea' }}>
              Try again
            </button>
          </div>
        ) : reorders.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm font-semibold" style={{ color: colors.text.tertiary }}>No available data</p>
            <button type="button" onClick={() => refreshReorders?.()} className="mt-2 text-xs font-bold" style={{ color: '#667eea' }}>
              Refresh suggestions
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            {reorders.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex-1 rounded-xl p-4 flex flex-col gap-2"
                style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}>
                <p className="text-sm font-bold" style={{ color: colors.text.primary }}>{item.name}</p>
                <p className="text-[11px]" style={{ color: '#667eea' }}>{item.reason}</p>
                <div className="flex items-center justify-between gap-3 mt-1">
                  <div>
                    <span className="text-base font-black" style={{ color: colors.text.primary }}>{formatMoneyMinor(item.price)}</span>
                    {item.originalPrice > item.price && (
                      <span className="ml-1.5 text-[11px] line-through" style={{ color: colors.text.tertiary }}>
                        {formatMoneyMinor(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    onClick={() => addToCart(item)}
                    disabled={added[item.id] === 'loading'}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-60"
                    style={{ background: added[item.id] === 'done' ? 'rgba(5,150,105,0.12)' : 'linear-gradient(135deg,#667eea,#764ba2)', color: added[item.id] === 'done' ? '#059669' : '#fff' }}>
                    <BIcon name={added[item.id] === 'done' ? 'check' : 'repeat'} size={12} />
                    {added[item.id] === 'loading' ? 'Adding...' : added[item.id] === 'done' ? 'Added' : 'Reorder'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
