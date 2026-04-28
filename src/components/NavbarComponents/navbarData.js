export const MEGA_MENU = {
  Shop: {
    featured: {
      title: "Summer Edit 2025",
      subtitle: "The season's must-haves",
      tag: "Trending",
      gradient: "from-orange-400 to-rose-500",
    },
    columns: [
      {
        heading: "Women",
        links: [
          { label: "Dresses & Skirts", badge: null },
          { label: "Tops & Blouses", badge: null },
          { label: "Bags & Purses", badge: "New" },
          { label: "Heels & Flats", badge: null },
          { label: "Jewellery", badge: null },
          { label: "Scarves", badge: "Hot" },
        ],
      },
      {
        heading: "Men",
        links: [
          { label: "Shirts & Polos", badge: null },
          { label: "Trousers & Chinos", badge: null },
          { label: "Sneakers", badge: "New" },
          { label: "Watches", badge: null },
          { label: "Belts & Wallets", badge: null },
          { label: "Sunglasses", badge: null },
        ],
      },
      {
        heading: "Lifestyle",
        links: [
          { label: "Home Decor", badge: null },
          { label: "Kitchen & Dining", badge: null },
          { label: "Sports & Fitness", badge: "Sale" },
          { label: "Tech Accessories", badge: null },
          { label: "Gift Sets", badge: "Gift" },
          { label: "Kids & Baby", badge: null },
        ],
      },
    ],
    promos: [
      { label: "30% Off Bags", color: "bg-rose-50 text-rose-600 border-rose-100" },
      { label: "Free Shipping $50+", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
      { label: "New Member Gift", color: "bg-amber-50 text-amber-600 border-amber-100" },
    ],
  },
  "New In": {
    featured: {
      title: "Just Dropped",
      subtitle: "Fresh off the runway",
      tag: "New",
      gradient: "from-violet-500 to-indigo-600",
    },
    columns: [
      {
        heading: "This Week",
        links: [
          { label: "New Arrivals", badge: "68" },
          { label: "Designer Picks", badge: null },
          { label: "Trending Now", badge: null },
          { label: "Staff Favourites", badge: null },
        ],
      },
      {
        heading: "Collections",
        links: [
          { label: "Summer 2025", badge: "New" },
          { label: "Resort Collection", badge: null },
          { label: "Workwear Edit", badge: null },
          { label: "Weekend Casual", badge: null },
        ],
      },
      {
        heading: "By Category",
        links: [
          { label: "Footwear", badge: null },
          { label: "Accessories", badge: null },
          { label: "Fragrances", badge: "New" },
          { label: "Beauty", badge: null },
        ],
      },
    ],
    promos: [
      { label: "Early Access for Members", color: "bg-violet-50 text-violet-600 border-violet-100" },
      { label: "See What's Trending", color: "bg-blue-50 text-blue-600 border-blue-100" },
    ],
  },
  Brands: {
    featured: {
      title: "Top Brands",
      subtitle: "Curated luxury labels",
      tag: "Premium",
      gradient: "from-gray-700 to-gray-900",
    },
    columns: [
      {
        heading: "Luxury",
        links: [
          { label: "Gucci", badge: null },
          { label: "Prada", badge: null },
          { label: "Versace", badge: null },
          { label: "Dior", badge: null },
        ],
      },
      {
        heading: "Premium",
        links: [
          { label: "Zara Premium", badge: null },
          { label: "H&M Studio", badge: null },
          { label: "Balenciaga", badge: "Hot" },
          { label: "Fendi", badge: null },
        ],
      },
      {
        heading: "Trending",
        links: [
          { label: "Off-White", badge: null },
          { label: "Stone Island", badge: null },
          { label: "Jacquemus", badge: "New" },
          { label: "A-COLD-WALL*", badge: null },
        ],
      },
    ],
    promos: [
      { label: "Brand Sale: Up to 40% Off", color: "bg-gray-50 text-gray-700 border-gray-200" },
      { label: "Authenticity Guaranteed", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    ],
  },
};

export const ALL_NAV_LINKS = [
  { label: "Home", href: "/", hasMega: false },
  { label: "Shop", href: "/products", hasMega: true },
  { label: "New In", href: "/products?filter=new", hasMega: true },
  { label: "Sale", href: "/products?filter=sale", hasMega: false, accent: true },
  { label: "Brands", href: "/products?filter=brands", hasMega: true },
];

export const POPULAR_SEARCHES = [
  "Athletic socks",
  "Basketball",
  "Casual T-shirts",
  "Kitchen toaster",
  "Dinner plates",
  "Cooking set",
  "Sports shoes",
  "Running gear",
  "Sunglasses",
  "Designer bags",
];

export const SEARCH_CATEGORIES = [
  { label: "Bags", emoji: "B", query: "bags" },
  { label: "Watches", emoji: "W", query: "watches" },
  { label: "Shoes", emoji: "S", query: "shoes" },
  { label: "Tech", emoji: "T", query: "tech" },
  { label: "Sports", emoji: "SP", query: "sports" },
  { label: "Perfumes", emoji: "P", query: "perfumes" },
  { label: "Sunglasses", emoji: "SG", query: "sunglasses" },
  { label: "Scarves", emoji: "SC", query: "scarves" },
];

export const MOBILE_CATEGORIES = [
  {
    label: "Women's",
    emoji: "W",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    label: "Men's",
    emoji: "M",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    label: "Bags",
    emoji: "B",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    label: "Watches",
    emoji: "W",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    label: "Shoes",
    emoji: "S",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    label: "Beauty",
    emoji: "BE",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200&h=200",
  },
];

export const SPECIAL_OFFERS = [
  { label: "Flash Sale", desc: "Up to 70% off today only", color: "bg-orange-50 border-orange-100", textColor: "text-orange-600" },
  { label: "New Arrivals", desc: "68 new items this week", color: "bg-indigo-50 border-indigo-100", textColor: "text-indigo-600" },
  { label: "Gift Sets", desc: "Perfect presents from $29", color: "bg-rose-50 border-rose-100", textColor: "text-rose-600" },
];
