// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getProductImages(product) {
  const supabaseImages = product?.product_images?.map(img => img.image_url) || [];
  const all = [product?.image, ...supabaseImages, ...(product?.images || product?.imageList || [])].filter(Boolean);
  return [...new Set(all)];
}