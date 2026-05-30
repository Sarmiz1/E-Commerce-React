import { useMemo, useState } from "react";
import { Bell, ChevronRight, LogOut, Menu, Search } from "lucide-react";
import { ADMIN_MODULE_TITLES, ADMIN_NAV, C, glow } from "../constants/adminDashboardConfig";
import { useAdminActivityFeed } from "../hooks/useAdminActivityFeed";

function formatActivityTime(value) {
  if (!value) return "";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function AdminTopBar({ isMenuOpen, moduleId, onLogout, onMenuOpen, onModuleChange, user }) {
  const [search, setSearch] = useState("");
  const { isError, isLoading, isOpen, setIsOpen, stream } = useAdminActivityFeed();
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return ADMIN_NAV.filter(({ id, label }) =>
      user.role.modules.includes(id) && label.toLowerCase().includes(query));
  }, [search, user.role.modules]);
  const dateLabel = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="admin-topbar" style={{height:60,background:C.surface,borderBottom:`1px solid ${C.border}`,
      display:'flex',alignItems:'center',padding:'0 1.75rem',gap:14,flexShrink:0}}>
      <button className="admin-mobile-menu-btn" type="button" aria-label="Open admin navigation"
        aria-expanded={isMenuOpen} onClick={onMenuOpen} style={{width:38,height:38,borderRadius:9,background:C.card,
          border:`1px solid ${C.border}`,alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
        <Menu size={17} color={C.txt2}/>
      </button>
      <div className="admin-topbar-heading" style={{flex:1,display:'flex',alignItems:'center',gap:9,minWidth:0}}>
        <span style={{fontSize:16,fontWeight:700,color:C.txt}}>{ADMIN_MODULE_TITLES[moduleId]}</span>
        <ChevronRight className="admin-topbar-date" size={14} color={C.txt3}/>
        <span className="admin-topbar-date" style={{fontSize:12,color:C.txt3}}>{dateLabel}</span>
      </div>
      <div className="admin-module-search" style={{position:'relative'}}>
        <Search size={13} color={C.txt3} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}}/>
        <input value={search} onChange={(event)=>setSearch(event.target.value)}
          placeholder="Find a module..." style={{background:C.card,border:`1px solid ${C.border}`,
            borderRadius:9,padding:'8px 13px 8px 31px',fontSize:12,color:C.txt,width:190}}/>
        {matches.length > 0 && (
          <div style={{position:'absolute',right:0,top:40,width:190,background:C.card,
            border:`1px solid ${C.border}`,borderRadius:10,zIndex:500,overflow:'hidden',
            boxShadow:`0 16px 42px #000000AA`}}>
            {matches.map(({id,label,icon:Icon}) => (
              <button key={id} onClick={()=>{onModuleChange(id);setSearch("");}} style={{width:'100%',
                display:'flex',alignItems:'center',gap:8,padding:'.7rem .8rem',border:'none',
                background:'transparent',color:C.txt2,cursor:'pointer',fontSize:12,textAlign:'left'}}>
                <Icon size={13} color={C.blue}/>{label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="admin-status-pill" style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',
        background:`${isError?C.red:isLoading?C.amber:C.green}14`,
        border:`1px solid ${isError?C.red:isLoading?C.amber:C.green}33`,borderRadius:20}}>
        <span style={{width:6,height:6,borderRadius:'50%',
          background:isError?C.red:isLoading?C.amber:C.green,animation:'pulse 2s infinite'}}/>
        <span style={{fontSize:11,color:isError?C.red:isLoading?C.amber:C.green,fontWeight:700}}>
          {isError ? "Backend Error" : isLoading ? "Syncing" : "Backend Live"}
        </span>
      </div>
      {user.role.modules.includes("ai") && (
        <div className="admin-ai-pill" style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',
          background:`${C.cyan}14`,border:`1px solid ${C.cyan}33`,borderRadius:20}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:C.cyan}}/>
          <span style={{fontSize:11,color:C.cyan,fontWeight:700}}>AI Queue</span>
        </div>
      )}
      <div style={{position:'relative'}}>
        <button onClick={()=>setIsOpen((current)=>!current)} style={{width:38,height:38,borderRadius:9,
          background:C.card,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',
          justifyContent:'center',cursor:'pointer',position:'relative',transition:'all .15s'}}
          onMouseEnter={event=>{event.currentTarget.style.borderColor=C.blue;event.currentTarget.style.boxShadow=glow(C.blue,8)}}
          onMouseLeave={event=>{event.currentTarget.style.borderColor=C.border;event.currentTarget.style.boxShadow='none'}}>
          <Bell size={15} color={C.txt2}/>
          {stream.length > 0 && (
            <span style={{position:'absolute',top:9,right:9,width:6,height:6,borderRadius:'50%',
              background:C.red,border:`2px solid ${C.surface}`,animation:'pulse 1.5s infinite'}}/>
          )}
        </button>
        {isOpen && (
          <div className="admin-activity-dropdown" style={{position:'absolute',right:0,top:46,width:340,background:C.card,
            border:`1px solid ${C.border}`,borderRadius:14,zIndex:500,
            boxShadow:`0 28px 72px #000000CC`,overflow:'hidden',animation:'fadeIn .15s ease'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:`1px solid ${C.border}`,
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,fontWeight:700,color:C.txt}}>Live Activity</span>
              <span style={{fontSize:10,color:stream.length > 0 ? C.green : C.txt3,display:'flex',alignItems:'center',gap:4,fontWeight:700}}>
                {stream.length > 0 && (
                  <span style={{width:6,height:6,borderRadius:'50%',background:C.green,animation:'pulse 1.5s infinite'}}/>
                )}
                {stream.length > 0 ? "LIVE" : "EMPTY"}
              </span>
            </div>
            {stream.length === 0 && (
              <div style={{padding:'1rem 1.25rem',fontSize:12,color:C.txt3}}>
                No admin activity recorded yet.
              </div>
            )}
            {stream.map((event,index) => (
              <div key={event.id || `${event.message}-${index}`} style={{padding:'.75rem 1.25rem',borderBottom:`1px solid ${C.border}22`,
                display:'flex',gap:10,alignItems:'flex-start',
                background:index===0?`${event.color}0A`:'transparent',transition:'background .3s'}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:event.color,
                  marginTop:4,flexShrink:0,boxShadow:index===0?glow(event.color,4):'none'}}/>
                <div>
                  <div style={{fontSize:12,color:C.txt2,lineHeight:1.45}}>{event.message}</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:2}}>{formatActivityTime(event.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={onLogout} style={{width:38,height:38,borderRadius:9,background:C.card,
        border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',
        cursor:'pointer',transition:'all .15s'}}
        onMouseEnter={event=>{event.currentTarget.style.borderColor=C.red;event.currentTarget.style.background=`${C.red}18`}}
        onMouseLeave={event=>{event.currentTarget.style.borderColor=C.border;event.currentTarget.style.background=C.card}}>
        <LogOut size={14} color={C.txt2}/>
      </button>
    </header>
  );
}
