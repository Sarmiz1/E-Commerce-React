import { supabase } from "../lib/supabaseClient";
import { filterSellableProducts } from "../utils/productAvailability";

const CATEGORY_SELECT = `
  id,
  name,
  slug,
  parent_id,
  description,
  taxonomy_level,
  sort_order,
  metadata
`;

const throwQueryError = (error) => {
  if (error) throw new Error(error.message);
};

const bySortThenName = (a, b) =>
  Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
  String(a.name || "").localeCompare(String(b.name || ""));

const buildCategoryTree = (rows = []) => {
  const byId = new Map(rows.map((row) => [row.id, { ...row, children: [] }]));
  const roots = [];

  byId.forEach((category) => {
    if (category.parent_id && byId.has(category.parent_id)) {
      byId.get(category.parent_id).children.push(category);
    } else {
      roots.push(category);
    }
  });

  const sortNode = (node) => {
    node.children.sort(bySortThenName).forEach(sortNode);
    return node;
  };

  return roots.sort(bySortThenName).map(sortNode);
};

const flattenLeafSubcategories = (categories = []) => {
  const leaves = [];

  const visit = (node, path = []) => {
    const nextPath = [...path, node.name];
    if (!node.children?.length) {
      leaves.push({
        ...node,
        label: nextPath.slice(1).join(" / ") || node.name,
        categoryId: path.length ? node.rootId || node.id : node.id,
        path: nextPath,
      });
      return;
    }

    node.children.forEach((child) =>
      visit({ ...child, rootId: node.rootId || node.id }, nextPath));
  };

  categories.forEach((category) => category.children?.forEach((child) =>
    visit({ ...child, rootId: category.id }, [category.name])));

  return leaves;
};

export const CategoriesAPI = {
  getTree: () => ({
    queryKey: ["categories", "tree"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(CATEGORY_SELECT)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      throwQueryError(error);
      return buildCategoryTree(data || []);
    },
    staleTime: 1000 * 60 * 30,
  }),

  listFlat: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select(CATEGORY_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    throwQueryError(error);
    return data || [];
  },

  getProducts: ({ categorySlug = "", subcategorySlug = "", limit = 48, offset = 0 } = {}) => ({
    queryKey: ["categories", "products", categorySlug, subcategorySlug || "all", limit, offset],
    queryFn: async () => {
      if (!categorySlug) return [];

      const { data, error } = await supabase.rpc("get_category_products", {
        p_category_slug: categorySlug,
        p_subcategory_slug: subcategorySlug || null,
        p_limit: limit,
        p_offset: offset,
      });

      throwQueryError(error);
      return filterSellableProducts(data || []);
    },
    staleTime: 1000 * 60 * 5,
  }),

  getIndexSections: ({ limitPerCategory = 5, maxCategories = 24 } = {}) => ({
    queryKey: ["categories", "index-sections", limitPerCategory, maxCategories],
    queryFn: async () => {
      const categories = await CategoriesAPI.listFlat();
      const roots = categories
        .filter((category) => !category.parent_id)
        .slice(0, Math.max(Number(maxCategories) || 24, 1));

      const sections = await Promise.all(
        roots.map(async (category) => {
          const { data, error } = await supabase.rpc("get_category_products", {
            p_category_slug: category.slug,
            p_subcategory_slug: null,
            p_limit: Math.max(Number(limitPerCategory) || 5, 1),
            p_offset: 0,
          });

          throwQueryError(error);

          return {
            ...category,
            products: filterSellableProducts(data || []),
          };
        }),
      );

      return sections.filter((section) => section.products.length);
    },
    staleTime: 1000 * 60 * 10,
  }),

  flattenLeafSubcategories,
};
