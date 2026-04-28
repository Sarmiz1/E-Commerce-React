// src/Hooks/product/useSizeGuide.js
import { useMemo, useState } from "react";
import { SIZE_TABLES } from "../../Features/Product/Utils/constants";

/**
 * Custom hook to handle complex size mapping and system switching
 * @param {Object} product - The product object from Supabase
 */
export const useSizeGuide = (product) => {
  const [sizeSystem, setSizeSystem] = useState("Standard");

  // 1. Extract raw sizes from variants
  const rawSizes = useMemo(() => {
    if (!product?.product_variants) return [];
    const unique = new Set(
      product.product_variants
        .map((v) => v.size)
        .filter(Boolean)
    );
    return Array.from(unique);
  }, [product]);

  // 2. Detect Product Type (Footwear vs Apparel)
  const productType = useMemo(() => {
    if (!product) return null;
    const text = [
      product.name || "",
      product.short_description || "",
      ...(product.keywords || []),
      product.category?.name || ""
    ]
      .join(" ")
      .toLowerCase();

    if (text.match(/shoe|boot|sneaker|footwear|heel|sandal|slide/)) return "footwear";
    if (text.match(/shirt|dress|top|pant|jacket|hoodie|clothing|apparel|suit|short/)) return "apparel";
    
    return null;
  }, [product]);

  // 3. Determine available systems for this type
  const availableSystems = useMemo(() => {
    if (!productType || !SIZE_TABLES[productType]) return [];
    return Object.keys(SIZE_TABLES[productType]);
  }, [productType]);

  // 4. Detect the "Native" system of the product (to know what we are converting FROM)
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

  // 5. Map sizes to the currently selected system
  const displaySizes = useMemo(() => {
    if (!rawSizes.length) return null;
    if (!productType || !availableSystems.includes(sizeSystem)) return rawSizes;

    const table = SIZE_TABLES[productType];
    const sourceValues = table[nativeSystem];
    const targetValues = table[sizeSystem];

    return rawSizes.map((s) => {
      const idx = sourceValues.indexOf(String(s));
      // If we find the size in the native system, map it to the target system index
      return idx !== -1 ? targetValues[idx] || s : s;
    });
  }, [rawSizes, sizeSystem, productType, nativeSystem, availableSystems]);

  return {
    rawSizes,
    displaySizes,
    productType,
    sizeSystem,
    setSizeSystem,
    availableSystems,
    hasSizes: rawSizes.length > 0,
    sizeTable: productType ? SIZE_TABLES[productType] : null
  };
};
