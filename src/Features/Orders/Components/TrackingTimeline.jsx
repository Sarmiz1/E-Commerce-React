import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { STATUS_CONFIG } from "../Utils/ordersConstants";
import { Icons } from "./OrderIcons";

export default function TrackingTimeline({ order }) {
  const cfg = STATUS_CONFIG[order?.status] || STATUS_CONFIG.processing;
  const steps = cfg.track;
  const lineRef = useRef(null);

  useEffect(() => {
    if (!lineRef.current) return undefined;

    gsap.fromTo(
      lineRef.current,
      { height: "0%" },
      { height: "100%", duration: 1.2, ease: "power2.out", delay: 0.3 },
    );

    return () => gsap.killTweensOf(lineRef.current);
  }, [order?.status]);

  const lastDone = steps.reduce((activeIndex, step, index) => (step.done ? index : activeIndex), -1);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-3xl p-6 border border-indigo-100/50">
      <div className="flex items-center gap-2 mb-5">
        <Icons.Truck c="w-4 h-4 text-indigo-500" />
        <p className="text-xs font-black uppercase tracking-widest text-indigo-500">
          Order Tracking
        </p>
      </div>

      <div className="relative">
        {steps.length > 1 ? (
          <div className="absolute left-[18px] top-6 bottom-6 w-px bg-gray-200 overflow-hidden">
            <div
              ref={lineRef}
              className="w-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"
              style={{ height: "0%" }}
            />
          </div>
        ) : null}

        <div className="space-y-5">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex items-start gap-4 relative z-10"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-sm transition-all duration-300 ${
                  step.done
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-indigo-500/30"
                    : index === lastDone + 1
                      ? "bg-white border-indigo-400 text-indigo-500 shadow-sm"
                      : "bg-gray-100 border-gray-200 text-gray-300"
                }`}
              >
                {step.done ? <Icons.Check c="w-4 h-4" /> : index + 1}
              </div>

              <div className="flex-1 pt-1">
                <p className={`text-sm font-bold leading-tight ${step.done ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 ${step.done ? "text-indigo-500 font-semibold" : "text-gray-400"}`}>
                  {step.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
