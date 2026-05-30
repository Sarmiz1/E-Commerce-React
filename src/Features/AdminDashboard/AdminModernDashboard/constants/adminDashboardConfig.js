import {
  BarChart2,
  Brain,
  Briefcase,
  LayoutDashboard,
  LifeBuoy,
  Package,
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
    modules:['dashboard','orders','products','users','sellers','analytics','support','ai','hiring','settings'],
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
  {id:'analytics',label:'Analytics',icon:BarChart2},
  {id:'support',label:'Support',icon:LifeBuoy,badgeKey:'support',badgeColor:C.red},
  {id:'ai',label:'AI Insights',icon:Brain},
  {id:'hiring',label:'Hiring',icon:Briefcase},
  {id:'settings',label:'Settings',icon:Settings},
];

export const ADMIN_MODULE_TITLES = Object.fromEntries(
  ADMIN_NAV.map(({ id, label }) => [id, label]),
);

export const BADGE_MAP = {
  delivered:[C.green,`${C.greenDim}99`], shipped:[C.blue,`${C.blueDim}99`],
  pending:[C.amber,`${C.amberDim}99`], cancelled:[C.red,`${C.redDim}99`],
  refunded:[C.red,`${C.redDim}99`], paid:[C.green,`${C.greenDim}99`],
  active:[C.green,`${C.greenDim}99`], inactive:[C.txt3,`${C.border}99`],
  suspended:[C.red,`${C.redDim}99`], draft:[C.txt3,`${C.border}99`],
  open:[C.red,`${C.redDim}99`], resolved:[C.green,`${C.greenDim}99`],
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
`;
