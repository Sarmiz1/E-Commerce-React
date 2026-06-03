import { Link } from "react-router-dom";

export default function ShowcaseAdvert({
  colors,
  image,
  title,
  browsePath = "/products",
  eyebrow = "More to discover",
  heading,
  body = "Browse the complete marketplace for more products from independent stores.",
  cta = "Browse all products",
}) {
  return (
    <section className="mx-auto max-w-screen-xl px-6 pt-8">
      <div
        className="relative overflow-hidden rounded-[28px] border px-6 py-7 shadow-sm sm:px-8"
        style={{
          background: colors.surface.secondary,
          borderColor: colors.border.subtle,
        }}
      >
        {image && (
          <img
            alt=""
            className="absolute inset-y-0 right-0 hidden h-full w-2/5 object-cover opacity-35 sm:block"
            src={image}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5" />
        <div className="relative max-w-2xl">
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em]"
            style={{ color: colors.text.accent }}
          >
            {eyebrow}
          </p>
          <h2
            className="mt-2 font-serif text-2xl font-bold"
            style={{ color: colors.text.primary }}
          >
            {heading || `Explore beyond ${title}`}
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: colors.text.secondary }}>
            {body}
          </p>
          <Link
            className="mt-5 inline-flex rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-opacity hover:opacity-90"
            style={{
              background: colors.cta.primary,
              color: colors.cta.primaryText,
            }}
            to={browsePath}
          >
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
