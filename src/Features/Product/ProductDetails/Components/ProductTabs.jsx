import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { formatMoneyCents } from '../../../../Utils/formatMoneyCents';
import { IconSpinner } from '../../../../Components/Icons/IconSpinner';
import ProductCard from '../../../../Components/Ui/ProductCard';
import { ErrorMessage } from '../../../../Components/ErrorMessage';
import { 
  BagIcon, HeartIcon, ShareIcon, ChevronLeft, ChevronRight, 
  CheckIcon, SpinnerIcon, ShieldIcon, TruckIcon, RefreshIcon, 
  BellIcon, CloseIcon, LockIcon 
} from './Icons';



// ─── ProductTabs ──────────────────────────────────────────────────────────────
export function ProductTabs({ product }) {
  const [tab, setTab] = useState("description");
  const tabs = [
    { id: "description", label: "Description" }, 
    { id: "details", label: "Details" },
    { id: "shipping", label: "Shipping" }
  ];

  const description = product.description || "A premium quality product crafted with meticulous attention to detail. Designed for everyday use, this piece combines enduring durability with refined style. Perfect for those who seek reliable, long-lasting quality.";

  return (
    <div className="mt-6">
      <div className="flex gap-0 border-b overflow-x-auto pd-thumbs" style={{ borderColor: "var(--pd-b2)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-xs font-medium tracking-widest uppercase transition-colors whitespace-nowrap ${tab === t.id ? "pd-tab-on" : ""}`}
            style={{ fontFamily: "Jost,sans-serif", color: tab === t.id ? "var(--gold)" : "var(--mist)" }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "description" && (
          <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            className="pt-5 space-y-4">
            <p className="text-sm leading-relaxed" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Premium Quality", "Durable Materials", "Eco-Conscious", "1-Year Warranty"].map(f => (
                <span key={f} className="px-3 py-1.5 text-[10px] font-medium rounded-full uppercase tracking-wider"
                  style={{ fontFamily: "Jost,sans-serif", background: "rgba(201,169,110,0.08)", color: "var(--gold)", border: "1px solid rgba(201,169,110,0.15)" }}>
                  ✓ {f}
                </span>
              ))}
            </div>
          </motion.div>
        )}
        {tab === "details" && (
          <motion.div key="det" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            className="pt-5">
            {[
              { label: "Product ID", value: String(product.id || "—").slice(0, 12) + "…" },
              { label: "Price", value: formatMoneyCents(product.price_cents) },
              { label: "Rating", value: `${product.rating_stars ?? "—"} / 5 (${(product.rating_count ?? 0).toLocaleString()} reviews)` },
              { label: "Keywords", value: (product.keywords || []).join(", ") || "—" },
              { label: "Availability", value: "In Stock" },
              { label: "Ships", value: "Within 24–48 hours" },
            ].map((row, i) => (
              <div key={row.label} className="flex items-center justify-between py-3"
                style={{ borderBottom: i < 5 ? "1px solid var(--pd-b1)" : "none" }}>
                <span className="text-xs" style={{ color: "var(--mist)", fontFamily: "Jost,sans-serif" }}>{row.label}</span>
                <span className="text-xs font-medium text-right max-w-[55%] truncate" style={{ color: "var(--platinum)", fontFamily: "Jost,sans-serif" }}>{row.value}</span>
              </div>
            ))}
          </motion.div>
        )}
        {tab === "shipping" && (
          <motion.div key="ship" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
            className="pt-5 space-y-4">
            <div className="flex items-start gap-3">
              <TruckIcon className="w-5 h-5 text-gold mt-0.5" />
              <div>
                <p className="text-sm font-bold text-platinum">Complimentary Delivery</p>
                <p className="text-xs text-mist leading-relaxed mt-1">Enjoy free standard shipping on all orders over $50. Premium express delivery is available at checkout for an additional fee.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshIcon className="w-5 h-5 text-gold mt-0.5" />
              <div>
                <p className="text-sm font-bold text-platinum">Artisan Returns Policy</p>
                <p className="text-xs text-mist leading-relaxed mt-1">If you are not entirely satisfied with your purchase, we offer a seamless 30-day return window. Items must be in original condition with all tags attached.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}