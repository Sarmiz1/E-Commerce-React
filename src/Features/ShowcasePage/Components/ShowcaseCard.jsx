import { Link } from "react-router-dom";

const CARD_GRADIENTS = [
  "from-blue-950 via-indigo-900 to-violet-700",
  "from-slate-950 via-slate-800 to-blue-700",
  "from-violet-950 via-fuchsia-900 to-rose-700",
  "from-emerald-950 via-teal-900 to-cyan-700",
  "from-amber-950 via-orange-900 to-rose-700",
  "from-zinc-950 via-neutral-800 to-slate-600",
];

export default function ShowcaseCard({ item, index, basePath = "/products/curation" }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const count = item.productCount ?? item.count ?? 0;

  return (
    <Link
      className={`group relative min-h-64 overflow-hidden rounded-[28px] bg-gradient-to-br ${gradient} p-6 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
      to={item.path || `${basePath}/${item.slug}`}
    >
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full border border-white/15" />
      <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-white/5 blur-xl" />
      <div className="relative flex h-full flex-col">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
          {item.eyebrow || "WooSho Showcase"}
        </p>
        <h2 className="mt-5 font-serif text-3xl font-bold tracking-tight">
          {item.name || item.label}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/75">
          {item.description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70">
            {count} {count === 1 ? "product" : "products"}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg transition group-hover:bg-white group-hover:text-slate-950">
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
