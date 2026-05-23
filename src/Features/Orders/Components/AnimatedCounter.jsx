import { useEffect, useState } from "react";

export default function AnimatedCounter({ end, suffix = "", duration = 1200, decimals = 0 }) {
  const [value, setValue] = useState(0);

  useEffect(() => {

    let frameId;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = decimals > 0 ? (end * eased).toFixed(decimals) : Math.round(end * eased);

      setValue(current);

      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [decimals, duration, end]);

  return (
    <span className="or-count-in tabular-nums">
      {value}
      {suffix}
    </span>
  );
}
