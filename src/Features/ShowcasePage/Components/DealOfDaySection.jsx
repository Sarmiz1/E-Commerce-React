import { Link } from "react-router-dom";
import QuickView from "../../../Components/Ui/QuickView";
import WishlistHeart from "../../../Components/Ui/WishlistHeart";
import { useAddToCart } from "../../../hooks/cart/useAddToCart";
import { formatShowcasePrice } from "../data";

function DealSideItem({ item, accent, index, visible }) {
  const discount = Math.round((1 - item.price / item.originalPrice) * 100);

  return (
    <Link
      to={`/products/${item.slug || item.id}`}
      style={{
        display: "flex", gap: 14, alignItems: "center",
        background: "#fafaf8",
        borderRadius: 12, overflow: "hidden",
        padding: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        transition: `opacity 0.5s ease ${100 + index * 80}ms, transform 0.5s ease ${100 + index * 80}ms`,
        textDecoration: "none",
      }}
    >
      <img src={item.img} alt={item.name}
        style={{ width: 90, height: 90, objectFit: "cover", flexShrink: 0 }} />
      <div style={{ flex: 1, paddingRight: 16 }}>
        <p style={{ margin: "0 0 2px", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.brand}</p>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{item.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{formatShowcasePrice(item.price)}</span>
          <span style={{ fontSize: 11, color: "#bbb", textDecoration: "line-through" }}>{formatShowcasePrice(item.originalPrice)}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: accent, padding: "2px 5px", borderRadius: 3 }}>{discount}%</span>
        </div>
      </div>
    </Link>
  );
}

export default function DealOfDaySection({ section, visible, onQuickView }) {
  const featured = section.featured;
  const pct = Math.round((featured.sold / featured.stock) * 100);
  const discount = Math.round((1 - featured.price / featured.originalPrice) * 100);
  const {
    handleAdd,
    loading: addingToCart,
    success: addedToCart,
  } = useAddToCart(featured.id, { variantId: featured.variant_id, quantity: 1 });

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.6s ease, transform 0.6s ease",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 20, marginBottom: 20,
      }}>
        <div style={{
          background: "#0f0f0f",
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}>
          <div className="group" style={{ position: "relative", flex: 1, minHeight: 300 }}>
            <Link to={`/products/${featured.slug || featured.id}`} style={{ display: "block", width: "100%", height: "100%" }}>
              <img src={featured.img} alt={featured.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75, display: "block" }} />
            </Link>
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <span style={{
                background: section.accent, color: "#fff",
                fontSize: 12, fontWeight: 800,
                padding: "5px 12px", borderRadius: 5,
                letterSpacing: 1,
              }}>{discount}% OFF</span>
            </div>
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
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 1 }}>{featured.brand}</p>
            <Link to={`/products/${featured.slug || featured.id}`} style={{ textDecoration: "none" }}>
              <p style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{featured.name}</p>
            </Link>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: section.accent }}>
                {formatShowcasePrice(featured.price)}
              </span>
              <span style={{ fontSize: 14, color: "#555", textDecoration: "line-through" }}>
                {formatShowcasePrice(featured.originalPrice)}
              </span>
            </div>
            <p style={{ fontSize: 10, color: "#666", marginBottom: 5 }}>
              <span style={{ color: "#fff", fontWeight: 600 }}>{featured.sold}</span> of {featured.stock} sold
            </p>
            <div style={{ height: 4, background: "#2a2a2a", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct}%`,
                background: section.accent,
                borderRadius: 2,
                transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
              }} />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={addingToCart}
              style={{
                width: "100%", marginTop: 16,
                background: section.accent, color: "#fff",
                border: "none", borderRadius: 8,
                fontSize: 12, fontWeight: 700, letterSpacing: 1,
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
            <DealSideItem key={item.id} item={item} accent={section.accent} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </div>
  );
}
