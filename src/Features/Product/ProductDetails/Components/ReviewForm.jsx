import React, { useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { IconSpinner } from '../../../../components/Icons/IconSpinner';
import ProductCard from '../../../../components/Ui/ProductCard';
import { ErrorMessage } from '../../../../components/ErrorMessage';
import { 
  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, 
  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, 
  BellIcon, CloseIcon, LockIcon 
} from './Icons';
import { 
  loadReviewerName, saveReviewerName,
} from '../Utils/productHelpers';
import InteractiveStarPicker from './InteractiveStarPicker';


// import { formatMoneyCents } from '../../../../utils/FormatMoneyCents';
// import { useCartActions } from '../../../../context/cart/CartContext';

// import { 
//   loadReviewerName, saveReviewerName, getAvatarGradient, 
//   computeRatingDistribution, computeDemandScore, generateSparklinePoints, 
//   seededRand, savePriceAlert, hasPriceAlert
// } from '../Utils/productHelpers';
// import { useMagnetic } from '../Hooks/useMagnetic';


// ─── ReviewForm ───────────────────────────────────────────────────────────────
export function ReviewForm({ onSubmit, user }) {
  const isAuth = Boolean(user?.name || user?.email);
  const initName = isAuth ? (user.name || user.email?.split("@")[0] || "") : loadReviewerName();
  const [name, setName] = useState(initName);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim() || stars === 0 || !text.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    if (!isAuth) saveReviewerName(name.trim());
    onSubmit({ id: `user-${Date.now()}`, name: name.trim(), stars, text: text.trim(), date: "Just now", verified: isAuth });
    setStars(0); setText("");
    setSubmitting(false); setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const inputStyle = {
    background: "var(--pd-input-bg)",
    border: "1px solid var(--pd-input-bdr)",
    color: "var(--cream)",
    fontFamily: "Jost,sans-serif",
    fontSize: 13,
    borderRadius: 10,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-5"
      style={{ background: "var(--pd-s1)", border: "1px solid var(--pd-b2)" }}>
      <p className="text-sm font-medium" style={{ color: "var(--platinum)", fontFamily: "Cormorant Garamond,serif", fontSize: 16 }}>Share Your Experience</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <input type="text" placeholder="Your name" value={name}
            onChange={e => !isAuth && setName(e.target.value)} readOnly={isAuth} maxLength={40}
            className="w-full px-4 py-2.5" style={{ ...inputStyle, paddingRight: isAuth ? "2.5rem" : undefined, cursor: isAuth ? "default" : "text" }}
            onFocus={e => e.target.style.borderColor = "var(--pd-input-fcs)"}
            onBlur={e => e.target.style.borderColor = "var(--pd-input-bdr)"} />
          {isAuth && <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#4ade80" }}><LockIcon /></div>}
        </div>
        <div className="flex items-center"><InteractiveStarPicker value={stars} onChange={setStars} /></div>
      </div>

      {isAuth && (
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(74,222,128,0.06)", color: "#4ade80" }}>
          <CheckIcon className="w-3 h-3" />
          Reviewing as <strong>{name}</strong> · Verified
        </div>
      )}

      <textarea placeholder="Describe your experience in detail…" value={text} onChange={e => setText(e.target.value)}
        rows={3} maxLength={500} className="w-full px-4 py-2.5 resize-none" style={inputStyle}
        onFocus={e => e.target.style.borderColor = "var(--pd-input-fcs)"}
        onBlur={e => e.target.style.borderColor = "var(--pd-input-bdr)"} />

      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{text.length}/500</span>
        <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!(name.trim() && stars > 0 && text.trim() && !submitting)}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 uppercase tracking-wider"
          style={{
            fontFamily: "Jost,sans-serif",
            background: submitted ? "linear-gradient(135deg,#059669,#047857)"
              : !(name.trim() && stars > 0 && text.trim()) ? "var(--pd-s2)"
                : "linear-gradient(135deg,#C9A96E,#A8834A)",
            color: submitted ? "#fff" : !(name.trim() && stars > 0 && text.trim()) ? "var(--mist)" : "var(--obsidian)",
            cursor: !(name.trim() && stars > 0 && text.trim()) ? "not-allowed" : "pointer",
          }}>
          {submitting ? <><SpinnerIcon />Submitting…</>
            : submitted ? <><CheckIcon />Submitted!</>
              : "Submit Review"}
        </motion.button>
      </div>
    </form>
  );
}