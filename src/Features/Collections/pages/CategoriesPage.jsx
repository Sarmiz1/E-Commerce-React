import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Categories",
  title: "All Categories",
  accentWordIndex: 1,
  icon: "🗂️",
  badge: "Shop By Category",
  subtitle: "Every product, every category — the full Woosho catalog at your fingertips.",
  accent: "#10b981",
  heroBg: "linear-gradient(135deg, #001a10 0%, #003020 50%, #001a10 100%)",
  keywords: [],
  stats: [
    { value: "10+", label: "Categories" },
    { value: "All", label: "Products" },
  ],
  emptyIcon: "🗂️",
};

export default function CategoriesPage() {
  return <CollectionPage config={CONFIG} />;
}
