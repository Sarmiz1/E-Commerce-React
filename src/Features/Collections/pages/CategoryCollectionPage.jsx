import { useParams } from "react-router-dom";
import CollectionPage from "../CollectionPage";
import { formatShowcaseTitle } from "../../ShowcasePage/utils/formatShowcaseTitle";

const getCategoryConfig = (categorySlug = "") => {
  const title = formatShowcaseTitle(categorySlug) || "Category";
  const keyword = title.toLowerCase();

  return {
    title,
    label: title,
    badge: "Category",
    subtitle: `Shop ${keyword} products from active WooSho marketplace sellers.`,
    icon: "#",
    accent: "#E8433A",
    accentWordIndex: 0,
    keywords: [keyword, categorySlug],
    categorySlug,
    categoryLabel: title,
    stats: [
      { value: "Live", label: "Catalog" },
      { value: "Fresh", label: "Stock" },
    ],
  };
};

export default function CategoryCollectionPage() {
  const { categorySlug = "" } = useParams();

  return <CollectionPage config={getCategoryConfig(categorySlug)} />;
}
