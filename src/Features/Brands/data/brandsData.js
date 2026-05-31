export const BRANDS_NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Sell", href: "/sell" },
  { label: "About", href: "/about" },
];

export const BRANDS_SEO = {
  title: "Shop Brands | WooSho",
  description:
    "Explore WooSho's brand directory and browse active marketplace listings from fashion, footwear, technology, beauty, and lifestyle labels.",
  keywords:
    "WooSho brands, shop brands online, fashion brands, footwear brands, technology brands, beauty brands, lifestyle brands",
};

export const BRAND_FILTERS = [
  "All",
  "Fashion",
  "Footwear",
  "Luxury",
  "Streetwear",
  "Tech",
  "Beauty",
  "Lifestyle",
];

export const BRAND_DIRECTORY_ACTIONS = {
  browseHref: "/products/curations/shop-by-brands",
  browseLabel: "Explore All Brands",
};

export const BRANDS_HERO = {
  titleLines: ["The Brands", "That Define", "Culture."],
  description: "Curated labels. Premium standards. No noise.",
  image:
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=2000",
};

export const FEATURED_BRAND = {
  eyebrow: "Featured Label",
  title: "PRADA LINEA ROSSA",
  titleLines: ["PRADA", "LINEA", "ROSSA"],
  description:
    "Technical precision meets avant-garde luxury. The definitive uniform for the modern metropolis.",
  collectionLabel: "FW26 Collection",
  image:
    "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&q=80&w=1200",
  shopHref: "/products/curations/shop-by-brands/prada",
};

