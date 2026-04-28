import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock3, ArrowRight } from "lucide-react";
import ProductCard from "../../../../Components/Ui/ProductCard";
import { useTheme } from "../../../../Context/theme/ThemeContext";

export default function ContinueShoppingSection({ products }) {
  const { colors, isDark } = useTheme();

  if (!products?.length) return null;

  return (
    <section
      className="border-y py-20"
      style={{
        background: colors.surface.tertiary,
        borderColor: colors.border.subtle,
      }}
    >
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em]"
              style={{
                borderColor: colors.border.default,
                color: colors.text.accent,
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.65)",
              }}
            >
              <Clock3 className="h-3.5 w-3.5" />
              Continue shopping
            </div>
            <h2
              className="text-3xl font-black tracking-tight md:text-4xl"
              style={{ color: colors.text.primary }}
            >
              Still thinking about these?
            </h2>
            <p className="mt-2 max-w-xl text-sm" style={{ color: colors.text.tertiary }}>
              Recently viewed products and high-signal picks stay close so shoppers can resume quickly.
            </p>
          </div>
          <Link
            to="/products?sort=recommended"
            className="inline-flex items-center gap-2 text-sm font-black"
            style={{ color: colors.text.accent }}
          >
            Browse more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} variant="compact" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
