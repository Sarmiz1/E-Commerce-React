import { useEffect, useState } from "react";

export default function CountdownTimer({ label }) {
  const [time, setTime] = useState(() => {
    const parts = label.match(/(\d+)h (\d+)m/);
    if (!parts) return { h: 2, m: 30, s: 0 };
    return { h: parseInt(parts[1], 10), m: parseInt(parts[2], 10), s: 0 };
  });

  useEffect(() => {
    const id = setInterval(() => {
      setTime((current) => {
        const { h, m, s } = current;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return current;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const pad = (value) => String(value).padStart(2, "0");

  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, color: "#E8433A", fontWeight: 600 }}>
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  );
}
