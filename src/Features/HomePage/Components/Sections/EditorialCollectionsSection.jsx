import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../../../../Context/theme/ThemeContext";
import { EDITORIAL_COLLECTIONS } from "../../homeSectionsConfig";

export default function EditorialCollectionsSection({ products }) {
  const { colors } = useTheme();

  if (!products?.length) return null;

  return (
    <section className="py-24" style={{ background: colors.surface.primary }}>
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">
              Editorial collections
            </p>
            <h2
              className="mt-2 text-4xl font-black tracking-tight md:text-5xl"
              style={{ color: colors.text.primary }}
            >
              Shop by moment
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6" style={{ color: colors.text.tertiary }}>
            Curated product stories give the marketplace a point of view beyond raw category browsing.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {EDITORIAL_COLLECTIONS.map((collection, index) => {
            const product = products[index % products.length];

            return (
              <motion.article
                key={collection.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group relative min-h-[420px] overflow-hidden rounded-[2rem] bg-slate-900"
              >
                <img
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105"
                  src={product.image}
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.accent} opacity-55 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative flex h-full min-h-[420px] flex-col justify-end p-7 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">
                    {collection.eyebrow}
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight">
                    {collection.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    {collection.description}
                  </p>
                  <Link
                    to={`/products?search=${encodeURIComponent(collection.query)}`}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
                  >
                    Shop collection
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

