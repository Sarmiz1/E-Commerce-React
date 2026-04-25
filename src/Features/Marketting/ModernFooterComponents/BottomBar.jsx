import { forwardRef } from "react";
import { Sparkles } from "lucide-react";
import { Socials, LEGAL } from "./footerConstants";

const BottomBar = forwardRef(function BottomBar({ socialsRef }, ref) {
  return (
    <div
      ref={ref}
      className="py-8 flex flex-col md:flex-row items-center justify-between gap-5"
      style={{ opacity: 0 }}
    >
      {/* Left: Logo + copyright */}
      <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
        {/* Compact logo mark */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center"
            style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}
          >
            <Sparkles className="text-white fill-white" size={15} />
          </div>
          <span
            className="text-base font-bold tracking-tight text-gray-900 dark:text-white"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Woo<span className="text-blue-600">sho</span>
          </span>
        </div>

        {/* Dot separator */}
        <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20" />

        <span className="text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Woosho Inc. All rights reserved.
        </span>
      </div>

      {/* Center: Social icons */}
      <div ref={socialsRef} className="flex items-center gap-2 order-first md:order-none">
        {Socials.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="
              social-icon
              w-9 h-9 rounded-xl
              bg-gray-100 dark:bg-white/[0.05]
              border border-gray-200 dark:border-white/[0.08]
              text-gray-500 dark:text-gray-400
              hover:bg-blue-600 hover:text-white hover:border-blue-600
              dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600
              flex items-center justify-center
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-600/20
            "
            style={{ opacity: 0 }}
          >
            {icon}
          </a>
        ))}
      </div>

      {/* Right: Legal links */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {LEGAL.map((label, i) => (
          <span key={label} className="flex items-center gap-1">
            <button className="
              text-xs text-gray-400 dark:text-gray-500
              hover:text-blue-600 dark:hover:text-blue-400
              transition-colors duration-150 px-1 py-0.5 rounded
              hover:bg-blue-50 dark:hover:bg-blue-500/10
            ">
              {label}
            </button>
            {i < LEGAL.length - 1 && (
              <span className="w-px h-3 bg-gray-200 dark:bg-white/10 block" />
            )}
          </span>
        ))}
      </div>
    </div>
  );
});

export default BottomBar;
