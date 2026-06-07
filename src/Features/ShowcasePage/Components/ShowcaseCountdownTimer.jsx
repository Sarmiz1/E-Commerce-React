import { useEffect, useState } from "react";

const getRemaining = ({ endsAt, label }) => {
  if (endsAt) {
    const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1000),
    };
  }

  return (() => {
    const parts = String(label || "").match(/(\d+)h\s+(\d+)m(?:\s+(\d+)s)?/i);
    if (!parts) return { h: 2, m: 30, s: 0 };
    return {
      h: parseInt(parts[1], 10),
      m: parseInt(parts[2], 10),
      s: parseInt(parts[3] || "0", 10),
    };
  })();
};

export default function ShowcaseCountdownTimer({ label, endsAt }) {
  const [time, setTime] = useState(() => getRemaining({ endsAt, label }));

  useEffect(() => {
    const id = setInterval(() => {
      if (endsAt) {
        setTime(getRemaining({ endsAt, label }));
        return;
      }

      setTime((current) => {
        const { h, m, s } = current;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return current;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [endsAt, label]);

  const pad = (value) => String(value).padStart(2, "0");

  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, color: "#E8433A", fontWeight: 600 }}>
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  );
}
