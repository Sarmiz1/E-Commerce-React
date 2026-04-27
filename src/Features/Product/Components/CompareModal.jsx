import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { IconClose } from "../../../Components/Icons/IconClose";

export default function CompareModal({ items, onClose, onRemove }) {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  if (items.length < 2) return null;
  const [a, b] = items;
  const rows = [
    { label: "Price", render: (p) => formatMoneyCents(p.price_cents) },
    { label: "Rating", render: (p) => `${p.rating_stars || 0} ★` },
    { label: "Reviews", render: (p) => (p.rating_count || 0).toLocaleString() },
    {
      label: "Category",
      render: (p) => (p.keywords || []).slice(0, 2).join(", ") || "—",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1200] flex items-end md:items-center justify-center"
      style={{ pointerEvents: "none" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
        className="relative z-10 w-full h-[100dvh] rounded-none md:h-auto md:max-h-[85vh] md:max-w-3xl md:mx-4 md:rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
        style={{ background: colors.surface.elevated }}
      >
        <div
          className="flex items-center justify-between p-5 md:p-6 border-b shrink-0"
          style={{ borderColor: colors.border.subtle }}
        >
          <div>
            <h3
              className="text-xl font-serif font-bold"
              style={{ color: colors.text.primary }}
            >
              Compare Matches
            </h3>
            <p
              className="text-[10px] uppercase tracking-widest mt-1"
              style={{ color: colors.text.tertiary }}
            >
              AI Machine Analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: colors.surface.tertiary }}
          >
            <IconClose />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pg-slim">
          <div className="grid grid-cols-2 gap-4 md:gap-6 p-5 md:p-6">
            {[a, b].map((p) => (
              <div key={p.id} className="text-center group">
                <div
                  className="rounded-2xl overflow-hidden mb-4 aspect-square relative border"
                  style={{
                    background: colors.surface.tertiary,
                    borderColor: colors.border.subtle,
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                <p
                  className="text-sm md:text-base font-bold line-clamp-2 leading-tight mb-2"
                  style={{ color: colors.text.primary }}
                >
                  {p.name}
                </p>
                <p
                  className="text-xl md:text-2xl font-black"
                  style={{ color: colors.text.primary }}
                >
                  {formatMoneyCents(p.price_cents)}
                </p>
              </div>
            ))}
          </div>

          <div className="px-5 md:px-6 pb-5 md:pb-6">
            {rows.map(({ label, render }) => (
              <div
                key={label}
                className="grid grid-cols-[1fr_1fr] gap-4 md:gap-6 py-4 border-t text-center"
                style={{ borderColor: colors.border.subtle }}
              >
                {[a, b].map((p) => (
                  <div key={p.id}>
                    <p
                      className="text-[10px] uppercase tracking-widest font-bold mb-1"
                      style={{ color: colors.text.tertiary }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-sm md:text-base font-bold"
                      style={{ color: colors.text.primary }}
                    >
                      {render(p)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className="grid grid-cols-2 gap-4 p-5 md:p-6 border-t shrink-0"
          style={{
            borderColor: colors.border.subtle,
            background: isDark ? "rgba(30,30,34,0.5)" : "rgba(249,250,251,0.5)",
          }}
        >
          {[a, b].map((p) => (
            <motion.button
              key={`pick-${p.id}`}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                onClose();
                navigate(`/products/${p.slug || p.id}`);
              }}
              className="py-4 rounded-2xl font-bold text-sm md:text-base shadow-lg transition-colors border"
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
