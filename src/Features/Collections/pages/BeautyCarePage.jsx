import CollectionPage from "../CollectionPage";

const CONFIG = {
  label: "Beauty & Care",
  title: "Beauty & Self-Care",
  accentWordIndex: 1,
  icon: "💄",
  badge: "Glow Up",
  subtitle: "Skincare, makeup, haircare and wellness — premium formulas for your best self.",
  accent: "#f43f5e",
  heroBg: "linear-gradient(135deg, #1a0010 0%, #3d0020 50%, #1a000e 100%)",
  keywords: ["beauty", "skincare", "makeup", "cosmetic", "haircare", "care", "wellness", "fragrance"],
  stats: [
    { value: "Cruelty", label: "Free" },
    { value: "Derma", label: "Tested" },
  ],
  emptyIcon: "💄",
};

export default function BeautyCarePage() {
  return <CollectionPage config={CONFIG} />;
}
