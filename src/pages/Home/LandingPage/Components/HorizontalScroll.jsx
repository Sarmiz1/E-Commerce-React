import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function HorizontalScroll() {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);

  // Drag state — kept in refs so no re-renders during drag
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentX = useRef(0);       // current translated X in px
  const dragStartX = useRef(0);     // pointer X when drag began

  const items = [
    { emoji: "👗", label: "Women's Fashion", count: "12K+ items", color: "from-rose-400 to-pink-600" },
    { emoji: "👔", label: "Men's Style", count: "8K+ items", color: "from-sky-400 to-blue-600" },
    { emoji: "👟", label: "Sneakers", count: "3K+ items", color: "from-lime-400 to-green-600" },
    { emoji: "💄", label: "Beauty", count: "5K+ items", color: "from-fuchsia-400 to-purple-600" },
    { emoji: "📱", label: "Tech", count: "2K+ items", color: "from-cyan-400 to-teal-600" },
    { emoji: "🏠", label: "Home & Living", count: "9K+ items", color: "from-amber-400 to-orange-500" },
    { emoji: "🎮", label: "Gaming", count: "1K+ items", color: "from-indigo-400 to-violet-600" },
    { emoji: "🧸", label: "Kids", count: "6K+ items", color: "from-yellow-400 to-orange-400" },
  ];

  // Clamp helper — keeps track within its bounds
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const getMaxScroll = () => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    if (!track || !wrapper) return 0;
    return -(track.scrollWidth - wrapper.offsetWidth);
  };

  // ── Drag handlers (mouse + touch) ─────────────────────────────────────────
  const onDragStart = (clientX) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    startX.current = currentX.current;
    if (trackRef.current) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.cursor = "grabbing";
    }
  };

  const onDragMove = (clientX) => {
    if (!isDragging.current || !trackRef.current) return;
    const delta = clientX - dragStartX.current;
    const next = clamp(startX.current + delta, getMaxScroll(), 0);
    currentX.current = next;
    gsap.set(trackRef.current, { x: next });
  };

  const onDragEnd = (clientX) => {
    if (!isDragging.current || !trackRef.current) return;
    isDragging.current = false;
    trackRef.current.style.cursor = "grab";

    // Momentum: flick velocity → ease to rest
    const delta = clientX - dragStartX.current;
    const momentum = delta * 0.35; // how far to coast
    const target = clamp(currentX.current + momentum, getMaxScroll(), 0);
    currentX.current = target;
    gsap.to(trackRef.current, { x: target, duration: 0.55, ease: "power3.out" });
  };

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    // Mouse events
    const onMouseDown = (e) => { e.preventDefault(); onDragStart(e.clientX); };
    const onMouseMove = (e) => { if (isDragging.current) onDragMove(e.clientX); };
    const onMouseUp = (e) => onDragEnd(e.clientX);

    // Touch events
    const onTouchStart = (e) => onDragStart(e.touches[0].clientX);
    const onTouchMove = (e) => { if (isDragging.current) { e.preventDefault(); onDragMove(e.touches[0].clientX); } };
    const onTouchEnd = (e) => onDragEnd(e.changedTouches[0].clientX);

    track.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: false });
    track.addEventListener("touchend", onTouchEnd);

    // Prevent image/text drag interfering
    track.addEventListener("dragstart", (e) => e.preventDefault());

    return () => {
      track.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Explore</p>
        <h3 className="text-4xl font-black text-gray-900">Shop Every Category</h3>
        <p className="text-sm text-gray-400 mt-1">← Drag to explore →</p>
      </div>

      {/* Overflow wrapper — clips track, no overflow-hidden on section so shadow isn't clipped */}
      <div ref={wrapperRef} className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-5 px-6 will-change-transform select-none"
          style={{ width: "max-content", cursor: "grab" }}
        >
          {[...items, ...items].map((item, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-52 h-64 bg-gradient-to-br ${item.color} rounded-3xl p-6 flex flex-col justify-between shadow-lg active:scale-95 transition-transform duration-150`}
            >
              <span className="text-6xl pointer-events-none">{item.emoji}</span>
              <div className="pointer-events-none">
                <h4 className="font-black text-white text-lg leading-tight">{item.label}</h4>
                <p className="text-white/70 text-sm mt-1">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HorizontalScroll
