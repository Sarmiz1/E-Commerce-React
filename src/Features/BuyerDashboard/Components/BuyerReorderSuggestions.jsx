import { useState } from 'react';
import { useTheme } from '../../../Store/useThemeStore';
import { useBuyer } from '../context/BuyerContext';
import { BIcon } from './BuyerIcon';
import { ReorderSuggestionCard } from './ReorderSuggestionCard';

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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {reorders.map((item, index) => (
              <ReorderSuggestionCard
                key={item.id}
                item={item}
                index={index}
                status={added[item.id]}
                onReorder={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
