export default function SolutionSection() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-24 md:px-12 lg:py-32">
      <div className="reveal-up relative flex flex-col items-center overflow-hidden bg-blue-600 p-7 text-center text-white sm:p-12 md:p-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
        <h2 className="relative z-10 mb-5 max-w-4xl text-3xl font-black uppercase leading-none tracking-tighter sm:mb-8 sm:text-5xl md:text-7xl">
          Woosho Makes Commerce Intelligent.
        </h2>
        <p className="relative z-10 mb-8 max-w-3xl text-base font-medium leading-relaxed text-blue-100 sm:mb-12 sm:text-xl md:text-2xl">
          We use AI to understand what you're looking for, improve product
          discovery, and help you compare and decide faster.
        </p>
        <div className="relative z-10 inline-block border-2 border-white/20 bg-black/10 px-4 py-3 text-xs font-black uppercase leading-relaxed tracking-[0.12em] backdrop-blur-sm sm:px-8 sm:py-4 sm:text-lg sm:tracking-widest">
          Less searching. More buying confidence.
        </div>
      </div>
    </section>
  );
}
