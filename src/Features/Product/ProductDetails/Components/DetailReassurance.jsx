import React from "react";
import { LockIcon, TruckIcon, RefreshIcon, ShieldIcon } from "./Icons";

export default function DetailReassurance() {
  const items = [
    { icon: <LockIcon className="w-3.5 h-3.5" />, label: "Secure checkout" },
    { icon: <TruckIcon className="w-3.5 h-3.5" />, label: "Ships in 24h" },
    { icon: <RefreshIcon className="w-3.5 h-3.5" />, label: "30-day returns" },
    { icon: <ShieldIcon className="w-3.5 h-3.5" />, label: "Buyer protection" },
  ];

  return (
    <div className="pd-r grid grid-cols-2 gap-2 mt-6">
      {items.map((item, idx) => (
        <div 
          key={idx}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
        >
          <span className="text-gold opacity-80">{item.icon}</span>
          <span
            className="text-[10px] uppercase tracking-wider font-black"
            style={{ color: "var(--mist)" }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
