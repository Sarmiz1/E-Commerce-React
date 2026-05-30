export default function VisionSection() {
  return (
    <section className="relative mx-auto flex max-w-[1600px] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-24 md:px-12 lg:py-32">
      <div className="reveal-up relative z-10 max-w-4xl mx-auto">
        <h2 className="mb-5 text-3xl font-black uppercase leading-none tracking-tighter text-[var(--about-text)] sm:mb-8 sm:text-5xl md:text-7xl">
          Built in Nigeria. <br /> Designed for Global Commerce.
        </h2>
        <p className="text-base font-medium leading-relaxed text-[var(--about-muted)] sm:text-xl md:text-2xl">
          Woosho starts by solving shopping complexity in Africa, with a
          long-term vision of becoming a global AI commerce infrastructure layer
          powering smarter retail experiences everywhere.
        </p>
      </div>
    </section>
  );
}
