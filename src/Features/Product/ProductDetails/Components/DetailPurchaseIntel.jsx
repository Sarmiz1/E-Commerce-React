import React from "react";
import { CheckIcon, RefreshIcon, ShieldIcon, TruckIcon } from "./Icons";
import { seededRand } from "../Utils/productHelpers";

export default function DetailPurchaseIntel({
  product,
  selectedColor,
  selectedSize,
  hasSizes,
  lowStock,
}) {
  const etaDays = seededRand(String(product.id || product.name), 2, 5);
  const stockCount = lowStock ? seededRand(String(product.id), 2, 8) : seededRand(String(product.id), 12, 36);
  const variantReady = Boolean(selectedColor) && (!hasSizes || Boolean(selectedSize));

  const items = [
    {
      icon: <TruckIcon className="h-3.5 w-3.5" />,
      label: "Delivery ETA",
      value: `${etaDays}-${etaDays + 1} days`,
    },
    {
      icon: <RefreshIcon className="h-3.5 w-3.5" />,
      label: "Returns",
      value: product.return_window || "30 days",
    },
    {
      icon: <ShieldIcon className="h-3.5 w-3.5" />,
      label: "Protection",
      value: "Covered",
    },
    {
      icon: <CheckIcon className="h-3.5 w-3.5" />,
      label: "Variant",
      value: variantReady ? "Ready" : "Select options",
    },
  ];

  return (
    <div className="pd-r space-y-3 rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "var(--mist)" }}>
          Purchase intel
        </p>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
          style={{
            background: lowStock ? "rgba(251,146,60,0.1)" : "rgba(74,222,128,0.08)",
            color: lowStock ? "#fb923c" : "#4ade80",
          }}
        >
          {stockCount} available
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/5 bg-black/10 p-3">
            <div className="mb-1 flex items-center gap-2" style={{ color: "var(--gold)" }}>
              {item.icon}
              <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--mist)" }}>
                {item.label}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--platinum)" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

