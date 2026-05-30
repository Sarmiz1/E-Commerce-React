import { TRUST_PILLARS } from "../utils/data";

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-[1600px] border-t border-[var(--about-border)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 lg:py-24">
      <div className="stagger-grid grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 md:grid-cols-4 md:gap-4">
        {TRUST_PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className="flex items-center gap-4 rounded-2xl border border-[var(--about-border)] bg-[var(--about-card-bg)] p-5 text-left sm:flex-col sm:gap-0 sm:border-0 sm:bg-transparent sm:p-0 sm:text-center"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--about-icon-bg)] sm:mb-6 sm:h-16 sm:w-16">
              <pillar.icon size={24} className="text-[var(--about-text)]" />
            </div>
            <div>
              <h4 className="mb-1 text-base font-bold text-[var(--about-text)] sm:mb-2 sm:text-lg">
                {pillar.title}
              </h4>
              <p className="text-sm text-[var(--about-subtle)] sm:mx-auto sm:max-w-[200px]">
                {pillar.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
