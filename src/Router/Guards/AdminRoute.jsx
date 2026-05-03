import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../store/useAuthStore";
import { supabase } from "../../lib/supabaseClient";
import { DashboardSkeleton } from "../../Components/Fallback";

export const AdminRoute = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const [adminRole, setAdminRole] = useState(null);   // e.g. 'super_admin'
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only check once auth is resolved and we have a user
    if (authLoading || !user) {
      setChecking(false);
      return;
    }

    const fetchAdminRole = async () => {
      setChecking(true);
      const { data, error } = await supabase
        .from("admin_users")
        .select("role, is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data || !data.is_active) {
        setAdminRole(null);
      } else {
        setAdminRole(data.role);
      }
      setChecking(false);
    };

    fetchAdminRole();
  }, [user, authLoading]);

  // 1. Still resolving auth or checking admin table
  if (authLoading || checking) {
    return <DashboardSkeleton />;
  }

  // 2. Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Logged in but NOT in admin_users table (or deactivated)
  if (!adminRole) {
    return <Navigate to="/" replace />;
  }

  // 4. Authenticated admin → pass role to children via Outlet context
  return <Outlet context={{ adminRole }} />;
};
