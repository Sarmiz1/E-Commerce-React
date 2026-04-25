import { useState } from 'react';

export default function InteractiveStarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          className="text-xl transition-transform duration-150 hover:scale-110"
          style={{ color: s <= (hover || value) ? "#C9A96E" : "rgba(201,169,110,0.2)" }}>★</button>
      ))}
      {value > 0 && <span className="text-xs ml-1" style={{ color: "var(--silver)", fontFamily: "Jost,sans-serif" }}>{value}/5</span>}
    </div>
  );
}