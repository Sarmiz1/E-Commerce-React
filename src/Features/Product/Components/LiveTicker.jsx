import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../Context/theme/ThemeContext";
import { ACTIVITY_TEMPLATES, TICKER_MS } from "../constants";

export default function LiveTicker({ products }) {
  const [events, setEvents] = useState([]);
  const productIdx = useRef(0);
  const templateIdx = useRef(0);
  const { colors } = useTheme();

  useEffect(() => {
    if (!products.length) return;
    // Seed initial events
    const seed = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      emoji: ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length].emoji,
      text: ACTIVITY_TEMPLATES[i % ACTIVITY_TEMPLATES.length].tpl
        .replace("[name]", (products[i % products.length]?.name || "Item").slice(0, 28)),
    }));
    setEvents(seed);

    const id = setInterval(() => {
      productIdx.current = (productIdx.current + 1) % products.length;
      templateIdx.current = (templateIdx.current + 1) % ACTIVITY_TEMPLATES.length;
      const p = products[productIdx.current];
      const tpl = ACTIVITY_TEMPLATES[templateIdx.current];
      setEvents((prev) => [
        ...prev.slice(-7),
        { id: Date.now(), emoji: tpl.emoji, text: tpl.tpl.replace("[name]", (p?.name || "Item").slice(0, 28)) },
      ]);
    }, TICKER_MS);

    return () => clearInterval(id);
  }, [products]);

  if (!events.length) return null;
  const doubled = [...events, ...events];

  return (
    <div className="bg-gray-900 border-b border-gray-800 overflow-hidden py-1.5 flex-shrink-0">
      <div className="flex whitespace-nowrap pg-ticker select-none">
        {doubled.map((ev, i) => (
          <span key={`${ev.id}-${i}`} className="inline-flex items-center gap-2 px-5 text-[11px] text-gray-400 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block pg-dot flex-shrink-0" />
            <span>{ev.emoji}</span>
            <span>{ev.text}</span>
            <span className="text-gray-700 mx-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
