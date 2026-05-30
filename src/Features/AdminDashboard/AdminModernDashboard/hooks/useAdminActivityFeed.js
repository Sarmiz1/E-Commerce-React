import { useState } from "react";
import { C } from "../constants/adminDashboardConfig";
import { useAdminDashboard } from "./useAdminDashboardQueries";

const ACTIVITY_COLORS = {
  order_status: C.blue,
  product_status: C.cyan,
  seller_status: C.purple,
};

export function useAdminActivityFeed() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isError, isLoading } = useAdminDashboard();

  return {
    isError,
    isLoading,
    isOpen,
    setIsOpen,
    stream: (data?.activities ?? []).map((activity) => ({
      ...activity,
      color: ACTIVITY_COLORS[activity.type] ?? C.green,
    })),
  };
}
