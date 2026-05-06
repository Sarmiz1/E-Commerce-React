import React from "react";
import SEO from "../../../../components/SEO";
import { getStoreInfo } from "../../../../utils/getStoreInfo";
import { getProductImages } from "../../../../utils/getProductImages";

const MAX_META_DESCRIPTION_LENGTH = 155;

export function cleanSeoText(value) {
  if (!value) return "";
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function clampMetaDescription(value) {
  const text = cleanSeoText(value);
  if (text.length <= MAX_META_DESCRIPTION_LENGTH) return text;

  const trimmed = text.slice(0, MAX_META_DESCRIPTION_LENGTH - 1).trimEnd();
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${trimmed.slice(0, lastSpace > 80 ? lastSpace : trimmed.length).trimEnd()}...`;
}

export function getAbsoluteUrl(value) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (typeof window === "undefined") return value;

  return `${window.location.origin}${value.startsWith("/") ? value : `/${value}`}`;
}

export default function ProductSEO({ product, reviews }) {
  if (!product) return null;

  const storeInfo = getStoreInfo(product);
  const productImages = getProductImages(product);
  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/products/${product.slug || product.id}` : undefined;
  
  const productDescriptionSource = product.description || product.full_description || product.short_description || "";
  const productDescription = cleanSeoText(productDescriptionSource);
  const productMetaDescription = clampMetaDescription(
    productDescription || `Shop ${product.name} from ${storeInfo.name || "WooSho"} with reviews, product details, and personalized recommendations.`
  );
  
  const productSchemaDescription = productDescription || productMetaDescription;
  const productSeoImage = getAbsoluteUrl(productImages[0] || product.image);
  
  const productBrandName = typeof product.brand === "string" ? product.brand : product.brand?.name || storeInfo.name || "WooSho";
  const productCategoryName = typeof product.category === "string" ? product.category : product.category?.name || product.category_name;
  
  const productKeywords = [
    product.name,
    storeInfo.name,
    productCategoryName,
    productBrandName,
    ...(Array.isArray(product.keywords) ? product.keywords : []),
  ].filter(Boolean).join(", ");
  
  const productAvailability = product.stock_quantity === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";
  
  const sku = product.sku || ("SE-" + String(product.id || "").slice(0, 8).toUpperCase());

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productSchemaDescription,
    image: productImages.length ? productImages.map(getAbsoluteUrl).filter(Boolean) : productSeoImage,
    sku,
    brand: {
      "@type": "Brand",
      name: productBrandName,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: ((product.price_cents || 0) / 100).toFixed(2),
      availability: productAvailability,
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl,
    },
  };

  if ((product.rating_stars || 0) > 0 && (product.rating_count || reviews?.length || 0) > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating_stars,
      reviewCount: product.rating_count || reviews.length,
    };
  }

  return (
    <SEO
      title={`${product.name} | WooSho`}
      description={productMetaDescription}
      keywords={productKeywords}
      canonical={productUrl}
      image={productSeoImage}
      type="product"
      schema={productSchema}
    />
  );
}
