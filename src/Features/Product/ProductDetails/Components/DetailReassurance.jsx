import React from "react";

export default function DetailReassurance() {
  const items = [
    "🔒 Secure checkout",
    "📦 Ships in 24h",
    "✨ 30-day returns",
    "🛡️ Buyer protection",
  ];

  return (
    <div className="pd-r flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
      {items.map((item) => (
        <span
          key={item}
          className="text-[10px] uppercase tracking-wider font-bold opacity-40"
          style={{ color: "var(--mist)" }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
