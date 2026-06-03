import { useState } from "react";
import { Link } from "react-router-dom";
import QuickView from "../../../Components/Ui/QuickView";
import WishlistHeart from "../../../Components/Ui/WishlistHeart";
import { useAddToCart } from "../../../hooks/cart/useAddToCart";
import {
  formatShowcaseProductPrice,
  getShowcaseDiscount,
  getShowcaseOriginalPriceMinor,
  getShowcasePriceMinor,
  getShowcaseProductImage,
  getShowcaseProductPath,
  getShowcaseVariantId,
} from "../utils/showcaseProduct";
import ShowcaseStars from "./ShowcaseStars";
import ShowcaseCountdownTimer from "./ShowcaseCountdownTimer";

export default function ShowcaseProductCard({
  item,
  accent,
  editorial,
  isMostLoved,
  isContinue,
  isBrowsing,
  isHot,
  delay = 0,
  visible,
  onQuickView,
}) {
  const [hovered, setHovered] = useState(false);
  const {
    handleAdd,
    loading: addingToCart,
    success: addedToCart,
  } = useAddToCart(item.id, { variantId: getShowcaseVariantId(item), quantity: 1 });

  const discount = getShowcaseDiscount(item);
  const image = getShowcaseProductImage(item);
  const priceMinor = getShowcasePriceMinor(item);
  const originalPriceMinor = getShowcaseOriginalPriceMinor(item);
  const productPath = getShowcaseProductPath(item);

  const handleQuickAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleAdd(event);
  };

  return (
    <div
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: "0 0 200px",
        width: 200,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        background: "#f4f3f0",
        aspectRatio: "3/4",
        marginBottom: 10,
      }}>
        <Link to={productPath} aria-label={`View ${item.name}`} style={{ display: "block", width: "100%", height: "100%" }}>
          <img
            src={image}
            alt={item.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.045)" : "scale(1)",
              transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
              display: "block",
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.18)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }} />
        </Link>

        <QuickView
          product={item}
          onQuickView={onQuickView}
          className="top-2.5 right-12"
        />
        <WishlistHeart
          productId={item.id}
          className="absolute top-2.5 right-2.5"
        />

        {item.badge && (
          <div style={{
            position: "absolute", bottom: 10, left: 10,
            background: discount ? accent : "rgba(0,0,0,0.8)",
            color: "#fff",
            fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 4,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}>
            {item.badge}
          </div>
        )}
        {item.timeLeft && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "rgba(0,0,0,0.85)",
            padding: "4px 8px", borderRadius: 4,
          }}>
            <ShowcaseCountdownTimer label={item.timeLeft} />
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 10px",
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          opacity: hovered ? 1 : 0,
          transition: "transform 0.3s ease, opacity 0.3s ease",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={addingToCart}
            style={{
              background: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              padding: "6px 12px",
              cursor: addingToCart ? "wait" : "pointer",
              color: "#1a1a1a",
              minWidth: 78,
            }}
          >
            {addingToCart ? "Adding" : addedToCart ? "Added" : "Quick Add"}
          </button>
        </div>
      </div>

      <div>
        {isContinue && item.progress && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase", color: accent,
            display: "block", marginBottom: 3,
          }}>{item.progress} {"\u00b7"} {item.lastSeen}</span>
        )}
        {(isBrowsing || item.reason) && item.reason && (
          <span style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 3, letterSpacing: 0.3 }}>
            {item.reason}
          </span>
        )}
        {isHot && item.velocity && (
          <span style={{ fontSize: 9, color: accent, fontWeight: 700, letterSpacing: 0.5, display: "block", marginBottom: 3 }}>
            {item.velocity}
          </span>
        )}
        {isMostLoved && item.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <ShowcaseStars rating={item.rating} />
            <span style={{ fontSize: 10, color: "#999" }}>{item.reviews?.toLocaleString()}</span>
          </div>
        )}
        {editorial && item.note && (
          <p style={{ fontSize: 10, color: "#999", margin: "0 0 3px", fontStyle: "italic", letterSpacing: 0.2 }}>
            "{item.note}"
          </p>
        )}
        <p style={{ margin: 0, fontSize: 10, color: "#888", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>{item.brand}</p>
        <Link to={productPath} style={{ textDecoration: "none" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#0f0f0f", lineHeight: 1.3, marginBottom: 5 }}>{item.name}</p>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: discount ? accent : "#0f0f0f" }}>
            {formatShowcaseProductPrice(item, priceMinor)}
          </span>
          {originalPriceMinor > priceMinor && (
            <span style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>
              {formatShowcaseProductPrice(item, originalPriceMinor)}
            </span>
          )}
        </div>
        {item.sold && (
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "#aaa" }}>{item.sold.toLocaleString()} sold</p>
        )}
      </div>
    </div>
  );
}
