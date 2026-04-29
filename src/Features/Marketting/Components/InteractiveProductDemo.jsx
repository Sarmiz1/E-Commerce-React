import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useAllProducts } from "../../../Hooks/product/useProducts";
import { formatMoneyCents } from "../../../Utils/formatMoneyCents";
import { rankProductsBySemanticQuery } from "../../../Utils/semanticProductSearch";
import { trackEvent } from "../../../api/track_events";

const DEMO_QUERIES = [
  "comfortable sneakers under $80",
  "premium home gifts",
  "beauty products with great reviews",
];

export default function InteractiveProductDemo({ dark = false }) {
  const { data: products = [], isLoading } = useAllProducts();
  const [query, setQuery] = useState(DEMO_QUERIES[0]);

  const matches = useMemo(() => {
    const ranked = rankProductsBySemanticQuery(products, query);
    return (ranked.length ? ranked : products).slice(0, 3);
  }, [products, query]);

  const surface = dark
    ? "border-white/10 bg-white/[0.04] text-white"
    : "border-slate-200 bg-white text-slate-950";
  const muted = dark ? "text-white/55" : "text-slate-500";

  return (
    <section className={`px-6 py-20 ${dark ? "bg-[#08080A]" : "bg-slate-50"}`}>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-500">
            <Sparkles className="h-4 w-4" />
            AI shopping demo
          </div>
          <h2 className={`text-4xl font-black tracking-tight md:text-5xl ${dark ? "text-white" : "text-slate-950"}`}>
            Search like a person, not a filter panel.
          </h2>
          <p className={`mt-4 max-w-lg text-base leading-7 ${muted}`}>
            WooSho can translate shopper intent into product matches using names, tags, seller signals, price, and ratings.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-[2rem] border p-5 shadow-2xl ${surface}`}
        >
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"}`}>
            <Search className="h-5 w-5 text-blue-500" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                trackEvent({
                  eventType: "marketing_demo_search_changed",
                  metadata: { query: event.target.value },
                });
              }}
              className="w-full bg-transparent text-sm font-bold outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_QUERIES.map((preset) => (
              <button
                key={preset}
                onClick={() => setQuery(preset)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  query === preset
                    ? "border-blue-500 bg-blue-500 text-white"
                    : dark
                      ? "border-white/10 text-white/60 hover:text-white"
                      : "border-slate-200 text-slate-500 hover:text-slate-900"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {isLoading
              ? [0, 1, 2].map((item) => (
                  <div key={item} className={`h-24 animate-pulse rounded-2xl ${dark ? "bg-white/10" : "bg-slate-100"}`} />
                ))
              : matches.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    onClick={() =>
                      trackEvent({
                        eventType: "marketing_demo_product_clicked",
                        productId: product.id,
                        metadata: { query },
                      })
                    }
                    className={`group grid grid-cols-[76px_1fr_auto] items-center gap-4 rounded-2xl border p-3 transition ${
                      dark
                        ? "border-white/10 bg-black/20 hover:bg-white/[0.06]"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg"
                    }`}
                  >
                    <img
                      alt={product.name}
                      className="h-[76px] w-[76px] rounded-xl object-cover"
                      src={product.image}
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-black">{product.name}</p>
                      <p className={`mt-1 text-xs ${muted}`}>
                        {product.rating_stars || 0} stars · {product.seller?.store_name || "WooSho seller"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-blue-500">
                      {formatMoneyCents(product.price_cents)}
                    </p>
                  </Link>
                ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
