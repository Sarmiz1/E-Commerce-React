import { useEffect } from 'react';
import gsap from 'gsap';

export function useMagnetic(ref, strength = 0.35) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const move = e => { const { left, top, width, height } = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - (left + width / 2)) * strength, y: (e.clientY - (top + height / 2)) * strength, duration: 0.5, ease: "power2.out" }); };
    const reset = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.5)" });
    el.addEventListener("mousemove", move); el.addEventListener("mouseleave", reset);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", reset); };
  }, [ref, strength]);
}