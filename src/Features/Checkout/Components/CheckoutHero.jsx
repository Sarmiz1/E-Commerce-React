import { Icon } from "./CheckoutIcons";
import { FloatingOrbs } from "./FloatingOrbs";

function getTitle(step) {
  if (step === 2) return <span className="co-shimmer">Order Confirmed!</span>;
  if (step === 1) return "Your Details";
  return "Review Your Bag";
}

export function CheckoutHero({ heroRef, step, itemCount }) {
  return (
    <div ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800 px-4 pb-10 pt-24 sm:px-6 md:pb-14">
      <FloatingOrbs />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-blue-200">WooSho · Secure Checkout</p>
        <h1 className="mb-2 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">{getTitle(step)}</h1>
        {step < 2 && (
          <p className="mt-2 text-sm text-blue-200">
            {itemCount} item{itemCount !== 1 ? "s" : ""} · <Icon.Lock className="mr-1 inline h-3 w-3" />
            Encrypted & Secure
          </p>
        )}
      </div>
    </div>
  );
}
