import { motion } from 'framer-motion';
import { useTheme } from '../../../Store/useThemeStore';
import { formatMoneyMinor } from '../../../utils/formatMoneyMinor';
import { BIcon } from './BuyerIcon';

export function ReorderSuggestionCard({ item, index = 0, status, onReorder }) {
  const { colors, isDark } = useTheme();
  const itemName = item.name || 'Available product';
  const hasSale = item.originalPrice > item.price;
  const image = item.image || item.products?.image;
  const hue = itemName.charCodeAt(0) * 7 % 360;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      className="flex-1 min-w-0 rounded-2xl overflow-hidden flex flex-col shadow-sm"
      style={{ background: colors.surface.elevated, border: `1px solid ${colors.border.subtle}` }}
    >
      <div
        className="h-36 relative overflow-hidden flex items-center justify-center"
        style={{ background: `hsl(${hue}, 40%, ${isDark ? '14%' : '96%'})` }}
      >
        {image ? (
          <img
            src={image}
            alt={itemName}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <BIcon name="package" size={32} style={{ color: colors.text.tertiary }} />
        )}
        {hasSale && (
          <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-1 rounded-full text-white"
            style={{ background: '#059669' }}>
            Sale
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-sm font-black line-clamp-1" style={{ color: colors.text.primary }}>{itemName}</p>
          <p className="text-[11px] leading-relaxed line-clamp-3 mt-1" style={{ color: colors.text.tertiary }}>
            {item.description}
          </p>
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: '#667eea' }}>{item.reason}</p>

        <div className="mt-auto space-y-1.5">
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-lg font-black" style={{ color: colors.text.primary }}>
              {formatMoneyMinor(item.price)}
            </span>
            {hasSale && (
              <span className="text-xs line-through pb-0.5" style={{ color: colors.text.tertiary }}>
                {formatMoneyMinor(item.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold" style={{ color: colors.text.tertiary }}>
            <span>Regular: {formatMoneyMinor(item.priceMinor)}</span>
            {hasSale && <span style={{ color: '#059669' }}>Sale: {formatMoneyMinor(item.salePriceMinor)}</span>}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onReorder(item)}
          disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl disabled:opacity-60"
          style={{
            background: status === 'done' ? 'rgba(5,150,105,0.12)' : 'linear-gradient(135deg,#667eea,#764ba2)',
            color: status === 'done' ? '#059669' : '#fff',
          }}
        >
          <BIcon name={status === 'done' ? 'check' : 'repeat'} size={12} />
          {status === 'loading' ? 'Adding...' : status === 'done' ? 'Added' : 'Reorder'}
        </motion.button>
      </div>
    </motion.article>
  );
}
