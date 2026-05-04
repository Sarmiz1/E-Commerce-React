import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import FloatingOrbs from "./FloatingOrbs";
import { Icons } from "./OrderIcons";

export default function OrdersHero({ isLoading, ordersCount, onShop }) {
  const titleRef = useRef(null);
  const subRef = useRef(null);

  useEffect(() => {
    if (!titleRef.current || !subRef.current) return undefined;

    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(
      titleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", clearProps: "all" },
    ).fromTo(
      subRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", clearProps: "all" },
      "-=0.5",
    );

    return () => tl.kill();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 text-white py-14 md:py-20 px-6">
      <FloatingOrbs />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-[0.3em] mb-3">
              Your Account
            </p>
            <h1 ref={titleRef} className="text-4xl md:text-5xl font-black leading-tight">
              <span className="or-shimmer">My Orders</span>
            </h1>
            <p ref={subRef} className="text-blue-100 mt-3 text-base">
              {isLoading
                ? "Loading your orders..."
                : `${ordersCount} order${ordersCount !== 1 ? "s" : ""} in your history`}
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onShop}
            className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-[#0D1421]/15 border border-white dark:border-[#0D1421]/25 text-white font-bold px-6 py-3 rounded-2xl backdrop-blur-sm hover:bg-white dark:bg-[#0D1421]/25 transition text-sm self-start sm:self-auto"
          >
            <Icons.Bag c="w-4 h-4" />
            Continue Shopping
          </motion.button>
        </div>
      </div>
    </div>
  );
}
