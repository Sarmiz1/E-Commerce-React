import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Link, useNavigate } from 'react-router-dom'

import { IconSpinner } from '../../../../Components/Icons/IconSpinner';
import ProductCard from '../../../../Components/Ui/ProductCard';
import { ErrorMessage } from '../../../../Components/ErrorMessage';
import { 
  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, 
  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, 
  BellIcon, CloseIcon, LockIcon 
} from './Icons';



// ─── ProductNotFound ──────────────────────────────────────────────────────────
export function ProductNotFound() {
  const navigate = useNavigate();
  return (
    <div className="pd-root min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "var(--pd-page)" }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 180 }}>
        <p className="pd-display text-7xl font-light mb-6" style={{ color: "var(--gold)" }}>◇</p>
        <h1 className="pd-display text-4xl font-light mb-4" style={{ color: "var(--cream)" }}>Not Found</h1>
        <p className="mb-8 text-sm" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>This item doesn't exist or may have been removed.</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/products")}
          className="font-semibold px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest"
          style={{ fontFamily: "Jost,sans-serif", background: "linear-gradient(135deg,#C9A96E,#A8834A)", color: "var(--obsidian)" }}>
          Browse Collection →
        </motion.button>
      </motion.div>
    </div>
  );
}