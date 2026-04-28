import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from "framer-motion";

const HeroLinksThumbnails = ({ items, isDark, colors }) => {
  const scrollRef = useRef(null);
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const momentumRaf = useRef(null);
  const [dragged, setDragged] = useState(false);

  // ── Momentum decay ──
  const startMomentum = useCallback(() => {
    cancelAnimationFrame(momentumRaf.current);
    const el = scrollRef.current;
    if (!el) return;

    let v = drag.current.velocity;
    const decay = 0.95;
    const minV = 0.5;

    const tick = () => {
      v *= decay;
      if (Math.abs(v) < minV) return;
      el.scrollLeft -= v;
      momentumRaf.current = requestAnimationFrame(tick);
    };
    momentumRaf.current = requestAnimationFrame(tick);
  }, []);

  // ── Shared start / move / end logic ──
  const onDragStart = useCallback((x) => {
    cancelAnimationFrame(momentumRaf.current);
    const el = scrollRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: x,
      scrollLeft: el.scrollLeft,
      lastX: x,
      lastTime: Date.now(),
      velocity: 0,
    };
    setDragged(false);
    el.style.scrollBehavior = "auto"; // disable smooth while dragging
  }, []);

  const onDragMove = useCallback((x) => {
    if (!drag.current.active) return;
    const el = scrollRef.current;
    if (!el) return;

    const dx = x - drag.current.startX;
    // Mark as dragged if moved more than 4px (prevents accidental drags)
    if (Math.abs(dx) > 4) setDragged(true);

    el.scrollLeft = drag.current.scrollLeft - dx;

    // Track velocity
    const now = Date.now();
    const dt = now - drag.current.lastTime;
    if (dt > 0) {
      drag.current.velocity = (x - drag.current.lastX) / dt * 16; // normalize to ~16ms frame
    }
    drag.current.lastX = x;
    drag.current.lastTime = now;
  }, []);

  const onDragEnd = useCallback(() => {
    if (!drag.current.active) return;
    drag.current.active = false;
    startMomentum();
  }, [startMomentum]);

  // ── Mouse events ──
  const handleMouseDown = useCallback((e) => {
    onDragStart(e.pageX);
  }, [onDragStart]);

  const handleMouseMove = useCallback((e) => {
    if (!drag.current.active) return;
    e.preventDefault();
    onDragMove(e.pageX);
  }, [onDragMove]);

  const handleMouseUp = useCallback(() => onDragEnd(), [onDragEnd]);
  const handleMouseLeave = useCallback(() => onDragEnd(), [onDragEnd]);

  // ── Touch events ──
  const handleTouchStart = useCallback((e) => {
    onDragStart(e.touches[0].pageX);
  }, [onDragStart]);

  const handleTouchMove = useCallback((e) => {
    onDragMove(e.touches[0].pageX);
  }, [onDragMove]);

  const handleTouchEnd = useCallback(() => onDragEnd(), [onDragEnd]);

  // Cleanup RAF on unmount
  useEffect(() => () => cancelAnimationFrame(momentumRaf.current), []);

  return (
    <div className="w-full px-6 pt-8">
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex gap-6 overflow-x-auto pb-4 items-center justify-start select-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          cursor: drag.current?.active ? "grabbing" : "grab",
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {items.map((item, idx) => (
          <Link
            key={item.id}
            to={item.link}
            onClick={(e) => {
              if (dragged) e.preventDefault();
            }}
            draggable="false"
            className="group flex flex-col items-center shrink-0 w-20 md:w-24 gap-3 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
              className="relative w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] overflow-hidden"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)"
                  : "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 100%)"
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden relative" style={{ background: colors.surface.secondary }}>
                <img
                  src={item.image}
                  alt={item.label}
                  draggable="false"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
              </div>
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 + 0.2 }}
              className="text-xs font-bold text-center leading-tight transition-colors"
              style={{ color: colors.text.primary }}
            >
              {item.label}
            </motion.span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HeroLinksThumbnails
