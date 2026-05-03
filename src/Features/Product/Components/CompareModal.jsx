import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../store/useThemeStore";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { IconClose } from "../../../Components/Icons/IconClose";

export default function CompareModal({ items, onClose, onRemove }) {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  if (items.length < 2) return null;

  const columns = `repeat(${items.length}, minmax(0, 1fr))`;
  const rows = [
    { label: "Price", render: (p) => formatMoneyCents(p.price_cents) },
    { label: "Rating", render: (p) => `${p.rating_stars || 0} stars` },
    { label: "Reviews", render: (p) => (p.rating_count || 0).toLocaleString() },
    { label: "Seller", render: (p) => p.seller?.store_name || "WooSho seller" },
    {
      label: "Trust",
      render: (p) => (p.seller?.is_verified_store ? "Verified" : `${p.seller?.trust_score || 82}/100`),
    },
    { label: "Shipping", render: (p) => p.shipping_eta || "2-4 days" },
    { label: "Returns", render: (p) => p.return_window || "30 days" },
    {
      label: "Signals",
      render: (p) => (p.keywords || []).slice(0, 2).join(", ") || "Best match",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1200] flex items-end justify-center md:items-center"
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
        className="pointer-events-auto relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden rounded-none shadow-2xl md:mx-4 md:h-auto md:max-h-[85vh] md:max-w-5xl md:rounded-3xl"
        style={{ background: colors.surface.elevated }}
      >
        <div
          className="flex shrink-0 items-center justify-between border-b p-5 md:p-6"
          style={{ borderColor: colors.border.subtle }}
        >
          <div>
            <h3 className="text-xl font-serif font-bold" style={{ color: colors.text.primary }}>
              Compare Matches
            </h3>
            <p
              className="mt-1 text-[10px] uppercase tracking-widest"
              style={{ color: colors.text.tertiary }}
            >
              AI machine analysis · {items.length} items
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{ background: colors.surface.tertiary }}
          >
            <IconClose />
          </button>
        </div>

        <div className="pg-slim flex-1 overflow-x-auto overflow-y-auto">
          <div className="min-w-[720px]">
            <div className="grid gap-4 p-5 md:gap-6 md:p-6" style={{ gridTemplateColumns: columns }}>
              {items.map((p) => (
                <div key={p.id} className="group text-center">
                  <div
                    className="relative mb-4 aspect-square overflow-hidden rounded-2xl border"
                    style={{
                      background: colors.surface.tertiary,
                      borderColor: colors.border.subtle,
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <button
                      onClick={() => onRemove(p.id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                      title="Remove from compare"
                    >
                      <IconClose />
                    </button>
                  </div>
                  <p
                    className="mb-2 line-clamp-2 text-sm font-bold leading-tight md:text-base"
                    style={{ color: colors.text.primary }}
                  >
                    {p.name}
                  </p>
                  <p className="text-xl font-black md:text-2xl" style={{ color: colors.text.primary }}>
                    {formatMoneyCents(p.price_cents)}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 md:px-6 md:pb-6">
              {rows.map(({ label, render }) => (
                <div
                  key={label}
                  className="grid gap-4 border-t py-4 text-center md:gap-6"
                  style={{ borderColor: colors.border.subtle, gridTemplateColumns: columns }}
                >
                  {items.map((p) => (
                    <div key={p.id}>
                      <p
                        className="mb-1 text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: colors.text.tertiary }}
                      >
                        {label}
                      </p>
                      <p className="text-sm font-bold md:text-base" style={{ color: colors.text.primary }}>
                        {render(p)}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="grid shrink-0 gap-3 border-t p-5 md:p-6"
          style={{
            borderColor: colors.border.subtle,
            background: isDark ? "rgba(30,30,34,0.5)" : "rgba(249,250,251,0.5)",
            gridTemplateColumns: columns,
          }}
        >
          {items.map((p) => (
            <motion.button
              key={`pick-${p.id}`}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onClose();
                navigate(`/products/${p.slug || p.id}`);
              }}
              className="rounded-2xl border px-3 py-3 text-xs font-bold shadow-lg transition-colors md:text-sm"
              style={{
                background: colors.cta.primary,
                color: colors.cta.primaryText,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              Pick {p.name.split(" ")[0]}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
