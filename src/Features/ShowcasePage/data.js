const PRICE_MULTIPLIER = 1500;
const PRICE_MINOR_MULTIPLIER = PRICE_MULTIPLIER * 100;

const showcaseUuid = (id, group = "8000") =>
  `00000000-0000-4000-${group}-${String(id).padStart(12, "0")}`;

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createVariant = (item, productId) => ({
  id: showcaseUuid(item.rawId, "9000"),
  product_id: productId,
  color: item.color || "Assorted",
  size: item.size || "One Size",
  price_minor: Math.round(item.price * PRICE_MINOR_MULTIPLIER),
  stock_quantity: item.stock || 24,
  is_active: true,
});

const normalizeShowcaseItem = (item) => {
  const rawId = item.id;
  const id = showcaseUuid(rawId);
  const slug = `showcase-${slugify(item.name)}`;
  const priceMinor = Math.round(item.price * PRICE_MINOR_MULTIPLIER);
  const originalPriceMinor = item.originalPrice
    ? Math.round(item.originalPrice * PRICE_MINOR_MULTIPLIER)
    : null;
  const variant = createVariant({ ...item, rawId }, id);

  return {
    ...item,
    rawId,
    id,
    slug,
    image: item.img,
    images: [item.img],
    price_minor: priceMinor,
    compare_at_price_minor: originalPriceMinor,
    original_price_minor: originalPriceMinor,
    variant_id: variant.id,
    variants: [variant],
    product_variants: [variant],
    rating_stars: item.rating || 0,
    rating_count: item.reviews || item.sold || 0,
    is_active: true,
    source: "showcase",
  };
};

const normalizeShowcaseSection = (section) => ({
  ...section,
  featured: section.featured ? normalizeShowcaseItem(section.featured) : null,
  items: (section.items || []).map(normalizeShowcaseItem),
});

export const HERO_SLIDES = [
  {
    id: "h1",
    type: "image",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=90",
    eyebrow: "New Collection \u00b7 SS 2025",
    headline: "Dressed for\nEvery Chapter.",
    sub: "The season's most anticipated arrivals \u2014 crafted for the life you're living.",
    cta: "Shop New Arrivals",
    ctaSecondary: "Explore Lookbook",
    accent: "#C9A84C",
    theme: "dark",
    position: "left",
  },
  {
    id: "h2",
    type: "image",
    src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1800&q=90",
    eyebrow: "Flash Sale \u00b7 Up to 60% Off",
    headline: "Today's Best\nDeals Are Live.",
    sub: "Time-limited prices on the pieces everyone's been waiting for.",
    cta: "Shop Flash Deals",
    ctaSecondary: "View All Deals",
    accent: "#E8433A",
    theme: "dark",
    position: "right",
  },
  {
    id: "h3",
    type: "image",
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=90",
    eyebrow: "Editor's Selection",
    headline: "The Pieces\nWorth Owning.",
    sub: "Our editors have spoken. These are the wardrobe investments that endure.",
    cta: "See Editor's Picks",
    ctaSecondary: "Read the Edit",
    accent: "#6B4FA0",
    theme: "dark",
    position: "center",
  },
  {
    id: "h4",
    type: "video",
    src: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1800&q=90",
    videoSrc: null,
    eyebrow: "Trending Now",
    headline: "What Everyone's\nWearing Right Now.",
    sub: "Live trend data. Real-time picks. The pulse of fashion at your fingertips.",
    cta: "Explore Trending",
    ctaSecondary: "See All",
    accent: "#E8433A",
    theme: "dark",
    position: "left",
  },
  {
    id: "h5",
    type: "image",
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&q=90",
    eyebrow: "Most Loved \u00b7 Top Rated",
    headline: "Loved by\nThousands.",
    sub: "The most-rated, most-repurchased pieces on WooSho \u2014 chosen by real shoppers.",
    cta: "Shop Most Loved",
    ctaSecondary: "Read Reviews",
    accent: "#D4447A",
    theme: "dark",
    position: "right",
  },
];

