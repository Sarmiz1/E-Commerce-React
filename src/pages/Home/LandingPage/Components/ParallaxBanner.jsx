import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Generated once at module load — never during render ──────────────────────
// This is the correct fix: Math.random() called outside the component means
// it runs exactly once when the JS module is first imported, not on every
// render or re-render, so React Strict Mode double-invoking the component
// body has zero effect on this data.
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  w: Math.random() * 3 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  opacity: Math.random() * 0.7 + 0.1,
  dur: Math.random() * 3 + 2,
  delay: Math.random() * 3,
}));

export default function ParallaxBanner() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    let scrubST;

    const t = setTimeout(() => {
      scrubST = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
        onUpdate: (self) => {
          gsap.set(bg, { y: `${self.progress * 25}%` });
        },
      });

      const texts = section.querySelectorAll(".se-pt");
      if (texts.length) {
        gsap.fromTo(
          texts,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.14,
            duration: 1,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: section,
              start: "top 76%",
              once: true,
            },
          }
        );
      }
    }, 120);

    return () => {
      clearTimeout(t);
      scrubST?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[500px] overflow-hidden flex items-center justify-center"
    >
      {/* Parallax background layer */}
      <div
        ref={bgRef}
        className="absolute inset-0"
        style={{
          top: "-20%",
          bottom: "-20%",
          background:
            "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)",
        }}
      >
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white se-twinkle"
            style={{
              width: s.w,
              height: s.w,
              top: `${s.top}%`,
              left: `${s.left}%`,
              opacity: s.opacity,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <p className="se-pt text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">
          Members Only
        </p>
        <h3 className="se-pt text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          Unlock{" "}
          <span className="text-transparent bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text">
            Premium
          </span>
          <br />
          Access Today
        </h3>
        <p className="se-pt text-gray-300 text-lg mb-10 max-w-xl mx-auto">
          Members save an average of $340/year with exclusive pricing, early
          access drops, and free priority shipping on everything.
        </p>
        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 0 40px rgba(251,191,36,0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="se-pt bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black px-10 py-4 rounded-2xl text-lg shadow-2xl"
        >
          Join Premium — Free for 30 Days ✨
        </motion.button>
      </div>
    </section>
  );
}

