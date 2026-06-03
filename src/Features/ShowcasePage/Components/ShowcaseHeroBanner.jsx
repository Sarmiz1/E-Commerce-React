import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 5500;

export default function ShowcaseHeroBanner({ slides }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const go = useCallback((idx) => {
    setPrev(current);
    setCurrent(idx);
    setProgress(0);
  }, [current]);

  useEffect(() => {
    if (paused) return undefined;

    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + (100 / (DURATION / 60));
      });
    }, 60);

    timerRef.current = setTimeout(() => {
      const next = (current + 1) % slides.length;
      go(next);
    }, DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [current, go, paused, slides.length]);

  const slide = slides[current];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "92vh",
        minHeight: 560,
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {slides.map((s, i) => {
        const isActive = i === current;
        const isPrev = i === prev;
        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              backgroundImage: `url(${s.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              opacity: isActive ? 1 : 0,
              transform: isActive ? "scale(1.06)" : "scale(1.0)",
              transition: isActive
                ? "opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 7s ease-out"
                : "opacity 1.0s cubic-bezier(0.4,0,0.2,1), transform 0.6s ease",
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.1) 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute", inset: 0, zIndex: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 64px 64px",
      }}>
        <div key={`eyebrow-${current}`} style={{
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 18,
          animation: "heroFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
          animationDelay: "0.05s",
        }}>
          <span style={{
            display: "inline-block",
            width: 28, height: 2,
            background: slide.accent,
            borderRadius: 1,
          }} />
          <span style={{
            fontSize: 10, fontWeight: 800,
            letterSpacing: 3, textTransform: "uppercase",
            color: slide.accent,
            fontFamily: "'DM Mono', monospace",
          }}>
            {slide.eyebrow}
          </span>
        </div>

        <h1
          key={`h-${current}`}
          style={{
            margin: "0 0 20px",
            fontSize: "clamp(40px, 6.5vw, 82px)",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: "#fff",
            fontFamily: "'Playfair Display', serif",
            whiteSpace: "pre-line",
            maxWidth: 680,
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.15s",
          }}
        >
          {slide.headline}
        </h1>

        <p
          key={`sub-${current}`}
          style={{
            margin: "0 0 36px",
            fontSize: 15,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 460,
            lineHeight: 1.65,
            fontWeight: 400,
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.25s",
          }}
        >
          {slide.sub}
        </p>

        <div
          key={`cta-${current}`}
          style={{
            display: "flex", gap: 12, alignItems: "center",
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.35s",
          }}
        >
          <button style={{
            background: slide.accent,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "14px 28px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "opacity 0.2s ease",
          }}>
            {slide.cta}
          </button>
          <button style={{
            background: "transparent",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            padding: "13px 24px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            backdropFilter: "blur(4px)",
          }}>
            {slide.ctaSecondary}
          </button>
        </div>
      </div>

      <div style={{
        position: "absolute", right: 48, bottom: 64, zIndex: 6,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Mono', monospace" }}>
          {String(current + 1).padStart(2, "0")}
        </span>
        <div style={{ width: 80, height: 2, background: "rgba(255,255,255,0.18)", overflow: "hidden", borderRadius: 2 }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: slide.accent,
            transition: "width 0.06s linear",
          }} />
        </div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Mono', monospace" }}>
          {String(slides.length).padStart(2, "0")}
        </span>
        <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
          <button onClick={() => go((current - 1 + slides.length) % slides.length)} style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            backdropFilter: "blur(8px)",
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L3 7l6 5" />
            </svg>
          </button>
          <button onClick={() => go((current + 1) % slides.length)} style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            backdropFilter: "blur(8px)",
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 2l6 5-6 5" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 28, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        opacity: 0.5,
        animation: "heroScrollBounce 2s ease-in-out infinite",
      }}>
        <span style={{ fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: "#fff", fontFamily: "'DM Mono', monospace" }}>Scroll</span>
        <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="1.5">
          <path d="M8 3v10M4 9l4 4 4-4" />
        </svg>
      </div>

      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        zIndex: 5,
        display: "flex",
        height: 5,
      }}>
        {slides.map((s, i) => (
          <div
            key={s.id}
            onClick={() => go(i)}
            style={{
              flex: 1,
              background: i === current ? s.accent : "rgba(255,255,255,0.15)",
              transition: "background 0.4s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(5px); }
        }
      `}</style>
    </div>
  );
}
