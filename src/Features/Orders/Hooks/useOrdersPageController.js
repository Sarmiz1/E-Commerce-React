import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useLoaderData,
  useNavigate,
  useNavigation,
  useRevalidator,
} from "react-router-dom";
import { OrderAPI } from "../../../api/orderApi";
import { useCartActions } from "../../../Context/cart/CartContext";
import { filterAndSortOrders, getReorderCartItems } from "../Utils/ordersUtils";

export default function useOrdersPageController() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const ordersData = useLoaderData();
  const { addItems } = useCartActions();
  const closeTimerRef = useRef(null);

  const orders = useMemo(
    () => (Array.isArray(ordersData) ? ordersData : []),
    [ordersData],
  );
  const isLoading = navigation.state === "loading";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const openDrawer = useCallback((order) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setSelectedOrder(order);
    setShowDrawer(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setSelectedOrder(null), 400);
  }, []);

  const handleCancelClick = useCallback((orderId) => {
    setCancelTarget(orderId);
  }, []);

  const handleCancelDismiss = useCallback(() => {
    setCancelTarget(null);
  }, []);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;

    setIsCancelling(true);
    try {
      await OrderAPI.cancelOrder(cancelTarget);
      setCancelTarget(null);
      closeDrawer();
      revalidator.revalidate();
    } catch (error) {
      console.error("Cancel Order Error:", error);
    } finally {
      setIsCancelling(false);
    }
  }, [cancelTarget, closeDrawer, revalidator]);

  const handleReorder = useCallback(
    async (order) => {
      const additions = getReorderCartItems(order);
      if (!additions.length) return;

      setReorderLoading(true);
      try {
        await addItems(additions);
        navigate("/cart");
      } catch (error) {
        console.error("Re-order Error:", error);
      } finally {
        setReorderLoading(false);
      }
    },
    [addItems, navigate],
  );

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setSort("newest");
  }, []);

  const goToProducts = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  const displayOrders = useMemo(
    () => filterAndSortOrders(orders, { search, statusFilter, sort }),
    [orders, search, sort, statusFilter],
  );

  return {
    cancelTarget,
    displayOrders,
    goToProducts,
    handleCancelClick,
    handleCancelConfirm,
    handleCancelDismiss,
    handleReorder,
    isCancelling,
    isLoading,
    openDrawer,
    orders,
    reorderLoading,
    resetFilters,
    search,
    selectedOrder,
    setSearch,
    setSort,
    setStatusFilter,
    showDrawer,
    closeDrawer,
    sort,
    statusFilter,
  };
}
