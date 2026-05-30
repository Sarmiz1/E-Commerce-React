import { useCallback, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { adminApi } from "../../../../api/adminApi";
import { ADMIN_ROLES, C } from "../constants/adminDashboardConfig";

export function useAdminDashboardController() {
  const navigate = useNavigate();
  const { admin } = useOutletContext();
  const [moduleId, setModuleId] = useState("dashboard");
  const [moduleLoading, setModuleLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const role = ADMIN_ROLES[admin.role];

  const user = {
    ...admin,
    name: admin.full_name || admin.email,
    role,
  };

  const addToast = useCallback((message, color=C.green) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, msg: message, color }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const switchModule = useCallback(async (nextModuleId) => {
    if (nextModuleId === moduleId) return;

    setModuleLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setModuleId(nextModuleId);
    setModuleLoading(false);
  }, [moduleId]);

  const logout = useCallback(async () => {
    await adminApi.signOut();
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  return {
    addToast,
    logout,
    moduleId,
    moduleLoading,
    switchModule,
    toasts,
    user,
  };
}
