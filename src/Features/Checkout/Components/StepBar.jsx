import { motion } from "framer-motion";
import { CHECKOUT_STEPS } from "../Utils/checkoutConstants";
import { Icon } from "./CheckoutIcons";

export function StepBar({ step }) {
  return (
    <div className="mb-10 flex items-center justify-center px-2">
      {CHECKOUT_STEPS.map((label, index) => {
        const done = index < step;
        const current = index === step;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={done ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.35 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all duration-300 sm:h-9 sm:w-9 sm:text-sm ${
                  done
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : current
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-200"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Icon.Check className="h-3.5 w-3.5" /> : index + 1}
              </motion.div>
              <span className={`whitespace-nowrap text-[10px] font-bold transition-colors duration-200 ${current || done ? "text-indigo-700" : "text-gray-400"}`}>
                {label}
              </span>
            </div>

            {index < CHECKOUT_STEPS.length - 1 && (
              <div className="mx-2 mb-4 h-0.5 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 sm:mx-3 sm:w-16">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
