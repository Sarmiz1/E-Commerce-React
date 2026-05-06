import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatMoneyCents } from '../../../../utils/FormatMoneyCents';
import { savePriceAlert } from '../Utils/productHelpers';
import { 
  BellIcon, CloseIcon, SpinnerIcon,
} from './Icons';


// ─── PriceAlertModal ──────────────────────────────────────────────────────────
export function PriceAlertModal({ product, onClose }) {
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState(Math.round(product.priceCents * 0.8));
  const [alertType, setAlertType] = useState("price_drop");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async e => {
    e.preventDefault(); if (!email.trim()) return;
    setSaving(true); await new Promise(r => setTimeout(r, 600));
    savePriceAlert({ productId: product.id, productName: product.name, email: email.trim(), targetPriceCents: targetPrice, type: alertType, createdAt: new Date().toISOString() });
    setSaving(false); setSaved(true); setTimeout(() => onClose(), 1800);
  };

  const inputStyle = { background: "var(--pd-input-bg)", border: "1px solid var(--pd-input-bdr)", color: "var(--cream)", fontFamily: "Jost,sans-serif", fontSize: 13, borderRadius: 10, outline: "none", transition: "border-color 0.2s", padding: "12px 16px", width: "100%" };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }} />
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }} onClick={e => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: "var(--pd-overlay)", border: "1px solid var(--pd-b5)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 transition-colors" style={{ color: "var(--mist)" }}><CloseIcon className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(201,169,110,0.1)" }}>
            <BellIcon className="w-5 h-5" style={{ color: "var(--gold)" }} />
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--cream)", fontFamily: "Cormorant Garamond,serif", fontSize: 15 }}>Price Alert</p>
            <p className="text-xs" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>We'll notify you when the price drops</p>
          </div>
        </div>
        {saved ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">◆</div>
            <p className="font-medium" style={{ color: "var(--gold)", fontFamily: "Cormorant Garamond,serif", fontSize: 18 }}>Alert set.</p>
            <p className="text-xs mt-1" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>We'll email {email}</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--pd-s4)", border: "1px solid var(--pd-b2)" }}>
              <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" onError={e => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=?"; }} />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{product.name}</p>
                <p className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "Cormorant Garamond,serif", fontSize: 13 }}>Current: {formatMoneyCents(product.priceCents)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[{ id: "price_drop", label: "Price Drop" }, { id: "back_in_stock", label: "Back in Stock" }].map(opt => (
                <button key={opt.id} type="button" onClick={() => setAlertType(opt.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{ fontFamily: "Jost,sans-serif", background: alertType === opt.id ? "rgba(201,169,110,0.1)" : "transparent", border: `1px solid ${alertType === opt.id ? "var(--gold)" : "var(--pd-b3)"}`, color: alertType === opt.id ? "var(--gold)" : "var(--silver)" }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--pd-input-fcs)"} onBlur={e => e.target.style.borderColor = "var(--pd-input-bdr)"} />
            {alertType === "price_drop" && (
              <div>
                <label className="text-xs mb-2 block" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>Alert at: {formatMoneyCents(targetPrice)}</label>
                <input type="range" className="pd-range w-full" min={Math.round(product.priceCents * 0.3)} max={product.priceCents} value={targetPrice} onChange={e => setTargetPrice(Number(e.target.value))} />
              </div>
            )}
            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!email.trim() || saving}
              className="w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
              style={{ fontFamily: "Jost,sans-serif", background: !email.trim() ? "var(--pd-s2)" : "linear-gradient(135deg,#C9A96E,#A8834A)", color: !email.trim() ? "var(--mist)" : "var(--obsidian)" }}>
              {saving ? <><SpinnerIcon />Saving…</> : <><BellIcon className="w-3.5 h-3.5" />Set Alert</>}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
