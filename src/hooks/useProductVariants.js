import { useMemo } from "react";
import { COLOR_KEYWORDS } from "../Features/Product/Utils/constants";
import { PRODUCT_COLORS, SIZE_MAP } from "../Features/Product/ProductDetails/Utils/productHelpers";

/**
 * Custom hook to extract and format unique color and size variants from a product.
 * Falls back to category defaults if no variant data is available.
 */
export function useProductVariants(product, category) {
  const availableColors = useMemo(() => {
    if (!product?.product_variants?.length) {
      return PRODUCT_COLORS[category] || PRODUCT_COLORS.default;
    }
    
    // Extract unique colors and map to hex codes
    const uniqueColors = Array.from(
      new Set(product.product_variants.map((v) => v.color).filter(Boolean))
    );
    
    return uniqueColors.map((name) => ({
      name,
      label: name, // For compatibility with modal expectations
      hex: COLOR_KEYWORDS[name.toLowerCase()] || "#888",
    }));
  }, [product, category]);

  const availableSizes = useMemo(() => {
    if (!product?.product_variants?.length) {
      return SIZE_MAP[category] || null;
    }
    
    // Extract unique sizes
    return Array.from(
      new Set(product.product_variants.map((v) => v.size).filter(Boolean))
    );
  }, [product, category]);

  return { availableColors, availableSizes };
}
