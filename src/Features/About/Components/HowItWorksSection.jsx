import { Brain } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "../utils/data";

export default function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-[1600px] border-t border-[var(--about-border)] px-4 py-16 sm:px-6 sm:py-20 md:px-12 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="reveal-up">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--about-accent)] sm:mb-4 sm:text-sm">
            How It Works
          </h2>
          <h3 className="mb-6 text-3xl font-black uppercase tracking-tighter text-[var(--about-text)] sm:text-5xl md:mb-8 md:text-6xl">
            Intelligence On Demand.
          </h3>
          <div className="space-y-6 sm:space-y-8">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div key={item.step} className="flex items-start gap-4 sm:gap-6">
                <div className="text-2xl font-black leading-none text-[var(--about-subtle)] sm:text-3xl">
                  {item.step}
                </div>
                <p className="pt-0.5 text-base font-medium text-[var(--about-muted)] sm:pt-1 sm:text-xl">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal-up group relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-[var(--about-border)] bg-[var(--about-card-bg)] p-6 sm:aspect-square sm:p-8">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, var(--about-bg), transparent)",
            }}
          />
          <Brain className="relative z-10 h-20 w-20 text-[var(--about-text)] opacity-20 sm:h-[120px] sm:w-[120px]" />
        </div>
      </div>
    </section>
  );
}
