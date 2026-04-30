import { SELLER_OPERATIONS_UX } from "../Data/sectionsData.jsx";

export default function SellerOperationsSection() {
  return (
    <section className="bg-[#08080A] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">
            Seller operating layer
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Make selling feel predictable, not mysterious.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/55">
            Premium seller UX is not only visual polish. It is clear onboarding,
            reliable fulfillment, and dashboard decisions that tell sellers what
            to do next.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {SELLER_OPERATIONS_UX.map(({ icon: Icon, title, body }) => (
            <article
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-violet-400/30 hover:bg-white/[0.07]"
              key={title}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
