import { useEffect, useState } from "react";
import { ADMIN_DASHBOARD_STYLES, C } from "../constants/adminDashboardConfig";
import { AdminDashboardModules, ModuleLoader, Toast } from "./modules/AdminDashboardModules";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

export function AdminDashboardShell({
  addToast,
  logout,
  moduleId,
  moduleLoading,
  switchModule,
  toasts,
  user,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const changeModule = (nextModuleId) => {
    setSidebarOpen(false);
    switchModule(nextModuleId);
  };

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [sidebarOpen]);

  return (
    <>
      <style>{ADMIN_DASHBOARD_STYLES}</style>
      <div className="admin-dashboard-root" style={{display:'flex',height:'100vh',background:C.bg,color:C.txt,
        fontFamily:"'Sora',sans-serif",overflow:'hidden',fontSize:14}}>
        <button className={`admin-sidebar-overlay ${sidebarOpen ? "is-open" : ""}`}
          type="button" aria-label="Close admin navigation" onClick={()=>setSidebarOpen(false)}/>
        <AdminSidebar isOpen={sidebarOpen} moduleId={moduleId} onClose={()=>setSidebarOpen(false)}
          onModuleChange={changeModule} user={user}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <AdminTopBar isMenuOpen={sidebarOpen} moduleId={moduleId} onLogout={logout} onMenuOpen={()=>setSidebarOpen(true)}
            onModuleChange={changeModule} user={user}/>
          <main className="admin-dashboard-main" style={{flex:1,overflow:'auto',padding:'1.5rem 1.75rem'}}>
            {moduleLoading
              ? <ModuleLoader/>
              : <AdminDashboardModules addToast={addToast} moduleId={moduleId} user={user}/>}
          </main>
        </div>
      </div>
      <Toast toasts={toasts}/>
    </>
  );
}
