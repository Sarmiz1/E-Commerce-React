import { PROBLEMS } from "../utils/data";

export default function ProblemsSection() {
  return (
    <section className="mx-auto max-w-[1600px] border-t border-[var(--about-border)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 lg:py-24">
      <div className="reveal-up mb-10 text-center sm:mb-16">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--about-subtle)] sm:mb-4 sm:text-sm">
          The Status Quo
        </h2>
        <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--about-text)] sm:text-4xl md:text-6xl">
          Online Shopping Is Too Slow
          <br />
          And Overwhelming.
        </h3>
      </div>
      <div className="stagger-grid grid gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8">
        {PROBLEMS.map((problem) => (
          <div
            key={problem.title}
            className="flex flex-col items-start border border-[var(--about-border)] bg-[var(--about-card-bg)] p-6 text-left transition-colors hover:bg-[var(--about-card-hover)] sm:items-center sm:p-8 sm:text-center lg:p-10"
          >
            <problem.icon size={36} className="mb-4 text-[var(--about-subtle)] sm:mb-6" />
            <h4 className="mb-3 text-xl font-bold text-[var(--about-text)] sm:mb-4 sm:text-2xl">
              {problem.title}
            </h4>
            <p className="text-[var(--about-muted)] leading-relaxed">{problem.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
