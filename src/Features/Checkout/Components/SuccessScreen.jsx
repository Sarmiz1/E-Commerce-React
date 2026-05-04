import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { CONFIRMATION_STEPS } from "../Utils/checkoutConstants";
import {
  getCartItemImage,
  getCartItemKey,
  getCartItemName,
  getCartItemQuantity,
} from "../Utils/checkoutUtils";
import { Icon } from "./CheckoutIcons";

const CONFETTI_PIECES = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 4.17).toFixed(1)}%`,
  delay: (index * 0.025).toFixed(3),
  color: ["#6366f1", "#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"][
    index % 6
  ],
  size: 6 + (index % 9),
  round: index % 2 === 0,
  dur: (0.8 + (index % 5) * 0.12).toFixed(2),
}));

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {CONFETTI_PIECES.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: "absolute",
            left: piece.left,
            top: "30%",
            width: piece.size,
            height: piece.size,
            background: piece.color,
            borderRadius: piece.round ? "50%" : "2px",
            animation: `co-confetti ${piece.dur}s ${piece.delay}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}

function OrderedItem({ item }) {
  const image = getCartItemImage(item);

  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-white/10">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] font-black uppercase text-gray-300 dark:text-gray-600">
            Item
          </div>
        )}
      </div>
      <p className="line-clamp-1 flex-1 text-sm text-gray-700 dark:text-gray-200">
        {getCartItemName(item)}
      </p>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
        x{getCartItemQuantity(item)}
      </p>
    </div>
  );
}

export function SuccessScreen({ orderNumber, cart, total }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const timeline = gsap.timeline({ delay: 0.3 });
    timeline.fromTo(
      element.querySelectorAll(".co-s-item"),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.75,
        ease: "power3.out",
        clearProps: "all",
      },
    );
  }, []);

  return (
    <div ref={ref} className="relative mx-auto max-w-lg py-10 text-center">
      <Confetti />

      <div className="co-s-item mb-8 flex justify-center">
        <div className="co-success-ring flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-indigo-500/40">
          <Icon.Check className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="co-s-item mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-500">
          Order Confirmed
        </span>
      </div>
      <h2 className="co-s-item mb-3 text-4xl font-black text-gray-900 dark:text-gray-100">
        You are all set!
      </h2>
      <p className="co-s-item mb-6 text-base leading-relaxed text-gray-500 dark:text-gray-400 dark:text-gray-500">
        Your order has been placed and is being processed. You will receive a
        confirmation email shortly.
      </p>

      <div className="co-s-item mb-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="mb-1 text-xs text-gray-400 dark:text-gray-500">
          Order Number
        </p>
        <p className="font-mono text-2xl font-black tracking-widest text-indigo-700">
          {orderNumber}
        </p>
      </div>

      <div className="co-s-item mb-8 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-5 text-left shadow-sm">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Items Ordered
        </p>
        <div className="space-y-2">
          {cart.slice(0, 4).map((item) => (
            <OrderedItem key={getCartItemKey(item)} item={item} />
          ))}
          {cart.length > 4 && (
            <p className="pl-12 text-xs text-gray-400 dark:text-gray-500">
              +{cart.length - 4} more items
            </p>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-100 dark:border-white/10 pt-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">
            Order Total
          </span>
          <span className="font-black text-indigo-700">
            {formatMoneyCents(total)}
          </span>
        </div>
      </div>

      <div className="co-s-item mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CONFIRMATION_STEPS.map((step, index) => {
          const StepIcon =
            [Icon.Info, Icon.Bag, Icon.Truck][index] || Icon.Check;

          return (
            <div
              key={step.label}
              className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 text-center"
            >
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-white/5 text-indigo-500">
                <StepIcon className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {step.label}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                {step.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div className="co-s-item flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/products">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25"
          >
            Continue Shopping
          </motion.button>
        </Link>
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl border border-gray-200 dark:border-white/10 px-8 py-3.5 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            Back to Home
          </motion.button>
        </Link>
        <Link to="/track-order">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-2xl border border-gray-200 dark:border-white/10 px-8 py-3.5 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            Track Order
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
