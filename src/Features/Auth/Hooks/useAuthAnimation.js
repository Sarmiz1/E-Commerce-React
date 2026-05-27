/**
 * useAuthAnimation.js
 * A custom hook that encapsulates all GSAP animations for the AuthPage.
 * Keeping this logic separated from the main component cleans up the JSX tree
 * and ensures that our animation lifecycle (mounting and unmounting) is properly handled.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useAuthAnimation() {
  // Refs attached to specific DOM elements we want to animate
  const brandRef    = useRef(null);
  const logoRef     = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const statsRef    = useRef(null);
  const formPanelRef= useRef(null);

  useEffect(() => {
    // gsap.context creates a safe scope for animations and makes cleanup simple
    const ctx = gsap.context(() => {
      // Create a master timeline that sequences the entrance animations
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(brandRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      )
      // Logo springs in
      .fromTo(logoRef.current,
        { opacity: 0, scale: 0.7, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.5)" },
        "-=0.2"
      )
      // Title reveals smoothly using a clip-path unmasking effect
      .fromTo(titleRef.current,
        { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" },
        { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)", duration: 0.85 },
        "-=0.4"
      )
      // Subtitle slides up
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.5"
      )
      // The stats badges stagger in one by one
      .fromTo(statsRef.current?.children || [],
        { opacity: 0, x: -24, y: 10 },
        { opacity: 1, x: 0, y: 0, duration: 0.55, stagger: 0.12 },
        "-=0.3"
      )
      // Finally, the entire form panel slides in from the right edge
      .fromTo(formPanelRef.current,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 0.85, ease: "power3.out" },
        "-=0.8"
      );
    });

    // When the component unmounts, ctx.revert() instantly kills the timeline
    // and clears any inline styles added by GSAP to prevent memory leaks.
    return () => ctx.revert();
  }, []);

  return {
    brandRef,
    logoRef,
    titleRef,
    subtitleRef,
    statsRef,
    formPanelRef
  };
}
