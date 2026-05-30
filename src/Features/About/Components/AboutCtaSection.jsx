import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSellerCtaHref } from "../Hooks/useSellerCtaHref";

export default function AboutCtaSection() {
  const sellerCtaHref = useSellerCtaHref();

  return (
    <section className="border-t border-[var(--about-border)] bg-[var(--about-section-bg)] px-4 py-20 text-center sm:px-6 sm:py-24 lg:py-32">
      <div className="reveal-up max-w-3xl mx-auto">
        <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter text-[var(--about-text)] sm:text-4xl md:mb-10 md:text-6xl">
          Join The Future.
        </h2>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/ai-shop"
            className="w-full bg-[var(--about-cta-bg)] px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--about-cta-text)] transition-colors hover:bg-blue-600 hover:text-white sm:w-auto sm:px-10 sm:py-5 sm:text-sm"
          >
            Start Shopping Smarter
          </Link>
          <Link
            to={sellerCtaHref}
            className="w-full border border-[var(--about-border-strong)] bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-widest text-[var(--about-text)] transition-colors hover:border-[var(--about-text)] sm:w-auto sm:px-10 sm:py-5 sm:text-sm"
          >
            Become a Seller
          </Link>
        </div>
        <div className="mt-8">
          <Link
            to="/analytics"
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase leading-relaxed tracking-widest text-[var(--about-subtle)] transition-colors hover:text-[var(--about-text)] sm:text-sm"
          >
            Explore Platform Infrastructure <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
