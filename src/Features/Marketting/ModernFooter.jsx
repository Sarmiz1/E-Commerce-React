import { memo, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { FOOTER_LINKS } from "./ModernFooterComponents/footerConstants";
import Wordmark from "./ModernFooterComponents/Wordmark";
import Divider from "./ModernFooterComponents/Divider";
import FooterColumn from "./ModernFooterComponents/FooterColumn";
import Newsletter from "./ModernFooterComponents/Newsletter";
import BottomBar from "./ModernFooterComponents/BottomBar";

gsap.registerPlugin(ScrollTrigger);

export const ModernFooter = memo(function ModernFooter() {
  const footerRef = useRef(null);
  const wordRef = useRef(null);
  const taglineRef = useRef(null);
  const divider1Ref = useRef(null);
  const colsRef = useRef(null);
  const newsletterRef = useRef(null);
  const divider2Ref = useRef(null);
  const bottomRef = useRef(null);
  const socialsRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const ctx = gsap.context(() => {
      // 1. Big wordmark clips up
      gsap.fromTo(wordRef.current,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0, opacity: 1, duration: 1.05,
          ease: "expo.out",
          scrollTrigger: {
            trigger: wordRef.current,
            start: "top 92%",
          },
        }
      );

      // 2. Tagline fades + slides up
      gsap.fromTo(taglineRef.current,
        { y: 22, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.75,
          ease: "power3.out", delay: 0.18,
          scrollTrigger: {
            trigger: taglineRef.current,
            start: "top 92%",
          },
        }
      );

      // 3. First divider draws left → right
      gsap.fromTo(divider1Ref.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.1, ease: "expo.out",
          scrollTrigger: {
            trigger: divider1Ref.current,
            start: "top 90%",
          },
        }
      );

      // 4. Link columns stagger up
      const cols = colsRef.current?.querySelectorAll(".footer-col");
      if (cols?.length) {
        gsap.fromTo(cols,
          { y: 36, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.65, ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: {
              trigger: colsRef.current,
              start: "top 88%",
            },
          }
        );
      }

      // 5. Newsletter band slides up
      gsap.fromTo(newsletterRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: {
            trigger: newsletterRef.current,
            start: "top 90%",
          },
        }
      );

      // 6. Second divider draws
      gsap.fromTo(divider2Ref.current,
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1, duration: 1.0, ease: "expo.out",
          scrollTrigger: {
            trigger: divider2Ref.current,
            start: "top 95%",
          },
        }
      );

      // 7. Bottom bar fades up
      gsap.fromTo(bottomRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, ease: "power3.out",
          scrollTrigger: {
            trigger: bottomRef.current,
            start: "top 98%",
          },
        }
      );

      // 8. Social icons pop in with stagger
      const socials = socialsRef.current?.querySelectorAll(".social-icon");
      if (socials?.length) {
        gsap.fromTo(socials,
          { scale: 0.6, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)",
            stagger: 0.07,
            scrollTrigger: {
              trigger: socialsRef.current,
              start: "top 96%",
            },
          }
        );
      }

      // 9. Pulsing dot in logo
      gsap.to(dotRef.current, {
        scale: 1.22, duration: 1.4, ease: "sine.inOut",
        repeat: -1, yoyo: true,
      });

    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <footer
        ref={footerRef}
        className="
          relative overflow-hidden
          bg-white dark:bg-[#0E0E10]
          border-t border-gray-100 dark:border-white/[0.06]
          transition-colors duration-300
        "
      >
        <div className="
          pointer-events-none absolute -top-48 -left-48
          w-[600px] h-[600px] rounded-full
          bg-blue-600/[0.04] dark:bg-blue-500/[0.07]
          blur-3xl
        " />

        <div className="relative max-w-7xl mx-auto px-6">
          <Wordmark ref={wordRef} dotRef={dotRef} taglineRef={taglineRef} />

          <Divider ref={divider1Ref} />

          <div
            ref={colsRef}
            className="
              grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
              gap-x-6 gap-y-12 py-16
            "
          >
            {Object.entries(FOOTER_LINKS).map(([title, items]) => (
              <FooterColumn key={title} title={title} items={items} />
            ))}

            <Newsletter ref={newsletterRef} />
          </div>

          <Divider ref={divider2Ref} />

          <BottomBar ref={bottomRef} socialsRef={socialsRef} />
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');

        /* Silky smooth link hover underlines */
        .woo-footer-link { text-underline-offset: 4px; }

        /* Force hardware acceleration on animated elements */
        footer [ref], footer .footer-col, footer .social-icon {
          will-change: transform, opacity;
        }
      `}
      </style>
    </>
  );
});