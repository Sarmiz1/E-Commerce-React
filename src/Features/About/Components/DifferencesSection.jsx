import { DIFFERENCES } from "../utils/data";

export default function DifferencesSection() {
  return (
    <section className="mx-auto max-w-[1600px] border-t border-[var(--about-border)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 lg:py-24">
      <div className="reveal-up mb-10 text-center sm:mb-16">
        <h2 className="mx-auto max-w-3xl text-3xl font-black uppercase leading-none tracking-tighter text-[var(--about-text)] sm:text-4xl md:text-6xl">
          Not a Marketplace.
          <br />
          <span className="text-[var(--about-subtle)]">A Decision System.</span>
        </h2>
      </div>
      <div className="stagger-grid grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5">
        {DIFFERENCES.map((difference) => (
          <div
            key={difference.title}
            className="flex flex-col border border-[var(--about-border)] bg-[var(--about-card-bg)] p-6 transition-colors hover:bg-[var(--about-card-hover)] sm:p-8"
          >
            <difference.icon size={24} className="mb-4 text-[var(--about-text)] sm:mb-6" />
            <h4 className="text-lg font-bold text-[var(--about-text)] mb-2">
              {difference.title}
            </h4>
            <p className="text-sm text-[var(--about-muted)] leading-relaxed">
              {difference.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
