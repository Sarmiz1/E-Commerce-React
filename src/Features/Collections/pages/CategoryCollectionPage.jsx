import { useParams } from "react-router-dom";
import CollectionPage from "../CollectionPage";
import { formatShowcaseTitle } from "../../ShowcasePage/utils/formatShowcaseTitle";

const getCategoryConfig = (categorySlug = "", subcategorySlug = "") => {
  const categoryTitle = formatShowcaseTitle(categorySlug) || "Category";
  const subcategoryTitle = subcategorySlug ? formatShowcaseTitle(subcategorySlug) : "";
  const title = subcategoryTitle || categoryTitle;
  const keyword = title.toLowerCase();
  const categoryKeyword = categoryTitle.toLowerCase();

  return {
    title,
    label: title,
    badge: subcategoryTitle ? categoryTitle : "Category",
    subtitle: subcategoryTitle
      ? `Shop ${keyword} products inside ${categoryKeyword} from active WooSho marketplace sellers.`
      : `Shop ${keyword} products from active WooSho marketplace sellers.`,
    icon: "#",
    accent: "#E8433A",
    accentWordIndex: 0,
    keywords: [keyword, categoryKeyword, categorySlug, subcategorySlug].filter(Boolean),
    categorySlug,
    categoryLabel: categoryTitle,
    subcategorySlug,
    subcategoryLabel: subcategoryTitle,
    stats: [
      { value: "Live", label: "Catalog" },
      { value: "Fresh", label: "Stock" },
    ],
  };
};

export default function CategoryCollectionPage() {
  const { categorySlug = "", subcategorySlug = "" } = useParams();

  return <CollectionPage config={getCategoryConfig(categorySlug, subcategorySlug)} />;
}
