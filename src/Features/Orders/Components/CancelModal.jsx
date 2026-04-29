import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Spinner from "./Spinner";
import { Icons } from "./OrderIcons";

export default function CancelModal({ onConfirm, onDismiss, isLoading }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!modalRef.current) return undefined;

    gsap.fromTo(
      modalRef.current,
      { x: -8 },
      { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
    );

    return () => gsap.killTweensOf(modalRef.current);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      />

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-[min(400px,90vw)] text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5 text-red-500">
          <Icons.Alert c="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Cancel this order?</h3>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          This action cannot be undone. The order will be cancelled and the refund process will begin.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition text-sm"
          >
            Keep Order
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-red-500/25 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : null}
            Yes, Cancel
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
