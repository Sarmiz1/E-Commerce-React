import { forwardRef } from "react";
// import { Logo } from "../../../components/Ui/Logo";

const Wordmark = forwardRef(function Wordmark({ dotRef, taglineRef }, wordRef) {
  return (
    <div className="pt-20 pb-12 overflow-hidden">
      <div ref={wordRef} className="overflow-hidden" style={{ opacity: 0 }}>
        <h2 className="
          font-serif tracking-tight leading-none select-none
          text-[clamp(72px,10vw,148px)]
          text-gray-950 dark:text-white
        "
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Woo
          <span className="text-blue-600 italic">sho</span>
          {/* Animated dot */}
          <span
            ref={dotRef}
            className="inline-block w-3 h-3 md:w-4 md:h-4 rounded-full
              bg-blue-600 ml-1 mb-4 md:mb-6 align-bottom"
          />
        </h2>
      </div>

      <p
        ref={taglineRef}
        className="
          mt-4 text-base md:text-lg font-light leading-relaxed
          text-gray-500 dark:text-gray-400 max-w-sm
        "
        style={{ opacity: 0 }}
      >
        Commerce that understands every&nbsp;individual path.
        Powered by&nbsp;AI, delivered with passion.
      </p>
    </div>
  );
});

export default Wordmark;
