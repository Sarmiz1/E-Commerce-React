import React, { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from "framer-motion";


const HeroLinksThumbnails = ({ items, isDark, colors }) => {
  const scrollRef = useRef(null);
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const [dragged, setDragged] = useState(false);

  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDragging: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    };
    setDragged(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragState.current.isDragging) return;
    e.preventDefault();
    setDragged(true);
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragState.current.startX) * 2;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-6 pt-8">
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex gap-6 overflow-x-auto pb-4 items-center justify-start md:justify-center select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
