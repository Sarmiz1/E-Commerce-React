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
// import { 
//   loadReviewerName, saveReviewerName, getAvatarGradient, 
//   computeRatingDistribution, computeDemandScore, generateSparklinePoints, 
//   seededRand, savePriceAlert, hasPriceAlert
// } from '../Utils/productHelpers';
// import { useMagnetic } from '../Hooks/useMagnetic';


// ─── ColorSelector ────────────────────────────────────────────────────────────
export function ColorSelector({ availableColors, selectedColor, onSelect }) {
  const selectedObj = availableColors.find(c => c.name === selectedColor) || availableColors[0];
  
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="pd-chip" style={{ color: "var(--silver)" }}>Colourway</span>
        <span className="text-xs font-medium" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>
          {selectedObj?.name}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        {availableColors.map((c) => (
          <motion.button key={c.name} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(c.name)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: c.hex,
              boxShadow: selectedColor === c.name ? `0 0 0 2px var(--obsidian), 0 0 0 3.5px var(--gold)` : "none",
            }} title={c.name}>
            {selectedColor === c.name && <CheckIcon className="w-3 h-3" style={{ color: c.hex === "#f8fafc" || c.hex === "#f0f0f0" ? "#333" : "#fff" }} />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}