const RAW_SECTIONS = [
  {
    id: "trending",
    label: "Trending Now",
    tag: "LIVE",
    tagColor: "#E8433A",
    accent: "#E8433A",
    items: [
      { id: 1, name: "Oversized Linen Blazer", brand: "Studio Minimal", price: 289, originalPrice: 380, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", badge: "#1 This Week", sold: 842 },
      { id: 2, name: "Ribbed Knit Maxi Dress", brand: "Forme d'Expression", price: 195, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", badge: "\u2191 340%", sold: 621 },
      { id: 3, name: "Clean Leather Loafer", brand: "Aesop Foot", price: 320, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", badge: "Viral", sold: 503 },
      { id: 4, name: "Wool Cargo Trousers", brand: "Unstructured Co.", price: 175, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", badge: "Trending", sold: 398 },
      { id: 5, name: "Structured Tote Bag", brand: "Matter Works", price: 240, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", badge: "Top 5", sold: 297 },
    ],
  },
  {
    id: "bestsellers",
    label: "Best Sellers",
    tag: "ALWAYS ON",
    tagColor: "#1A1A2E",
    accent: "#C9A84C",
    items: [
      { id: 6, name: "Classic Trench Coat", brand: "Foundry Label", price: 495, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", badge: "All-Time Best", sold: 3200 },
      { id: 7, name: "Slim Fit Turtleneck", brand: "Wardrobe Basics", price: 110, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", badge: "Since 2021", sold: 2800 },
      { id: 8, name: "High-Rise Wide Leg Jean", brand: "Denim Theory", price: 165, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", badge: "Evergreen", sold: 2400 },
      { id: 9, name: "Merino Crew Sweater", brand: "Soft Goods", price: 145, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80", badge: "Fan Favourite", sold: 1900 },
      { id: 10, name: "Canvas Slip-On", brand: "Form & Function", price: 89, img: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80", badge: "Best Value", sold: 1700 },
    ],
  },
  {
    id: "newarrivals",
    label: "New Arrivals",
    tag: "JUST IN",
    tagColor: "#0F7B6C",
    accent: "#0F7B6C",
    items: [
      { id: 11, name: "Asymmetric Linen Top", brand: "Studio Minimal", price: 135, img: "https://images.unsplash.com/photo-1485462537746-965f33f52f86?w=400&q=80", badge: "New", sold: null },
      { id: 12, name: "Textured Midi Skirt", brand: "Forme d'Expression", price: 210, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", badge: "New", sold: null },
      { id: 13, name: "Boxy Leather Jacket", brand: "Aesop Foot", price: 580, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", badge: "New", sold: null },
      { id: 14, name: "Draped Knit Cardigan", brand: "Soft Goods", price: 175, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80", badge: "New", sold: null },
      { id: 15, name: "Tailored Bermuda Short", brand: "Foundry Label", price: 145, img: "https://images.unsplash.com/photo-1504198266287-1659872e6590?w=400&q=80", badge: "New", sold: null },
    ],
  },
  {
    id: "flashdeals",
    label: "Flash Deals",
    tag: "ENDS SOON",
    tagColor: "#E8433A",
    accent: "#E8433A",
    isFlash: true,
    items: [
      { id: 16, name: "Silk Wrap Blouse", brand: "Forme d'Expression", price: 98, originalPrice: 210, img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80", badge: "53% OFF", timeLeft: "2h 14m" },
      { id: 17, name: "Leather Belt Bag", brand: "Matter Works", price: 79, originalPrice: 155, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", badge: "49% OFF", timeLeft: "3h 02m" },
      { id: 18, name: "Textured Blazer", brand: "Studio Minimal", price: 148, originalPrice: 295, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", badge: "50% OFF", timeLeft: "1h 45m" },
      { id: 19, name: "Striped Linen Shirt", brand: "Wardrobe Basics", price: 65, originalPrice: 120, img: "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=400&q=80", badge: "46% OFF", timeLeft: "4h 30m" },
    ],
  },
  {
    id: "dealofday",
    label: "Deal of the Day",
    tag: "TODAY ONLY",
    tagColor: "#C9A84C",
    accent: "#C9A84C",
    isDealOfDay: true,
    featured: { id: 20, name: "Premium Down Puffer", brand: "Foundry Label", price: 199, originalPrice: 450, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", badge: "56% OFF", sold: 140, stock: 200 },
    items: [
      { id: 21, name: "Cashmere Scarf", brand: "Soft Goods", price: 69, originalPrice: 145, img: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&q=80", badge: "52% OFF" },
      { id: 22, name: "Suede Chelsea Boot", brand: "Aesop Foot", price: 155, originalPrice: 310, img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80", badge: "50% OFF" },
      { id: 23, name: "Cotton Canvas Cap", brand: "Form & Function", price: 35, originalPrice: 68, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80", badge: "49% OFF" },
    ],
  },
  {
    id: "editorspicks",
    label: "Editor's Picks",
    tag: "CURATED",
    tagColor: "#6B4FA0",
    accent: "#6B4FA0",
    editorial: true,
    items: [
      { id: 24, name: "Pliss\u00e9 Pleated Trousers", brand: "Forme d'Expression", price: 245, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", note: "The trouser of the season." },
      { id: 25, name: "Raw-Edge Shirt", brand: "Studio Minimal", price: 175, img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80", note: "Impeccably undone." },
      { id: 26, name: "Boucle Coat", brand: "Foundry Label", price: 520, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", note: "The investment piece." },
      { id: 27, name: "Slip Dress", brand: "Forme d'Expression", price: 185, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", note: "Quiet luxury, defined." },
      { id: 28, name: "Leather Derby", brand: "Aesop Foot", price: 340, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", note: "Sharp from heel to toe." },
    ],
  },
  {
    id: "mostloved",
    label: "Most Loved",
    tag: "TOP RATED",
    tagColor: "#D4447A",
    accent: "#D4447A",
    items: [
      { id: 29, name: "Cashmere Crewneck", brand: "Soft Goods", price: 265, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", rating: 4.9, reviews: 2130 },
      { id: 30, name: "Tailored Blazer", brand: "Foundry Label", price: 395, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", rating: 4.8, reviews: 1870 },
      { id: 31, name: "Wide Leg Trousers", brand: "Unstructured Co.", price: 155, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", rating: 4.8, reviews: 1540 },
      { id: 32, name: "Day Tote", brand: "Matter Works", price: 195, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", rating: 4.9, reviews: 1420 },
      { id: 33, name: "Block Heel Mule", brand: "Aesop Foot", price: 210, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", rating: 4.7, reviews: 1280 },
    ],
  },
  {
    id: "hotrightnow",
    label: "Hot Right Now",
    tag: "SURGING",
    tagColor: "#E8433A",
    accent: "#F05D27",
    items: [
      { id: 34, name: "Double-Breasted Vest", brand: "Studio Minimal", price: 165, img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80", velocity: "+280% in 2h" },
      { id: 35, name: "Barrel-Leg Jean", brand: "Denim Theory", price: 175, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", velocity: "+195% in 3h" },
      { id: 36, name: "Oversize Trench", brand: "Foundry Label", price: 540, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", velocity: "+170% in 4h" },
      { id: 37, name: "Micro Shoulder Bag", brand: "Matter Works", price: 185, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", velocity: "+140% in 2h" },
      { id: 38, name: "Knit Maxi Skirt", brand: "Forme d'Expression", price: 190, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", velocity: "+120% in 5h" },
    ],
  },
  {
    id: "recommended",
    label: "Recommended For You",
    tag: "PERSONAL",
    tagColor: "#1A73C9",
    accent: "#1A73C9",
    items: [
      { id: 39, name: "Tailored Chino", brand: "Unstructured Co.", price: 145, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", reason: "Based on your style" },
      { id: 40, name: "Cotton Poplin Shirt", brand: "Wardrobe Basics", price: 95, img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80", reason: "Matches your wishlist" },
      { id: 41, name: "Longline Trench", brand: "Foundry Label", price: 480, img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80", reason: "You'd love this" },
      { id: 42, name: "Platform Boot", brand: "Aesop Foot", price: 290, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", reason: "Your taste" },
      { id: 43, name: "Silk Cami Set", brand: "Forme d'Expression", price: 220, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", reason: "Trending in your size" },
    ],
  },
  {
    id: "continueshopping",
    label: "Continue Shopping",
    tag: "PICK UP WHERE YOU LEFT OFF",
    tagColor: "#555",
    accent: "#888",
    items: [
      { id: 44, name: "Boxy Linen Jacket", brand: "Studio Minimal", price: 310, img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80", lastSeen: "2h ago", progress: "In Cart" },
      { id: 45, name: "Ribbed Midi Skirt", brand: "Forme d'Expression", price: 155, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80", lastSeen: "Yesterday", progress: "Saved" },
      { id: 46, name: "Suede Derby", brand: "Aesop Foot", price: 280, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", lastSeen: "2 days ago", progress: "Viewed" },
      { id: 47, name: "Canvas Backpack", brand: "Matter Works", price: 175, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", lastSeen: "3 days ago", progress: "Viewed" },
    ],
  },
  {
    id: "browsing",
    label: "Based On Your Browsing",
    tag: "JUST FOR YOU",
    tagColor: "#1A73C9",
    accent: "#1A73C9",
    items: [
      { id: 48, name: "Slim Wool Trousers", brand: "Foundry Label", price: 225, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", reason: "You browsed trousers" },
      { id: 49, name: "Leather Crossbody", brand: "Matter Works", price: 195, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80", reason: "After viewing bags" },
      { id: 50, name: "Cashmere Polo", brand: "Soft Goods", price: 185, img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", reason: "Related to knitwear" },
      { id: 51, name: "Mule Sandal", brand: "Aesop Foot", price: 175, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80", reason: "You browsed shoes" },
      { id: 52, name: "Linen Co-ord Set", brand: "Studio Minimal", price: 260, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", reason: "Based on your style" },
    ],
  },
];

export const TOPBAR_LABELS = {
  trending: "Trending",
  bestsellers: "Best Sellers",
  newarrivals: "New Arrivals",
  flashdeals: "Flash Deals",
  dealofday: "Deal of the Day",
  editorspicks: "Editor's Picks",
  mostloved: "Most Loved",
  hotrightnow: "Hot Right Now",
  recommended: "For You",
  continueshopping: "Continue",
  browsing: "Browsing",
};

export const SECTIONS = RAW_SECTIONS.map(normalizeShowcaseSection);

export const SHOWCASE_PRODUCTS = SECTIONS.flatMap((section) => [
  ...(section.featured ? [section.featured] : []),
  ...section.items,
]);

export const formatShowcasePrice = (price) =>
  `\u20a6${Math.round(price * PRICE_MULTIPLIER).toLocaleString("en-NG")}`;
