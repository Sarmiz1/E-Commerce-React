export default function ShowcaseHero({
  description,
  eyebrow = "WooSho Showcase",
  image,
  productCount,
  title,
}) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      {image && (
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          src={image}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/35" />
      <div className="relative mx-auto max-w-screen-xl px-6 py-16 sm:py-20 lg:py-24">
        <p className="mb-3 text-[11px] font-black uppercase tracking-[0.32em] text-blue-300">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          {description}
        </p>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
          {productCount} {productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </section>
  );
}
