import { useEffect, useState } from "react";

export function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0.1,
  } = options;

  useEffect(() => {
    if (!ref.current) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, { root, rootMargin, threshold });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, root, rootMargin, threshold]);

  return isIntersecting;
}
