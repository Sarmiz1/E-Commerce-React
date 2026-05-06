import React from "react";
import { StarRating } from "./StarRating";
import { StoreHeader } from "../../../../components/Ui/StoreHeader";
import { formatMoneyCents } from "../../../../utils/FormatMoneyCents";

export default function DetailMainInfo({ 
  product, 
  sku, 
  storeInfo, 
  storeHeaderColors, 
  onSale, 
  origPrice 
}) {
  return (
    <div className="space-y-5">
      {/* SKU + keywords */}
      <div className="pd-r flex flex-wrap items-center gap-2">
        <span
          className="pd-chip px-2.5 py-1 rounded-md"
          style={{ background: "var(--pd-s2)", color: "var(--mist)" }}
        >
          SKU: {sku}
        </span>
        {product.keywords?.slice(0, 3).map((kw) => (
          <span
            key={kw}
            className="pd-chip px-2.5 py-1 rounded-md capitalize"
            style={{
              background: "rgba(201,169,110,0.08)",
              color: "var(--gold)",
              border: "1px solid rgba(201,169,110,0.15)",
            }}
          >
            {kw}
          </span>
        ))}
      </div>

      {/* Name */}
      <div className="pd-r">
        <h1
          className="pd-display font-light leading-tight"
          style={{
            color: "var(--cream)",
            fontSize: "clamp(28px,4vw,40px)",
            letterSpacing: "-0.015em",
          }}
        >
          {product.name}
        </h1>
      </div>

      {/* Seller / Store Header */}
      <div className="pd-r">
        <StoreHeader storeInfo={storeInfo} colors={storeHeaderColors} />
      </div>

      {/* Rating */}
      {product.rating_stars && (
        <div className="pd-r">
          <StarRating
            stars={product.rating_stars}
            count={product.rating_count}
          />
        </div>
      )}

      {/* Price */}
      <div className="pd-r flex items-baseline gap-4">
        <span
          className="pd-display font-light"
          style={{
            color: "var(--cream)",
            fontSize: "clamp(32px,5vw,48px)",
            letterSpacing: "-0.02em",
          }}
        >
          {formatMoneyCents(product.price_cents)}
        </span>
        {onSale && (
          <div className="flex items-center gap-2.5">
            <span
              className="text-lg line-through opacity-30"
              style={{ color: "var(--silver)" }}
            >
              {formatMoneyCents(origPrice)}
            </span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
              style={{ background: "var(--gold)", color: "#000" }}
            >
              Sale
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
