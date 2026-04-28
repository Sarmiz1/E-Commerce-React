import { useMemo, useState } from "react";
import { COLOR_KEYWORDS, SIZE_TABLES } from "../Features/Product/Utils/constants";
import { PRODUCT_COLORS, SIZE_MAP, getProductCategory } from "../Features/Product/ProductDetails/Utils/productHelpers";

/**
 * useProductInventory
 * The authoritative global hook for managing a product's variants, colors, and international size mappings.
 * Merges variant extraction, hex-color mapping, and multi-system size guide logic.
 */
export function useProductInventory(product) {
  const [sizeSystem, setSizeSystem] = useState("Standard");

  // 1. Category & Type Detection
  const category = useMemo(() => getProductCategory(product?.keywords || []), [product]);
  
  const productType = useMemo(() => {
    if (!product) return null;
    
    // Primary detection via keywords
    if (category === "shoes") return "footwear";
    if (category === "apparel") return "apparel";
    
    // Secondary detection via name/description scanning
    const text = [
      product.name || "",
      product.short_description || "",
      product.description || ""
    ].join(" ").toLowerCase();

    if (/shoe|sneaker|footwear|heel|flat|boot/.test(text)) return "footwear";
    if (/apparel|shirt|sweater|pant|dress|hoodie|sock|beanie|shorts|robe/.test(text)) return "apparel";
    
    return null;
  }, [product, category]);

  // 2. Color Management
  const availableColors = useMemo(() => {
    if (!product?.product_variants?.length) {
      return PRODUCT_COLORS[category] || PRODUCT_COLORS.default;
    }
    
    const unique = Array.from(
      new Set(product.product_variants.map((v) => v.color).filter(Boolean))
    );
    
    return unique.map((name) => ({
      name,
      label: name, // For modal compatibility
      hex: COLOR_KEYWORDS[name.toLowerCase()] || "#888",
    }));
  }, [product, category]);

  // 3. Raw Size Extraction
  const rawSizes = useMemo(() => {
    if (!product?.product_variants?.length) {
      const defaultSizes = SIZE_MAP[category] || [];
      return Array.isArray(defaultSizes) ? defaultSizes : [];
    }
    return Array.from(
      new Set(product.product_variants.map((v) => v.size).filter(Boolean))
    );
  }, [product, category]);

  // 4. Size Mapping & System Conversion
  const availableSystems = useMemo(() => {
    if (!productType || !SIZE_TABLES[productType]) return [];
    return Object.keys(SIZE_TABLES[productType]);
  }, [productType]);

  const nativeSystem = useMemo(() => {
    if (!productType || !rawSizes.length) return "Standard";
    
    const table = SIZE_TABLES[productType];
    let bestMatch = "Standard";
    let maxMatches = -1;

    Object.entries(table).forEach(([sys, values]) => {
      const matchCount = rawSizes.filter(s => values.includes(String(s))).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = sys;
      }
    });

    return bestMatch;
  }, [productType, rawSizes]);

  const displaySizes = useMemo(() => {
    if (!rawSizes.length) return null;
    
    // Fallback to raw values if mapping is impossible
    if (!productType || !availableSystems.includes(sizeSystem)) {
      return rawSizes.map(s => ({ raw: s, display: s }));
    }

    const table = SIZE_TABLES[productType];
    const sourceValues = table[nativeSystem];
    const targetValues = table[sizeSystem];

    return rawSizes.map((s) => {
      const idx = sourceValues.indexOf(String(s));
      return {
        raw: s,
        display: idx !== -1 ? targetValues[idx] || s : s
      };
    });
  }, [rawSizes, sizeSystem, productType, nativeSystem, availableSystems]);

  return {
    availableColors,
    rawSizes,
    displaySizes,
    productType,
    sizeSystem,
    setSizeSystem,
    availableSystems,
    hasSizes: rawSizes.length > 0,
    sizeTable: productType ? SIZE_TABLES[productType] : null,
    category
  };
}
