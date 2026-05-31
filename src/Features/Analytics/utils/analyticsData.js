import {
  BarChart3,
  Boxes,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
} from "lucide-react";

export const ANALYTICS_NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Sellers", href: "/sell" },
  { label: "Infrastructure", href: "/analytics" },
];

export const ANALYTICS_SEO = {
  title: "WooSho Commerce Intelligence | Live Marketplace Analytics",
  description:
    "Explore WooSho's live marketplace snapshot and the commerce infrastructure behind product discovery, curated feeds, and trusted seller storefronts.",
  keywords:
    "WooSho analytics, commerce intelligence, marketplace analytics, product discovery, curated commerce, seller storefronts",
};

export const SNAPSHOT_METRICS = [
  {
    key: "liveProducts",
    icon: ShoppingBag,
    label: "Live products",
    description: "Published listings with sellable inventory.",
    source: "Live catalog",
  },
  {
    key: "sellerCount",
    icon: Store,
    label: "Seller storefronts",
    description: "Distinct storefronts represented in the live catalog.",
    source: "Live catalog",
  },
  {
    key: "categoryCount",
    icon: Tags,
    label: "Categories",
    description: "Product categories represented by active listings.",
    source: "Live catalog",
  },
  {
    key: "curationCount",
    icon: Sparkles,
    label: "Active curations",
    description: "Curated marketplace feeds currently available.",
    source: "Curation feed",
  },
];

export const SIGNAL_METRICS = [
  {
    key: "inventoryUnits",
    icon: Boxes,
    label: "Available units",
    description: "Inventory across sellable product variants.",
    source: "Live catalog",
  },
  {
    key: "reviewCount",
    icon: BarChart3,
    label: "Recorded reviews",
    description: "Customer rating records attached to live products.",
    source: "Live catalog",
  },
  {
    key: "verifiedSellerCount",
    icon: ShieldCheck,
    label: "Verified storefronts",
    description: "Verified sellers represented in the live catalog.",
    source: "Live catalog",
  },
  {
    key: "curationPlacements",
    icon: Search,
    label: "Curation placements",
    description: "Product placements across active curated feeds.",
    source: "Curation feed",
  },
];

export const DISCOVERY_CAPABILITIES = [
  {
    title: "Structured catalog search",
    description:
      "Search reads active listings across product names, brands, descriptions, keywords, AI tags, categories, and storefronts.",
  },
  {
    title: "Ranked recommendations",
    description:
      "Product and cart experiences request related products from the live catalog and available inventory.",
  },
  {
    title: "Curated marketplace feeds",
    description:
      "Homepage and curation surfaces consume active feed memberships instead of maintaining separate showcase copies.",
  },
];

export const INTELLIGENCE_FLOW = [
  "Sellers publish products with categories, variants, and available stock.",
  "The marketplace reads the same catalog for search, product pages, and curated feeds.",
  "Ratings and tracked interactions add useful context for ranking decisions.",
  "Buyers discover products through current marketplace data, not static showcase claims.",
];

