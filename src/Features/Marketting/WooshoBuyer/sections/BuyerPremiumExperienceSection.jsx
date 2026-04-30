import { BUYER_PREMIUM_UX } from "../Data/sectionsData.jsx";

export default function BuyerPremiumExperienceSection() {
  return (
    <section className="bg-white px-6 py-24 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
            Buyer confidence layer
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
            Make shopping feel standard, safe, and premium.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500 dark:text-white/55">
            These are the UX systems that make WooSho feel dependable after the
            first impression: clear delivery, verified trust, and memory that
            makes every visit faster.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {BUYER_PREMIUM_UX.map(({ icon: Icon, title, body }) => (
            <article
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
              key={title}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-white/55">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
