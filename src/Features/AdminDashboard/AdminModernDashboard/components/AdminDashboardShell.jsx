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
  return (
    <>
      <style>{ADMIN_DASHBOARD_STYLES}</style>
      <div style={{display:'flex',height:'100vh',background:C.bg,color:C.txt,
        fontFamily:"'Sora',sans-serif",overflow:'hidden',fontSize:14}}>
        <AdminSidebar moduleId={moduleId} onModuleChange={switchModule} user={user}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <AdminTopBar moduleId={moduleId} onLogout={logout} onModuleChange={switchModule} user={user}/>
          <main style={{flex:1,overflow:'auto',padding:'1.5rem 1.75rem'}}>
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
