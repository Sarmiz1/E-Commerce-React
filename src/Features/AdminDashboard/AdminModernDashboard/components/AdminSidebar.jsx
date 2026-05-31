import { Lock, X, Zap } from "lucide-react";
import { ADMIN_NAV, C, glow } from "../constants/adminDashboardConfig";
import { useAdminDashboard } from "../hooks/useAdminDashboardQueries";

export function AdminSidebar({ isOpen, moduleId, onClose, onModuleChange, user }) {
  const allowed = user.role.modules;
  const { data } = useAdminDashboard();
  const badges = {
    orders: data?.stats?.pendingOrders || 0,
    sellers: (data?.sellers || []).filter((seller) => seller.status === "pending").length,
    support: data?.stats?.openTickets || 0,
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`} style={{width:C.sideW,background:C.surface,borderRight:`1px solid ${C.border}`,
      display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'1.375rem',borderBottom:`1px solid ${C.border}`,
        display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:38,height:38,borderRadius:12,flexShrink:0,
          background:`linear-gradient(135deg,${C.blue},${C.cyan})`,
          display:'flex',alignItems:'center',justifyContent:'center',boxShadow:glow(C.blue,12)}}>
          <Zap size={18} color="#fff" fill="#fff"/>
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:C.txt,letterSpacing:'-.02em'}}>Woo Sho</div>
          <div style={{fontSize:9,color:C.txt3,textTransform:'uppercase',letterSpacing:'.08em'}}>Admin Console</div>
        </div>
        <button className="admin-sidebar-close" type="button" aria-label="Close admin navigation"
          onClick={onClose} style={{marginLeft:'auto',width:34,height:34,borderRadius:9,
            background:C.card,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',
            justifyContent:'center',cursor:'pointer'}}>
          <X size={16} color={C.txt2}/>
        </button>
      </div>
      <nav style={{flex:1,overflowY:'auto',padding:'.5rem 0'}}>
        {ADMIN_NAV.filter(({id,hiddenWhenUnauthorized}) => !hiddenWhenUnauthorized || allowed.includes(id))
          .map(({id,label,icon:Icon,badgeKey,badgeColor}) => {
          const active = moduleId === id;
          const permitted = allowed.includes(id);
          const badge = badges[badgeKey] || 0;

          return (
            <button key={id} onClick={()=>onModuleChange(id)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:11,
              padding:'.7rem 1.375rem',border:'none',cursor:'pointer',textAlign:'left',
              background:active?`${C.blue}1E`:'transparent',
              borderRight:active?`2.5px solid ${C.blue}`:'2.5px solid transparent',
              transition:'all .14s'}}
              onMouseEnter={event=>{if(!active)event.currentTarget.style.background=`${C.border}55`}}
              onMouseLeave={event=>{if(!active)event.currentTarget.style.background='transparent'}}>
              {permitted ? <Icon size={15} color={active?C.blue:C.txt3}/>
                : <Lock size={13} color={C.txt3}/>}
              <span style={{fontSize:13,color:active?C.txt:permitted?C.txt2:C.txt3,
                fontWeight:active?700:400,flex:1}}>{label}</span>
              {!permitted && <Lock size={9} color={C.txt3}/>}
              {badge > 0 && permitted && (
                <span style={{background:badgeColor,color:'#fff',fontSize:9,
                  fontWeight:800,padding:'2px 6px',borderRadius:20}}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{padding:'.9rem 1.375rem',borderTop:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:35,height:35,borderRadius:'50%',flexShrink:0,
            background:`linear-gradient(135deg,${user.role.color}88,${user.role.color})`,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:11,color:'#fff',fontWeight:800}}>{user.role.icon}</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:C.txt,fontWeight:700,overflow:'hidden',
              textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</div>
            <div style={{fontSize:10,color:user.role.color,fontWeight:600}}>{user.role.label}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
