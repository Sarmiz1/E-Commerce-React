import {
  BarChart2,
  Brain,
  Briefcase,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Percent,
  ShieldPlus,
  Settings,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

export const C = {
  bg:'#050A14', surface:'#090F1E', card:'#0D1829', cardHov:'#112030',
  border:'#162035', borderHov:'#1E3050',
  blue:'#4F8EF7', blueDim:'#1A3260', cyan:'#22D3EE', cyanDim:'#0B3D48',
  green:'#10B981', greenDim:'#053D28', amber:'#F59E0B', amberDim:'#4A2D05',
  red:'#F43F5E', redDim:'#4A0E1A', purple:'#A78BFA', purpleDim:'#2D1B5C',
  txt:'#EDF2FF', txt2:'#8BA3C7', txt3:'#3D5A80', sideW:240,
};

export const glow = (color, power=18) =>
  `0 0 ${power}px ${color}44, 0 4px 24px #00000088`;

export const ADMIN_ROLES = {
  super_admin:{label:'Super Admin',color:C.purple,icon:'SA',
    modules:['dashboard','orders','products','users','sellers','promos','analytics','support','ai','hiring','settings','admin-promotion'],
    canApprove:true,canSuspend:true,canViewKeys:true,canViewFinance:true,canHire:true},
  support_lead:{label:'Support Lead',color:C.cyan,icon:'SL',
    modules:['dashboard','orders','support','users'],
    canApprove:false,canSuspend:false,canViewKeys:false,canViewFinance:false,canHire:false},
  finance_manager:{label:'Finance Manager',color:C.green,icon:'FM',
    modules:['dashboard','orders','analytics','settings'],
    canApprove:false,canSuspend:false,canViewKeys:false,canViewFinance:true,canHire:false},
  content_mod:{label:'Content Mod',color:C.amber,icon:'CM',
    modules:['dashboard','products','sellers'],
    canApprove:true,canSuspend:false,canViewKeys:false,canViewFinance:false,canHire:false},
};

export const ADMIN_NAV = [
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {id:'orders',label:'Orders',icon:ShoppingCart,badgeKey:'orders',badgeColor:C.amber},
  {id:'products',label:'Products',icon:Package},
  {id:'users',label:'Users',icon:Users},
  {id:'sellers',label:'Sellers',icon:Store,badgeKey:'sellers',badgeColor:C.blue},
  {id:'promos',label:'Promo Codes',icon:Percent},
  {id:'analytics',label:'Analytics',icon:BarChart2},
  {id:'support',label:'Support',icon:LifeBuoy,badgeKey:'support',badgeColor:C.red},
  {id:'ai',label:'AI Insights',icon:Brain},
  {id:'hiring',label:'Hiring',icon:Briefcase},
  {id:'settings',label:'Settings',icon:Settings},
  {id:'admin-promotion',label:'Admin Promotion',icon:ShieldPlus,hiddenWhenUnauthorized:true},
];

export const ADMIN_MODULE_TITLES = Object.fromEntries(
  ADMIN_NAV.map(({ id, label }) => [id, label]),
);

export const BADGE_MAP = {
  delivered:[C.green,`${C.greenDim}99`], shipped:[C.blue,`${C.blueDim}99`],
  pending:[C.amber,`${C.amberDim}99`], cancelled:[C.red,`${C.redDim}99`],
  refunded:[C.red,`${C.redDim}99`], paid:[C.green,`${C.greenDim}99`],
  active:[C.green,`${C.greenDim}99`], inactive:[C.txt3,`${C.border}99`],
  out_of_stock:[C.red,`${C.redDim}99`],
  rejected:[C.red,`${C.redDim}99`], approved:[C.green,`${C.greenDim}99`],
  suspended:[C.red,`${C.redDim}99`], draft:[C.txt3,`${C.border}99`],
  open:[C.green,`${C.greenDim}99`], closed:[C.txt3,`${C.border}99`], resolved:[C.green,`${C.greenDim}99`],
  high:[C.red,`${C.redDim}99`], medium:[C.amber,`${C.amberDim}99`],
  low:[C.txt3,`${C.border}99`],
};

export const ADMIN_DASHBOARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glow{0%,100%{box-shadow:0 0 16px #4F8EF744}50%{box-shadow:0 0 32px #4F8EF799}}
  @keyframes floatIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:#090F1E}
  ::-webkit-scrollbar-thumb{background:#162035;border-radius:2px}
  ::-webkit-scrollbar-thumb:hover{background:#1E3050}
  input,textarea,button{outline:none!important;font-family:'Sora',sans-serif}
  input::placeholder,textarea::placeholder{color:#3D5A80}
  .mod{animation:floatIn .28s cubic-bezier(.4,0,.2,1)}
  .admin-mobile-menu-btn,.admin-sidebar-close,.admin-sidebar-overlay{display:none!important}
  .admin-table-scroll{-webkit-overflow-scrolling:touch}
  @media (max-width:1100px){
    .admin-grid-overview,.admin-grid-analytics-bottom{grid-template-columns:minmax(0,1fr)!important}
    .admin-ai-pill{display:none!important}
  }
  @media (max-width:900px){
    .admin-dashboard-root{height:100dvh!important}
    .admin-sidebar{position:fixed;inset:0 auto 0 0;z-index:800;width:min(82vw,280px)!important;
      transform:translateX(-102%);box-shadow:0 24px 70px #000000CC;
      transition:transform .22s cubic-bezier(.4,0,.2,1)}
    .admin-sidebar.is-open{transform:translateX(0)}
    .admin-sidebar-overlay{position:fixed;inset:0;z-index:790;border:0;background:#00000099;
      cursor:pointer;opacity:0;pointer-events:none;transition:opacity .22s ease}
    .admin-sidebar-overlay.is-open{display:block!important;opacity:1;pointer-events:auto}
    .admin-sidebar-close,.admin-mobile-menu-btn{display:flex!important}
    .admin-topbar{padding:0 .9rem!important;gap:8px!important}
    .admin-module-search,.admin-status-pill{display:none!important}
    .admin-dashboard-main{padding:1rem!important}
  }
  @media (max-width:640px){
    .admin-topbar{height:56px!important}
    .admin-topbar-heading span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .admin-topbar-date{display:none}
    .admin-stats{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px!important}
    .admin-stat-card{min-width:0!important;padding:1rem!important}
    .admin-stat-card>div:nth-of-type(1){width:36px!important;height:36px!important;margin-bottom:12px!important}
    .admin-stat-card>div:nth-of-type(2){font-size:18px!important;overflow-wrap:anywhere}
    .admin-dashboard-banner{align-items:flex-start!important;padding:1rem!important}
    .admin-paid-chart-body{padding:1rem!important}
    .admin-chart-toolbar{flex-direction:column}
    .admin-chart-range{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));width:100%}
    .admin-chart-range button{justify-content:center;padding-inline:6px!important}
    .admin-chart-frame{height:260px!important}
    .admin-card>header{padding:.85rem 1rem!important}
    .admin-table-scroll table{min-width:760px}
    .admin-ai-form{flex-direction:column}
    .admin-ai-form button{justify-content:center}
    .admin-hiring-grid{grid-template-columns:minmax(0,1fr)!important}
    .admin-toast-container{right:12px!important;bottom:12px!important;left:12px!important}
    .admin-toast{min-width:0!important;max-width:none!important}
    .admin-activity-dropdown{position:fixed!important;top:64px!important;right:12px!important;
      left:12px!important;width:auto!important;max-height:calc(100dvh - 80px);overflow:auto!important}
  }
  @media (max-width:380px){
    .admin-dashboard-main{padding:.75rem!important}
    .admin-stats{grid-template-columns:minmax(0,1fr)!important}
  }
`;
