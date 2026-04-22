import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Trending Now",
  title: "What's Trending",
  accentWordIndex: 2,
  icon: "📈",
  badge: "Trending",
  subtitle: "Curated by what people are buying, sharing, and loving right now across the platform.",
  accent: "#ec4899",
  heroBg: "linear-gradient(135deg, #1a0010 0%, #3d0030 50%, #200020 100%)",
  keywords: ["trending", "popular", "hot", "viral", "bestseller", "top"],
  sortByRating: true,
  minRating: 4,
  stats: [
    { value: "Top 1%", label: "Rated" },
    { value: "10K+", label: "Sold" },
  ],
  emptyIcon: "📈",
};

export default function TrendingNowPage() {
  return <CollectionPage config={CONFIG} />;
}
