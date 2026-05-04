export const getOrderItems = (order) => {
  if (Array.isArray(order?.order_items)) return order.order_items;
  if (Array.isArray(order?.items)) return order.items;
  return [];
};

export const getOrderCreatedAt = (order) =>
  order?.created_at || order?.createdAt || order?.created || null;

export const getOrderDateValue = (order) => {
  const date = getOrderCreatedAt(order);
  const value = date ? new Date(date).getTime() : 0;
  return Number.isFinite(value) ? value : 0;
};

export const getOrderTotalCents = (order) =>
  Number(order?.total_cents ?? order?.totals?.total ?? order?.total ?? 0) || 0;

export const getOrderShortId = (order, length = 14) =>
  order?.id ? String(order.id).slice(0, length) : "N/A";

export const formatOrderDate = (date) =>
  new Date(date || Date.now()).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const getOrderItemProduct = (item) =>
  item?.products || item?.product || null;

export const getOrderItemVariant = (item) =>
  item?.product_variants || item?.variant || null;

export const getOrderItemName = (item) =>
  getOrderItemProduct(item)?.name || item?.product_name || item?.name || "Product";

export const getOrderItemImage = (item) =>
  getOrderItemProduct(item)?.image || item?.image || item?.thumbnail || "";

export const getOrderItemQuantity = (item) =>
  Math.max(Number(item?.quantity) || 1, 1);

export const getOrderItemTotalCents = (item) => {
  const product = getOrderItemProduct(item);
  const variant = getOrderItemVariant(item);
  const price =
    item?.total_cents ??
    item?.line_total_cents ??
    item?.price_cents ??
    variant?.price_cents ??
    product?.price_cents ??
    item?.total ??
    0;

  return Number(price) || 0;
};

export const getOrderStats = (orders = []) => ({
  totalOrders: orders.length,
  totalSpentCents: orders.reduce((sum, order) => sum + getOrderTotalCents(order), 0),
  delivered: orders.filter((order) => order?.status === "delivered").length,
  inProgress: orders.filter((order) => {
    const knownStatuses = ["processing", "shipped", "delivered", "cancelled"];
    const normalizedStatus = knownStatuses.includes(order?.status) ? order?.status : "processing";
    return ["processing", "shipped"].includes(normalizedStatus);
  }).length,
});

export const filterAndSortOrders = (
  orders = [],
  { search = "", statusFilter = "all", sort = "newest" } = {},
) => {
  const query = search.trim().toLowerCase();

  return [...orders]
    .filter((order) => {
      if (statusFilter !== "all") {
        const knownStatuses = ["processing", "shipped", "delivered", "cancelled"];
        const normalizedStatus = knownStatuses.includes(order?.status) ? order?.status : "processing";
        if (normalizedStatus !== statusFilter) return false;
      }

      if (!query) return true;

      const idMatch = String(order?.id || "").toLowerCase().includes(query);
      const itemMatch = getOrderItems(order).some((item) =>
        getOrderItemName(item).toLowerCase().includes(query),
      );

      return idMatch || itemMatch;
    })
    .sort((a, b) => {
      if (sort === "oldest") return getOrderDateValue(a) - getOrderDateValue(b);
      if (sort === "highest") return getOrderTotalCents(b) - getOrderTotalCents(a);
      if (sort === "lowest") return getOrderTotalCents(a) - getOrderTotalCents(b);
      return getOrderDateValue(b) - getOrderDateValue(a);
    });
};

export const canCancelOrder = (order) =>
  !["cancelled", "delivered"].includes(order?.status);

export const getReorderCartItems = (order) =>
  getOrderItems(order)
    .map((item) => {
      const product = getOrderItemProduct(item);
      const variant = getOrderItemVariant(item);
      const productId = item?.productId ?? item?.product_id ?? product?.id ?? null;
      const variantId = item?.variantId ?? item?.variant_id ?? variant?.id ?? null;

      if (!productId || !variantId) return null;

      return {
        productId,
        variantId,
        quantity: getOrderItemQuantity(item),
        product,
        variant,
      };
    })
    .filter(Boolean);
