// ─── Marquee ──────────────────────────────────────────────────────────────────
import { MARQUEE_ITEMS } from "../Data/marque";

export default function MarqueeStrip() {

  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  
  return (
    <div className="overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 py-2.5">
      <div className="flex whitespace-nowrap hp-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="text-white text-sm font-medium tracking-wide px-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-200 inline-block" />{item}
          </span>
        ))}
      </div>
    </div>
  );
}