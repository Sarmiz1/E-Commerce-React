import { AdminDashboardShell } from "./components/AdminDashboardShell";
import { useAdminDashboardController } from "./hooks/useAdminDashboardController";

export default function AdminModernDashboard() {
  const dashboard = useAdminDashboardController();

  return <AdminDashboardShell {...dashboard} />;
}