export const BRANDS = [
  {
    id: "nike",
    name: "Nike",
    type: "large",
    category: "Footwear",
    tagline: "Performance essentials and everyday icons.",
    description:
      "Browse active Nike listings from WooSho sellers, including footwear, apparel, and sport-inspired essentials.",
    aliases: ["nike"],
    relatedBrandIds: ["adidas", "new-balance", "kith"],
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900",
    heroImage:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1600",
    featured: true,
  },
  {
    id: "prada",
    name: "Prada",
    type: "medium",
    category: "Luxury",
    tagline: "Refined design with a modern point of view.",
    description:
      "Explore active Prada listings from WooSho sellers across fashion, accessories, and contemporary luxury.",
    aliases: ["prada"],
    relatedBrandIds: ["gucci", "dior", "balenciaga"],
    image:
      "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "adidas",
    name: "Adidas",
    type: "medium",
    category: "Footwear",
    tagline: "Sport heritage shaped for daily movement.",
    description:
      "Browse active Adidas listings from WooSho sellers, from footwear to casual sport essentials.",
    aliases: ["adidas"],
    relatedBrandIds: ["nike", "new-balance", "kith"],
    image:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "off-white",
    name: "Off-White",
    type: "medium",
    category: "Streetwear",
    tagline: "Graphic streetwear with a luxury edge.",
    description:
      "Explore active Off-White listings from WooSho sellers across streetwear, footwear, and accessories.",
    aliases: ["off-white", "off white", "offwhite"],
    relatedBrandIds: ["supreme", "kith", "balenciaga"],
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "supreme",
    name: "Supreme",
    type: "medium",
    category: "Streetwear",
    tagline: "Skate-rooted staples and statement pieces.",
    description:
      "Browse active Supreme listings from WooSho sellers, including streetwear and accessories.",
    aliases: ["supreme"],
    relatedBrandIds: ["off-white", "kith", "nike"],
    image:
      "https://images.unsplash.com/photo-1552346154-21d8212001bb?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "sony",
    name: "Sony",
    type: "small",
    category: "Tech",
    tagline: "Consumer technology for work and downtime.",
    description:
      "Browse active Sony listings from WooSho sellers, including electronics and entertainment technology.",
    aliases: ["sony"],
    relatedBrandIds: ["samsung", "apple"],
    image:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "arc-teryx",
    name: "Arc'teryx",
    type: "small",
    category: "Lifestyle",
    tagline: "Technical outdoor pieces built for movement.",
    description:
      "Explore active Arc'teryx listings from WooSho sellers across outdoor apparel and lifestyle essentials.",
    aliases: ["arc'teryx", "arcteryx", "arc-teryx"],
    relatedBrandIds: ["new-balance", "nike", "kith"],
    image:
      "https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "dior",
    name: "Dior",
    type: "small",
    category: "Luxury",
    tagline: "Fashion, fragrance, and considered detail.",
    description:
      "Browse active Dior listings from WooSho sellers across luxury fashion, accessories, and beauty.",
    aliases: ["dior"],
    relatedBrandIds: ["prada", "gucci", "balenciaga"],
    image:
      "https://images.unsplash.com/photo-1563214532-6e2730fb5eec?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "kith",
    name: "Kith",
    type: "small",
    category: "Streetwear",
    tagline: "Contemporary streetwear and collaborations.",
    description:
      "Explore active Kith listings from WooSho sellers across apparel, footwear, and lifestyle pieces.",
    aliases: ["kith"],
    relatedBrandIds: ["supreme", "off-white", "nike"],
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "gucci",
    name: "Gucci",
    type: "small",
    category: "Luxury",
    tagline: "Expressive luxury across wardrobe and accessories.",
    description:
      "Browse active Gucci listings from WooSho sellers across fashion, bags, shoes, and accessories.",
    aliases: ["gucci"],
    relatedBrandIds: ["prada", "dior", "balenciaga"],
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "zara",
    name: "Zara",
    type: "small",
    category: "Fashion",
    tagline: "Current wardrobe staples for everyday dressing.",
    description:
      "Browse active Zara listings from WooSho sellers across clothing, footwear, and accessories.",
    aliases: ["zara"],
    relatedBrandIds: ["uniqlo", "gucci", "prada"],
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "balenciaga",
    name: "Balenciaga",
    type: "small",
    category: "Luxury",
    tagline: "Directional silhouettes and statement accessories.",
    description:
      "Explore active Balenciaga listings from WooSho sellers across luxury fashion, footwear, and accessories.",
    aliases: ["balenciaga"],
    relatedBrandIds: ["off-white", "prada", "gucci"],
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "new-balance",
    name: "New Balance",
    type: "small",
    category: "Footwear",
    tagline: "Comfort-led sneakers with enduring appeal.",
    description:
      "Browse active New Balance listings from WooSho sellers across sneakers and lifestyle footwear.",
    aliases: ["new balance", "new-balance"],
    relatedBrandIds: ["nike", "adidas", "arc-teryx"],
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "apple",
    name: "Apple",
    type: "small",
    category: "Tech",
    tagline: "Personal technology and useful accessories.",
    description:
      "Browse active Apple listings from WooSho sellers across devices, accessories, and everyday technology.",
    aliases: ["apple"],
    relatedBrandIds: ["samsung", "sony"],
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "samsung",
    name: "Samsung",
    type: "small",
    category: "Tech",
    tagline: "Connected devices for everyday life.",
    description:
      "Explore active Samsung listings from WooSho sellers across mobile devices, electronics, and accessories.",
    aliases: ["samsung"],
    relatedBrandIds: ["apple", "sony"],
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "the-ordinary",
    name: "The Ordinary",
    type: "small",
    category: "Beauty",
    tagline: "Straightforward skincare for daily routines.",
    description:
      "Browse active The Ordinary listings from WooSho sellers across skincare and beauty essentials.",
    aliases: ["the ordinary", "ordinary"],
    relatedBrandIds: ["fenty-beauty", "dior"],
    image:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "fenty-beauty",
    name: "Fenty Beauty",
    type: "small",
    category: "Beauty",
    tagline: "Beauty essentials designed for self-expression.",
    description:
      "Explore active Fenty Beauty listings from WooSho sellers across makeup and beauty essentials.",
    aliases: ["fenty beauty", "fenty"],
    relatedBrandIds: ["the-ordinary", "dior"],
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "uniqlo",
    name: "Uniqlo",
    type: "small",
    category: "Fashion",
    tagline: "Simple, functional pieces for daily wear.",
    description:
      "Browse active Uniqlo listings from WooSho sellers across clothing and lifestyle essentials.",
    aliases: ["uniqlo"],
    relatedBrandIds: ["zara", "new-balance", "arc-teryx"],
    image:
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&q=80&w=900",
  },
];
