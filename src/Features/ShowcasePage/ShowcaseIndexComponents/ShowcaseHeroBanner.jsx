import { useCallback, useEffect, useRef, useState } from "react";
import { AdminAdvertsAPI } from "../../../api/adminAdvertsApi";

const DURATION = 5500;

function HeroAction({ children, href, onClick, style }) {
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        style={{ ...style, display: "inline-flex", textDecoration: "none" }}
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} style={style} type="button">
      {children}
    </button>
  );
}

export default function ShowcaseHeroBanner({ slides = [], sectionIsAvailable }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const safeCurrent = slides.length ? Math.min(current, slides.length - 1) : 0;

  const go = useCallback((idx) => {
    setPrev(safeCurrent);
    setCurrent(idx);
    setProgress(0);
  }, [safeCurrent]);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;

    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + (100 / (DURATION / 60));
      });
    }, 60);

    timerRef.current = setTimeout(() => {
      const next = (safeCurrent + 1) % slides.length;
      go(next);
    }, DURATION);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [go, paused, safeCurrent, slides.length]);

  const slide = slides[safeCurrent];
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (!slide?.advertId) return;

    AdminAdvertsAPI.recordEvent({
      advertId: slide.advertId,
      eventType: "impression",
      placement: "showcase_hero",
      surface: slide.rawAdvert?.surface,
    }).catch(() => {});
  }, [slide]);

  const recordClick = useCallback((metadata = {}) => {
    if (!slide?.advertId) return;

    AdminAdvertsAPI.recordEvent({
      advertId: slide.advertId,
      eventType: "click",
      placement: "showcase_hero",
      surface: slide.rawAdvert?.surface,
      metadata,
    }).catch(() => {});
  }, [slide]);

  if (!slide) return null;
  const textX = slide.position === "right"
    ? "flex-end"
    : slide.position === "center"
      ? "center"
      : "flex-start";
  const textAlign = slide.position === "right"
    ? "right"
    : slide.position === "center"
      ? "center"
      : "left";
  const slideLabel = (value = "") => String(value).split("·")[0].trim();

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
      className={`showcase-hero-banner mt-14 ${sectionIsAvailable ? "" : "mt-[4.5rem]" }`}
    >
      {slides.map((s, i) => {
        const isActive = i === safeCurrent;
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
          >
            {s.type === "video" && s.videoSrc ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={s.poster || s.src}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              >
                <source src={s.videoSrc} />
              </video>
            ) : null}
          </div>
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

      {/* Content Text */}
      <div className="showcase-hero-content" style={{
        position: "absolute", inset: 0, zIndex: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: textX,
        padding: "0 64px 64px",
      }}>
        <div key={`eyebrow-${safeCurrent}`} style={{
          display: "flex", alignItems: "center", gap: 12,
          justifyContent: textX,
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
          key={`h-${safeCurrent}`}
          style={{
            margin: "0 0 20px",
            fontSize: "clamp(40px, 6.5vw, 82px)",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: 0,
            color: "#fff",
            fontFamily: "'Playfair Display', serif",
            whiteSpace: "pre-line",
            maxWidth: 680,
            textAlign,
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.15s",
          }}
        >
          {slide.headline}
        </h1>

        <p
          key={`sub-${safeCurrent}`}
          style={{
            margin: "0 0 36px",
            fontSize: 15,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 460,
            lineHeight: 1.65,
            fontWeight: 400,
            textAlign,
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.25s",
          }}
        >
          {slide.sub}
        </p>

        <div
          key={`cta-${safeCurrent}`}
          style={{
            display: "flex", gap: 12, alignItems: "center", justifyContent: textX,
            flexWrap: "wrap",
            animation: "heroFadeUp 0.75s cubic-bezier(0.22,1,0.36,1) both",
            animationDelay: "0.35s",
          }}
        >
          <HeroAction
            href={slide.ctaHref}
            onClick={() => recordClick({ action: "primary_cta" })}
            style={{
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
          </HeroAction>
          <HeroAction
            href={slide.ctaSecondaryHref}
            onClick={() => recordClick({ action: "secondary_cta" })}
            style={{
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
          </HeroAction>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 64,
          right: 64,
          zIndex: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 16,
        }}
        className="showcase-hero-dots"
      >
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 1,
        }}>
          {String(safeCurrent + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => hasMultipleSlides && go(i)}
              type="button"
              style={{
                background: "none",
                border: "none",
                cursor: hasMultipleSlides ? "pointer" : "default",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {i === safeCurrent && (
                <span style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontFamily: "'DM Mono', monospace",
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {slideLabel(s.eyebrow)}
                </span>
              )}
              <span style={{
                display: "block",
                width: i === safeCurrent ? 32 : 6,
                height: 3,
                borderRadius: 2,
                background: i === safeCurrent ? slide.accent : "rgba(255,255,255,0.3)",
                transition: "width 0.4s ease, background 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}>
                {i === safeCurrent && (
                  <span style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${progress}%`,
                    background: "#fff",
                    opacity: 0.5,
                    transition: "width 0.06s linear",
                  }} />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {hasMultipleSlides && (
        <div style={{
          position: "absolute",
          top: "50%",
          right: 24,
          zIndex: 6,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          <button onClick={() => go((safeCurrent - 1 + slides.length) % slides.length)} style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            backdropFilter: "blur(8px)",
          }} type="button">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L3 7l6 5" />
            </svg>
          </button>
          <button onClick={() => go((safeCurrent + 1) % slides.length)} style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            backdropFilter: "blur(8px)",
          }} type="button">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 2l6 5-6 5" />
            </svg>
          </button>
        </div>
      )}

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
            onClick={() => hasMultipleSlides && go(i)}
            style={{
              flex: 1,
              background: i === safeCurrent ? s.accent : "rgba(255,255,255,0.15)",
              transition: "background 0.4s ease",
              cursor: hasMultipleSlides ? "pointer" : "default",
            }}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 767px) {
          .showcase-hero-banner {
            height: 82vh !important;
            min-height: 560px !important;
          }
          .showcase-hero-content {
            padding: 0 20px 86px !important;
            align-items: flex-start !important;
          }
          .showcase-hero-dots {
            right: 20px !important;
            bottom: 28px !important;
            gap: 10px !important;
          }
          .showcase-hero-content h1,
          .showcase-hero-content p {
            text-align: left !important;
          }
        }
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
