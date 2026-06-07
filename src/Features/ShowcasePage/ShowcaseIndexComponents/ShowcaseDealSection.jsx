import { Link } from "react-router-dom";
import QuickView from "../../../Components/Ui/QuickView";
import WishlistHeart from "../../../Components/Ui/WishlistHeart";
import { useAddToCart } from "../../../hooks/cart/useAddToCart";
import { useTheme } from "../../../Store/useThemeStore";
import {
  formatShowcaseProductPrice,
  getShowcaseDiscount,
  getShowcaseOriginalPriceMinor,
  getShowcasePriceMinor,
  getShowcaseProductImage,
  getShowcaseProductPath,
  getShowcaseVariantId,
} from "../utils/showcaseProduct";

function DealSideItem({ item, accent, index, visible, colors }) {
  const discount = getShowcaseDiscount(item);
  const priceMinor = getShowcasePriceMinor(item);
  const originalPriceMinor = getShowcaseOriginalPriceMinor(item);

  return (
    <Link
      className="showcase-deal-side-item"
      to={getShowcaseProductPath(item)}
      style={{
        display: "flex", gap: 14, alignItems: "center",
        background: colors.surface.secondary,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: 12, overflow: "hidden",
        padding: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        transition: `opacity 0.5s ease ${100 + index * 80}ms, transform 0.5s ease ${100 + index * 80}ms`,
        textDecoration: "none",
      }}
    >
      <img src={getShowcaseProductImage(item)} alt={item.name}
        style={{ width: 90, height: 90, objectFit: "cover", flexShrink: 0 }} />
      <div style={{ flex: 1, paddingRight: 16 }}>
        <p style={{ margin: "0 0 2px", fontSize: 10, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: 0 }}>{item.brand}</p>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: colors.text.primary }}>{item.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{formatShowcaseProductPrice(item, priceMinor)}</span>
          {originalPriceMinor > priceMinor && (
            <span style={{ fontSize: 11, color: colors.text.tertiary, textDecoration: "line-through" }}>{formatShowcaseProductPrice(item, originalPriceMinor)}</span>
          )}
          {discount && (
            <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: accent, padding: "2px 5px", borderRadius: 3 }}>{discount}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ShowcaseDealSection({ section, visible, onQuickView }) {
  const { colors, isDark } = useTheme();
  const featured = section.featured;
  const stock = Number(featured.stock || featured.stock_quantity || 0);
  const sold = Number(featured.sold || 0);
  const pct = stock ? Math.round((sold / stock) * 100) : 0;
  const discount = getShowcaseDiscount(featured);
  const priceMinor = getShowcasePriceMinor(featured);
  const originalPriceMinor = getShowcaseOriginalPriceMinor(featured);
  const {
    handleAdd,
    loading: addingToCart,
    success: addedToCart,
  } = useAddToCart(featured.id, { variantId: getShowcaseVariantId(featured), quantity: 1 });

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      <div className="showcase-deal-grid" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 20, marginBottom: 20,
      }}>
        <div style={{
          background: isDark ? colors.surface.elevated : "#0f0f0f",
          border: `1px solid ${isDark ? colors.border.default : "transparent"}`,
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}>
          <div className="group" style={{ position: "relative", flex: 1, minHeight: 300 }}>
            <Link to={getShowcaseProductPath(featured)} style={{ display: "block", width: "100%", height: "100%" }}>
              <img src={getShowcaseProductImage(featured)} alt={featured.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75, display: "block" }} />
            </Link>
            {discount && (
              <div style={{ position: "absolute", top: 16, left: 16 }}>
                <span style={{
                  background: section.accent, color: "#fff",
                  fontSize: 12, fontWeight: 800,
                  padding: "5px 12px", borderRadius: 5,
                  letterSpacing: 0,
                }}>{discount}% OFF</span>
              </div>
            )}
            <QuickView
              product={featured}
              onQuickView={onQuickView}
              className="top-4 right-14"
            />
            <WishlistHeart
              productId={featured.id}
              className="absolute top-4 right-4"
            />
          </div>
          <div style={{ padding: "20px 20px 22px" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: isDark ? colors.text.secondary : "#777", textTransform: "uppercase", letterSpacing: 0 }}>{featured.brand}</p>
            <Link to={getShowcaseProductPath(featured)} style={{ textDecoration: "none" }}>
              <p style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{featured.name}</p>
            </Link>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: section.accent }}>
                {formatShowcaseProductPrice(featured, priceMinor)}
              </span>
              {originalPriceMinor > priceMinor && (
                <span style={{ fontSize: 14, color: isDark ? colors.text.tertiary : "#555", textDecoration: "line-through" }}>
                  {formatShowcaseProductPrice(featured, originalPriceMinor)}
                </span>
              )}
            </div>
            {stock > 0 && (
              <>
                <p style={{ fontSize: 10, color: isDark ? colors.text.secondary : "#666", marginBottom: 5 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{sold}</span> of {stock} sold
                </p>
                <div style={{ height: 4, background: isDark ? colors.surface.tertiary : "#2a2a2a", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: section.accent,
                    borderRadius: 2,
                    transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
                  }} />
                </div>
              </>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={addingToCart}
              style={{
                width: "100%", marginTop: 16,
                background: section.accent, color: "#fff",
                border: "none", borderRadius: 8,
                fontSize: 12, fontWeight: 700, letterSpacing: 0,
                textTransform: "uppercase",
                padding: "12px 0",
                cursor: addingToCart ? "wait" : "pointer",
              }}
            >
              {addingToCart ? "Adding" : addedToCart ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {section.items.map((item, i) => (
            <DealSideItem key={item.id} item={item} accent={section.accent} index={i} visible={visible} colors={colors} />
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 767px) {
          .showcase-deal-grid {
            grid-template-columns: 1fr !important;
          }
          .showcase-deal-side-item img {
            width: 82px !important;
            height: 82px !important;
          }
        }
      `}</style>
    </div>
  );
}
