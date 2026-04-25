import { forwardRef } from "react";
import { ArrowUpRight } from "lucide-react";

const Newsletter = forwardRef(function Newsletter(props, ref) {
  return (
    <div
      ref={ref}
      className="footer-col col-span-2 lg:col-span-2"
      style={{ opacity: 0 }}
    >
      <p className="
        text-[10px] font-black tracking-[0.18em] uppercase mb-6
        text-gray-400 dark:text-gray-500
      ">
        Stay in the loop
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
        New drops, exclusive deals, and seller tips — straight to your inbox.
      </p>

      {/* Input row */}
      <div className="flex gap-2.5">
        <input
          type="email"
          placeholder="your@email.com"
          className="
            flex-1 min-w-0 h-11 px-4 rounded-xl text-sm
            bg-gray-100 dark:bg-white/[0.05]
            border border-gray-200 dark:border-white/[0.09]
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-600
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
            focus:border-blue-500/50
            transition-all duration-200
          "
        />
        <button className="
          h-11 px-5 rounded-xl
          bg-blue-600 hover:bg-blue-700 active:bg-blue-800
          text-white text-sm font-bold
          flex items-center gap-1.5 whitespace-nowrap
          transition-all duration-200
          hover:shadow-lg hover:shadow-blue-600/25
          hover:-translate-y-px
        ">
          Join <ArrowUpRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Trust line */}
      <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
});

export default Newsletter;
