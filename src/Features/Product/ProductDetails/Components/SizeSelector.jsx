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
export function SizeSelector({ sizes, selectedSize, onSelect }) {
  if (!sizes) return null;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="pd-chip" style={{ color: "var(--silver)" }}>{sizes[0]?.startsWith("US") ? "Calibre" : "Size"}</span>
        <button className="text-xs font-medium pd-link-hover" style={{ color: "var(--gold)", fontFamily: "Jost,sans-serif" }}>Size Guide</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map(s => (
          <motion.button key={s} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(s)}
            className="min-w-[52px] py-2 px-3 rounded-lg text-xs font-medium transition-all duration-250"
            style={{
              fontFamily: "Jost,sans-serif",
              background: selectedSize === s ? "var(--gold)" : "var(--pd-s2)",
              border: `1px solid ${selectedSize === s ? "var(--gold)" : "var(--pd-b3)"}`,
              color: selectedSize === s ? "var(--obsidian)" : "var(--platinum)",
              fontWeight: selectedSize === s ? "600" : "400",
            }}>
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}