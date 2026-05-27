import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

import { IconSpinner } from '../../../../Components/Icons/IconSpinner';
import ProductCard from '../../../../Components/Ui/ProductCard';
import { ErrorMessage } from '../../../../Components/ErrorMessage';
import { 
  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, 
  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, 
  BellIcon, CloseIcon, LockIcon 
} from './Icons';


// ─── SizeSelector ─────────────────────────────────────────────────────────────
export function SizeSelector({ sizes, selectedSize, onSelect, productType }) {
  if (!sizes) return null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="pd-chip" style={{ color: "var(--silver)" }}>
            {sizes[0]?.display?.startsWith("US") ? "Calibre" : "Size"}
          </span>
          {selectedSize && (
            <span className="text-[10px] font-bold" style={{ color: "var(--gold)" }}>
              · {sizes.find(s => s.raw === selectedSize)?.display || selectedSize}
            </span>
          )}
        </div>
        {productType && (
          <button className="text-xs font-medium pd-link-hover" style={{ color: "var(--gold)", fontFamily: "Jost,sans-serif" }}>Size Guide</button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map(s => (
          <motion.button key={s.raw} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(s.raw)}
            aria-label={`Select size: ${s.display}`}
            aria-current={selectedSize === s.raw ? "true" : "false"}
            className="min-w-[52px] py-2 px-3 rounded-lg text-xs font-medium transition-all duration-250 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
            style={{
              fontFamily: "Jost,sans-serif",
              background: selectedSize === s.raw ? "var(--gold)" : "var(--pd-s2)",
              border: `1px solid ${selectedSize === s.raw ? "var(--gold)" : "var(--pd-b3)"}`,
              color: selectedSize === s.raw ? "var(--obsidian)" : "var(--platinum)",
              fontWeight: selectedSize === s.raw ? "600" : "400",
            }}>
            {s.display}
          </motion.button>
        ))}
      </div>
    </div>
  );
}