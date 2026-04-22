import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, BarChart2,
  LifeBuoy, Brain, Briefcase, Settings, Bell, Search, TrendingUp,
  Check, X, Eye, EyeOff, AlertCircle, Clock, CheckCircle2, XCircle,
  Zap, Activity, DollarSign, ShoppingBag, Percent, MessageSquare,
  ArrowUpRight, ArrowDownRight, Filter, Download, Plus, RotateCcw,
  Shield, Key, CreditCard, Truck, LogOut, Ticket, Lock, Send,
  Sparkles, AlertTriangle, User, ChevronRight, CheckSquare
} from "lucide-react";

const C = {
  bg:'#050A14', surface:'#090F1E', card:'#0D1829', cardHov:'#112030',
  border:'#162035', borderHov:'#1E3050',
  blue:'#4F8EF7', blueDim:'#1A3260', cyan:'#22D3EE', cyanDim:'#0B3D48',
  green:'#10B981', greenDim:'#053D28', amber:'#F59E0B', amberDim:'#4A2D05',
  red:'#F43F5E', redDim:'#4A0E1A', purple:'#A78BFA', purpleDim:'#2D1B5C',
  txt:'#EDF2FF', txt2:'#8BA3C7', txt3:'#3D5A80', sideW:240,
};
const glow=(c,p=18)=>`0 0 ${p}px ${c}44, 0 4px 24px #00000088`;

const ROLES={
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
const DEMO_USERS=[
  {id:'super_admin',name:'Sarmiz Okoye',email:'sarmiz@woosho.ng',password:'admin2026'},
  {id:'support_lead',name:'Amara Nwosu',email:'support@woosho.ng',password:'support123'},
  {id:'finance_manager',name:'Bello Kuti',email:'finance@woosho.ng',password:'finance123'},
  {id:'content_mod',name:'Ngozi Eze',email:'content@woosho.ng',password:'content123'},
];

const salesData=[
  {day:'Mon',rev:245,orders:32},{day:'Tue',rev:318,orders:47},
  {day:'Wed',rev:289,orders:41},{day:'Thu',rev:412,orders:63},
  {day:'Fri',rev:498,orders:78},{day:'Sat',rev:567,orders:94},{day:'Sun',rev:434,orders:67},
];
const userGrowthData=[
  {month:'Oct',buyers:12000,sellers:1800},{month:'Nov',buyers:18400,sellers:2430},
  {month:'Dec',buyers:23400,sellers:3120},{month:'Jan',buyers:31000,sellers:4210},
  {month:'Feb',buyers:42000,sellers:5340},{month:'Mar',buyers:53000,sellers:6870},
  {month:'Apr',buyers:60214,sellers:8420},
];
const catData=[
  {name:'Fashion',rev:1240,growth:18,share:38},{name:'Electronics',rev:987,growth:24,share:30},
  {name:'Beauty',rev:634,growth:12,share:19},{name:'Sneakers',rev:521,growth:31,share:16},
  {name:'Home',rev:312,growth:8,share:10},
];
const funnelData=[
  {stage:'Visits',value:60000,pct:100},{stage:'Product View',value:28000,pct:47},
  {stage:'Add to Cart',value:8400,pct:14},{stage:'Checkout',value:4200,pct:7},
  {stage:'Purchase',value:3200,pct:5.3},
];
const ordersRaw=[
  {id:'WS-4821',customer:'Chioma Obi',product:'Ankara Midi Dress',status:'delivered',payment:'paid',amount:15500,date:'Apr 18',seller:'Adaeze Boutique'},
  {id:'WS-4820',customer:'Emeka Eze',product:'JBL Wireless Earbuds',status:'shipped',payment:'paid',amount:24000,date:'Apr 18',seller:'TechHub NG'},
  {id:'WS-4819',customer:'Amara Nwosu',product:'Shea Butter Set x3',status:'pending',payment:'paid',amount:8500,date:'Apr 17',seller:'GlowSkin'},
  {id:'WS-4818',customer:'Bello Musa',product:'Nike Air Force 1 UK42',status:'pending',payment:'pending',amount:42000,date:'Apr 17',seller:'SneakerVault'},
  {id:'WS-4817',customer:'Ngozi Adeyemi',product:'Handmade Leather Bag',status:'cancelled',payment:'refunded',amount:19500,date:'Apr 17',seller:'Kraft Lagos'},
  {id:'WS-4816',customer:'Tunde Fashola',product:'Samsung Buds Pro',status:'delivered',payment:'paid',amount:31000,date:'Apr 16',seller:'TechHub NG'},
  {id:'WS-4815',customer:'Adaeze Okonkwo',product:'Gold Jewellery Set',status:'shipped',payment:'paid',amount:12500,date:'Apr 16',seller:'Bling by Ngozi'},
  {id:'WS-4814',customer:'Yakubu Aliyu',product:'Smart Watch HW12',status:'delivered',payment:'paid',amount:28000,date:'Apr 15',seller:'TechHub NG'},
  {id:'WS-4813',customer:'Fatima Ibrahim',product:'Ankara Fabric 3yds',status:'pending',payment:'paid',amount:6500,date:'Apr 15',seller:'Cultural Threads'},
  {id:'WS-4812',customer:'Ola Martins',product:'Protein Supplement 1kg',status:'delivered',payment:'paid',amount:18000,date:'Apr 14',seller:'FitStore NG'},
];
const productsRaw=[
  {id:'P001',name:'Premium Ankara Tote Bag',cat:'Fashion',price:15500,stock:23,seller:'Adaeze Boutique',status:'active',views:847},
  {id:'P002',name:'JBL Flip 6 Speaker',cat:'Electronics',price:45000,stock:8,seller:'TechHub NG',status:'active',views:1203},
  {id:'P003',name:'Natural Shea Butter Set',cat:'Beauty',price:8500,stock:54,seller:'GlowSkin Store',status:'active',views:634},
  {id:'P004',name:'Nike Air Force 1 UK42',cat:'Sneakers',price:42000,stock:5,seller:'SneakerVault',status:'pending',views:0},
  {id:'P005',name:'Gold Plated Ring Set',cat:'Fashion',price:12500,stock:31,seller:'Bling by Ngozi',status:'active',views:421},
  {id:'P006',name:'Smart Watch HW12 Pro',cat:'Electronics',price:28000,stock:12,seller:'TechHub NG',status:'pending',views:0},
  {id:'P007',name:'Waist Trainer Premium',cat:'Fashion',price:9500,stock:67,seller:'FitStore NG',status:'active',views:312},
  {id:'P008',name:'Handwoven Kente Fabric',cat:'Fashion',price:22000,stock:7,seller:'Cultural Threads',status:'draft',views:89},
];
const sellersRaw=[
  {id:'S001',name:'Adaeze Boutique',status:'active',revenue:847000,products:34,rating:4.9,verified:true,joined:'Jan 2024',orders:412},
  {id:'S002',name:'TechHub NG',status:'active',revenue:1240000,products:67,rating:4.7,verified:true,joined:'Dec 2023',orders:687},
  {id:'S003',name:'GlowSkin Store',status:'active',revenue:523000,products:28,rating:4.8,verified:true,joined:'Feb 2024',orders:298},
  {id:'S004',name:'SneakerVault',status:'pending',revenue:0,products:12,rating:null,verified:false,joined:'Apr 2024',orders:0},
  {id:'S005',name:'Bling by Ngozi',status:'active',revenue:312000,products:19,rating:4.6,verified:true,joined:'Mar 2024',orders:187},
  {id:'S006',name:'Cultural Threads',status:'suspended',revenue:89000,products:8,rating:3.2,verified:false,joined:'Jun 2023',orders:43},
  {id:'S007',name:'FitStore NG',status:'active',revenue:445000,products:41,rating:4.5,verified:true,joined:'Feb 2024',orders:267},
  {id:'S008',name:'FreshFarm NG',status:'pending',revenue:0,products:5,rating:null,verified:false,joined:'Apr 2024',orders:0},
];
const ticketsRaw=[
  {id:'TK-291',user:'Chioma Obi',issue:'Item not as described',status:'open',priority:'high',time:'2hrs ago',category:'Dispute'},
  {id:'TK-290',user:'Bello Musa',issue:'Payment not reflecting',status:'pending',priority:'high',time:'4hrs ago',category:'Payment'},
  {id:'TK-289',user:'Amara Nwosu',issue:'Seller not responding',status:'open',priority:'medium',time:'6hrs ago',category:'Communication'},
  {id:'TK-288',user:'Fatima Ibrahim',issue:'Wrong size delivered',status:'resolved',priority:'low',time:'1d ago',category:'Delivery'},
  {id:'TK-287',user:'Ola Martins',issue:'Refund not received',status:'pending',priority:'high',time:'2d ago',category:'Refund'},
  {id:'TK-286',user:'Tunde Fashola',issue:'AI suggestion incorrect',status:'resolved',priority:'low',time:'2d ago',category:'AI'},
  {id:'TK-285',user:'Yakubu Aliyu',issue:'Account access issue',status:'resolved',priority:'medium',time:'3d ago',category:'Account'},
];
const buyersData=[
  {name:'Chioma Obi',email:'chioma@gmail.com',orders:12,ltv:187000,activity:'high',joined:'Jan 2024',city:'Lagos'},
  {name:'Emeka Eze',email:'emeka@gmail.com',orders:7,ltv:124000,activity:'medium',joined:'Feb 2024',city:'Abuja'},
  {name:'Amara Nwosu',email:'amara@yahoo.com',orders:4,ltv:56000,activity:'low',joined:'Mar 2024',city:'Port Harcourt'},
  {name:'Bello Musa',email:'bello@gmail.com',orders:19,ltv:342000,activity:'high',joined:'Dec 2023',city:'Kano'},
  {name:'Ngozi Adeyemi',email:'ngozi@gmail.com',orders:3,ltv:31000,activity:'low',joined:'Apr 2024',city:'Lagos'},
  {name:'Tunde Fashola',email:'tunde@gmail.com',orders:9,ltv:198000,activity:'medium',joined:'Feb 2024',city:'Ibadan'},
];
const topSearches=[
  {term:'ankara dress size 12',count:847,found:true},{term:'wireless earbuds under 20k',count:634,found:true},
  {term:'natural skincare set',count:512,found:true},{term:'jordans size 44',count:398,found:false},
  {term:'custom wedding gift',count:287,found:true},{term:'original versace belt',count:234,found:false},
  {term:'ankara fabric 6 yards',count:198,found:true},{term:'samsung screen protector',count:167,found:false},
];
const hiringData={
  Applied:[
    {name:'Temi Adeyemi',role:'Frontend Engineer',score:82,exp:'3yr'},
    {name:'Kayode Bello',role:'Product Designer',score:77,exp:'4yr'},
    {name:'Sade Williams',role:'Marketing Lead',score:91,exp:'6yr'},
  ],
  Screening:[
    {name:'Emeka Obi',role:'Backend Engineer',score:88,exp:'5yr'},
    {name:'Nkechi Eze',role:'Data Analyst',score:79,exp:'2yr'},
  ],
  Interview:[
    {name:'Chukwuma Adeola',role:'Senior React Dev',score:94,exp:'7yr'},
    {name:'Amina Musa',role:'AI/ML Engineer',score:87,exp:'4yr'},
  ],
  Offer:[{name:'Rotimi Owolabi',role:'Lead Designer',score:96,exp:'8yr'}],
  Hired:[{name:'Zara Afolabi',role:'Operations Manager',score:92,exp:'9yr'}],
};
const apiKeys=[
  {name:'Supabase Anon Key',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhZNG1QcSIsInJvbGUiOiJhbm9uIn0.xY4mPq_demo_key',env:'Production',service:'Supabase'},
  {name:'Stripe Secret Key',key:'sk_live_4xR7mN2pQsTvYh8KjLmN3rWx5ZqPvM9TyU1sA6bC0dE2fG7hI_demo',env:'Production',service:'Stripe'},
  {name:'Claude API Key',key:'sk-ant-api03-jK8mP2rTzQ9Xz1QwYn5LsD3vF6gH0iB4cE7aM2_demo_key_woosho',env:'Production',service:'Anthropic'},
  {name:'Paystack Secret Key',key:'sk_live_8hTyU3nWx5RpQvM2jK9mP4rT6sA1bC0dE7fG3hI_paystk_demo',env:'Staging',service:'Paystack'},
];
const liveStream=[
  {msg:'New order #WS-4825 placed — ₦15,500',time:'just now',color:C.green},
  {msg:'TechHub NG uploaded 3 new products',time:'1m ago',color:C.blue},
  {msg:'Support ticket #TK-292 opened',time:'3m ago',color:C.amber},
  {msg:'SneakerVault applied for seller approval',time:'5m ago',color:C.purple},
  {msg:'Refund #WS-4817 requested — ₦19,500',time:'8m ago',color:C.red},
  {msg:'AI handled 47 buyer inquiries automatically',time:'12m ago',color:C.cyan},
  {msg:'New order #WS-4824 placed — ₦28,000',time:'15m ago',color:C.green},
];

const getAIResponse = q => {
  const l = q.toLowerCase();
  if (l.includes('revenue')||l.includes('sales')||l.includes('gmv'))
    return `Revenue is up 18.3% this week — Fashion leading at ₦1.24M GMV, Electronics at ₦987k. Saturday is your peak day at +24% above weekday average. Platform take rate (4%) puts you at ₦96M ARR run rate. Recommend scheduling seller flash promotions on Friday evenings to capture the Saturday spending surge early and compound the effect.`;
  if (l.includes('seller'))
    return `2 pending applications: SneakerVault (12 products, high-demand category +31% growth this week) and FreshFarm NG (5 products). Cultural Threads is suspended with a 3.2 rating — requires formal policy review before reinstatement. TechHub NG is your top earner at ₦1.24M total revenue — they should be prioritised for any seller incentive programme.`;
  if (l.includes('support')||l.includes('ticket'))
    return `3 high-priority tickets need immediate attention. TK-290 (Bello Musa — payment reflection issue) is 4hrs old and approaching SLA breach. TK-291 is a dispute that should be escalated to review team. Average resolution time is 2.4hrs — improving WoW. Routing payment disputes directly to Finance Manager would reduce handoff time by ~40%.`;
  if (l.includes('ai')||l.includes('search')||l.includes('conversion'))
    return `AI-assisted buyers convert 6× faster (32% vs 5.3% standard). 412 failed searches this week represent unmet demand — top gaps are Jordans size 44, Versace belt, Samsung accessories. Sending these as a demand signal report to your top sellers could generate ₦2M+ in new listings within 30 days. This is your highest-leverage product action right now.`;
  if (l.includes('anomal')||l.includes('fraud')||l.includes('risk'))
    return `⚠️ Two active anomalies: (1) Cancellations are +31% above 7-day average today — 3 orders from the same IP range in Benin City flag a possible payment fraud pattern. Recommend manual review of WS-4817, WS-4818, WS-4819. (2) SneakerVault's application has been in queue 6 days — standard is 48hrs. Likely missing verification documents. Requires action today.`;
  if (l.includes('growth')||l.includes('retention')||l.includes('funnel'))
    return `MAU growth is accelerating at +24.7% month-over-month. Biggest funnel leak: Cart-to-Checkout drops from 14% to 7% — 50% abandonment at that single step. Fixing this one UX issue (checkout trust signals or form friction) is your highest-leverage engineering action and is estimated to add ₦180k+ monthly revenue based on current traffic volume.`;
  return `I have full visibility into your platform data. ${l.includes('order')?'12,847 total orders, 341 pending fulfilment. ':''}${l.includes('user')||l.includes('buyer')?'60,214 active buyers this month, 94% seller retention rate. ':''}${l.includes('product')?'8 products tracked, 2 pending approval. ':''}Ask me about "revenue trends", "seller anomalies", "support tickets", "AI performance", or "conversion funnel gaps" for deep analysis.`;
};

const fmt = n => '₦' + Number(n).toLocaleString();
const BADGE_MAP = {
  delivered:[C.green,`${C.greenDim}99`], shipped:[C.blue,`${C.blueDim}99`],
  pending:[C.amber,`${C.amberDim}99`], cancelled:[C.red,`${C.redDim}99`],
  refunded:[C.red,`${C.redDim}99`], paid:[C.green,`${C.greenDim}99`],
  active:[C.green,`${C.greenDim}99`], suspended:[C.red,`${C.redDim}99`],
  draft:[C.txt3,`${C.border}99`], open:[C.red,`${C.redDim}99`],
  resolved:[C.green,`${C.greenDim}99`], high:[C.red,`${C.redDim}99`],
  medium:[C.amber,`${C.amberDim}99`], low:[C.txt3,`${C.border}99`],
};

function useCounter(target, dur=1400, active=true) {
  const [v,setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s=null, r;
    const step = ts => {
      if (!s) s=ts;
      const p = Math.min((ts-s)/dur, 1);
      setV(Math.floor((1-Math.pow(1-p,3))*target));
      if (p<1) r=requestAnimationFrame(step); else setV(target);
    };
    r = requestAnimationFrame(step);
    return () => cancelAnimationFrame(r);
  }, [target, dur, active]);
  return v;
}

function useHover() {
  const [h,setH] = useState(false);
  return [h, {onMouseEnter:()=>setH(true), onMouseLeave:()=>setH(false)}];
}

const STYLES = `
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

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({type, children}) {
  const label = children || type;
  const [fg,bg] = BADGE_MAP[type] || [C.txt3,`${C.border}99`];
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',
      borderRadius:20,fontSize:11,fontWeight:600,background:bg,color:fg,
      border:`1px solid ${fg}55`,textTransform:'capitalize',whiteSpace:'nowrap'}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:fg,flexShrink:0}}/>{label}
    </span>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
function Btn({children, variant='ghost', onClick, disabled, small, full, icon:Icon}) {
  const [h,h$] = useHover();
  const V = {
    ghost:{bg:'transparent',col:C.txt2,brd:`1px solid ${C.border}`},
    solid:{bg:C.blue,col:'#fff',brd:'none'},
    success:{bg:`${C.green}22`,col:C.green,brd:`1px solid ${C.green}44`},
    danger:{bg:`${C.red}22`,col:C.red,brd:`1px solid ${C.red}44`},
    purple:{bg:`${C.purple}22`,col:C.purple,brd:`1px solid ${C.purple}44`},
    cyan:{bg:`${C.cyan}22`,col:C.cyan,brd:`1px solid ${C.cyan}44`},
  }[variant] || {bg:'transparent',col:C.txt2,brd:`1px solid ${C.border}`};
  return (
    <button {...h$} onClick={disabled ? null : onClick} style={{
      display:'inline-flex',alignItems:'center',gap:5,fontFamily:'inherit',
      padding:small?'4px 10px':full?'12px 20px':'7px 14px',
      fontSize:small?11:12,fontWeight:600,
      background:V.bg,color:disabled?C.txt3:V.col,
      border:disabled?`1px solid ${C.border}`:V.brd,
      borderRadius:8,cursor:disabled?'not-allowed':'pointer',
      width:full?'100%':'auto',justifyContent:full?'center':'flex-start',
      opacity:disabled?.5:1,
      transform:h&&!disabled?'translateY(-1px)':'none',
      boxShadow:h&&!disabled&&variant==='solid'?glow(C.blue,10):'none',
      transition:'all .15s cubic-bezier(.4,0,.2,1)',
    }}>
      {Icon && <Icon size={small?10:12}/>}{children}
    </button>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({title, actions, children, noPad, accent}) {
  const [h,h$] = useHover();
  return (
    <div {...h$} style={{background:C.card,border:`1px solid ${h?C.borderHov:C.border}`,
      borderRadius:14,overflow:'hidden',
      transform:h?'translateY(-2px)':'none',
      boxShadow:h?`0 12px 44px #000000AA, 0 0 22px ${C.blue}10`:`0 2px 12px #00000044`,
      transition:'all .22s cubic-bezier(.4,0,.2,1)'}}>
      {title && (
        <div style={{padding:'1rem 1.5rem',borderBottom:`1px solid ${C.border}`,
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {accent && <div style={{width:3,height:18,borderRadius:2,background:accent}}/>}
            <span style={{fontSize:14,fontWeight:700,color:C.txt}}>{title}</span>
          </div>
          {actions && <div style={{display:'flex',gap:6}}>{actions}</div>}
        </div>
      )}
      <div style={noPad ? {} : {padding:'1.5rem'}}>{children}</div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({icon:Icon, label, value, raw, change, up, accent}) {
  const [h,h$] = useHover();
  const num = useCounter(raw||0, 1400, raw!=null);
  const display = raw!=null
    ? (num>=1000000 ? `₦${(num/1000000).toFixed(1)}M` : num>=1000 ? num.toLocaleString() : String(num))
    : value;
  return (
    <div {...h$} style={{background:C.card,border:`1px solid ${h?C.borderHov:C.border}`,
      borderRadius:14,padding:'1.5rem',flex:'1 1 170px',minWidth:0,
      cursor:'default',position:'relative',overflow:'hidden',
      transform:h?'translateY(-5px) scale(1.015)':'none',
      boxShadow:h?`0 16px 52px #000000AA, 0 0 30px ${(accent||C.blue)}28`:`0 2px 12px #00000044`,
      transition:'all .25s cubic-bezier(.4,0,.2,1)'}}>
      <div style={{position:'absolute',top:0,right:0,width:100,height:100,borderRadius:'50%',
        background:`radial-gradient(circle, ${(accent||C.blue)}1C 0%, transparent 70%)`,
        transform:'translate(28px,-28px)',pointerEvents:'none'}}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
        <div style={{width:44,height:44,borderRadius:12,background:`${(accent||C.blue)}22`,
          display:'flex',alignItems:'center',justifyContent:'center',
          border:`1px solid ${(accent||C.blue)}33`,
          boxShadow:h?glow(accent||C.blue,8):'none',transition:'box-shadow .25s'}}>
          <Icon size={20} color={accent||C.blue}/>
        </div>
        {change && (
          <span style={{fontSize:11,fontWeight:700,color:up?C.green:C.red,
            display:'flex',alignItems:'center',gap:2,
            background:up?`${C.green}18`:`${C.red}18`,
            padding:'3px 9px',borderRadius:20,border:`1px solid ${up?C.green:C.red}33`}}>
            {up?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>}{change}
          </span>
        )}
      </div>
      <div style={{fontSize:28,fontWeight:800,color:C.txt,letterSpacing:'-.03em',
        fontFamily:"'JetBrains Mono',monospace"}}>{display}</div>
      <div style={{fontSize:12,color:C.txt2,marginTop:6,fontWeight:500}}>{label}</div>
    </div>
  );
}

function Th({cols}) {
  return (
    <thead>
      <tr style={{borderBottom:`1px solid ${C.border}`}}>
        {cols.map(c => (
          <th key={c} style={{padding:'11px 14px',textAlign:'left',fontSize:10,fontWeight:700,
            color:C.txt3,textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap',
            background:`${C.surface}88`}}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

function Tr({children, highlight}) {
  const [h,h$] = useHover();
  return (
    <tr {...h$} style={{borderBottom:`1px solid ${C.border}33`,
      background:h?`${C.borderHov}66`:highlight?`${C.amber}0C`:'transparent',
      transition:'background .12s'}}>{children}</tr>
  );
}

function Td({children, mono, bold, muted}) {
  return (
    <td style={{padding:'12px 14px',fontSize:13,
      color:muted?C.txt3:bold?C.txt:C.txt2,
      fontFamily:mono?"'JetBrains Mono',monospace":'inherit',
      verticalAlign:'middle',whiteSpace:'nowrap'}}>{children}</td>
  );
}

function Skeleton({w='100%', h=14, br=6}) {
  return (
    <div style={{width:w,height:h,borderRadius:br,
      background:`linear-gradient(90deg, ${C.card} 25%, ${C.cardHov} 50%, ${C.card} 75%)`,
      backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite'}}/>
  );
}

function ModuleLoader() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',gap:13}}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'1.5rem'}}>
            <Skeleton h={44} w={44} br={12}/><div style={{height:14}}/>
            <Skeleton h={28} w="60%"/><div style={{height:7}}/>
            <Skeleton h={12} w="75%"/>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:13}}>
        {[1,2].map(i => (
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'1.5rem',height:260}}>
            <Skeleton h={16} w="40%" br={6}/><div style={{height:22}}/>
            {[1,2,3,4,5].map(j => (
              <div key={j} style={{marginBottom:14}}><Skeleton h={11} w={`${40+j*10}%`}/></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Toast({toasts}) {
  return (
    <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,
      display:'flex',flexDirection:'column',gap:9,pointerEvents:'none'}}>
      {toasts.map(t => (
        <div key={t.id} style={{background:C.card,border:`1px solid ${t.color}55`,borderRadius:11,
          padding:'12px 18px',display:'flex',alignItems:'center',gap:10,
          boxShadow:`0 10px 36px #000000BB, 0 0 18px ${t.color}33`,
          animation:'slideIn .22s cubic-bezier(.4,0,.2,1)',minWidth:290,maxWidth:390}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:t.color,flexShrink:0}}/>
          <span style={{fontSize:13,color:C.txt,flex:1,fontWeight:500}}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PASSWORD MODAL ───────────────────────────────────────────────────────────
function PasswordModal({onClose, onSuccess}) {
  const [pw,setPw] = useState('');
  const [err,setErr] = useState('');
  const [vis,setVis] = useState(false);
  const [loading,setLoading] = useState(false);
  const ref = useRef();
  useEffect(() => ref.current?.focus(), []);

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 950));
    if (pw === 'admin2026') { onSuccess(); onClose(); }
    else { setErr('Incorrect password. Hint: admin2026'); setLoading(false); }
  };

  return (
    <div style={{position:'fixed',inset:0,background:'#000000CC',backdropFilter:'blur(8px)',
      zIndex:8000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:C.card,border:`1px solid ${C.purple}55`,borderRadius:18,
        padding:'2.25rem',width:410,
        boxShadow:`0 32px 80px #000000CC, 0 0 50px ${C.purple}22`,animation:'fadeIn .2s ease'}}>
        <div style={{width:54,height:54,borderRadius:15,background:`${C.purple}22`,
          border:`1px solid ${C.purple}44`,display:'flex',alignItems:'center',
          justifyContent:'center',marginBottom:18,boxShadow:glow(C.purple,14)}}>
          <Lock size={24} color={C.purple}/>
        </div>
        <div style={{fontSize:18,fontWeight:800,color:C.txt,marginBottom:8}}>Admin Verification</div>
        <div style={{fontSize:13,color:C.txt2,marginBottom:24,lineHeight:1.65}}>
          This action requires Super Admin credentials to access sensitive platform data.
        </div>
        <div style={{position:'relative',marginBottom:err?10:20}}>
          <input ref={ref} type={vis?'text':'password'} value={pw}
            onChange={e=>{setPw(e.target.value);setErr('');}}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="Enter Super Admin password..."
            style={{width:'100%',background:C.surface,
              border:`1.5px solid ${err?C.red:C.border}`,borderRadius:9,
              padding:'12px 44px 12px 15px',fontSize:13,color:C.txt,boxSizing:'border-box'}}/>
          <button onClick={()=>setVis(v=>!v)} style={{position:'absolute',right:13,top:'50%',
            transform:'translateY(-50%)',background:'none',border:'none',
            cursor:'pointer',color:C.txt3,display:'flex',padding:0}}>
            {vis?<EyeOff size={15}/>:<Eye size={15}/>}
          </button>
        </div>
        {err && <div style={{fontSize:12,color:C.red,marginBottom:14,fontWeight:600}}>{err}</div>}
        <div style={{display:'flex',gap:9}}>
          <button onClick={onClose} style={{flex:1,padding:'11px',background:'transparent',
            border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.txt2,
            cursor:'pointer',fontWeight:600}}>Cancel</button>
          <button onClick={submit} disabled={loading||!pw} style={{flex:1,padding:'11px',
            background:loading||!pw?C.blueDim:C.blue,color:'#fff',border:'none',borderRadius:8,
            fontSize:13,fontWeight:700,cursor:loading||!pw?'not-allowed':'pointer',
            boxShadow:!loading&&pw?glow(C.blue,12):'none',transition:'all .15s'}}>
            {loading?'Verifying...':'Unlock Access'}
          </button>
        </div>
        <div style={{fontSize:10,color:C.txt3,marginTop:14,textAlign:'center'}}>Demo hint: admin2026</div>
      </div>
    </div>
  );
}

function AccessDenied({module}) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      minHeight:440,gap:18,textAlign:'center'}}>
      <div style={{width:80,height:80,borderRadius:24,background:`${C.red}18`,
        border:`1px solid ${C.red}33`,display:'flex',alignItems:'center',
        justifyContent:'center',boxShadow:glow(C.red,16)}}>
        <Lock size={34} color={C.red}/>
      </div>
      <div style={{fontSize:22,fontWeight:800,color:C.txt}}>Access Restricted</div>
      <div style={{fontSize:13,color:C.txt2,maxWidth:360,lineHeight:1.75}}>
        Your current role does not have permission to view <strong style={{color:C.txt}}>{module}</strong>.
        Contact your Super Admin to request elevated access.
      </div>
      <div style={{padding:'10px 20px',background:`${C.red}18`,border:`1px solid ${C.red}33`,
        borderRadius:10,fontSize:12,color:C.red,display:'flex',alignItems:'center',gap:8,fontWeight:700}}>
        <Shield size={14}/> Super Admin access required
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {id:'orders',label:'Orders',icon:ShoppingCart,badge:7,bc:C.amber},
  {id:'products',label:'Products',icon:Package},
  {id:'users',label:'Users',icon:Users},
  {id:'sellers',label:'Sellers',icon:Store,badge:2,bc:C.blue},
  {id:'analytics',label:'Analytics',icon:BarChart2},
  {id:'support',label:'Support',icon:LifeBuoy,badge:4,bc:C.red},
  {id:'ai',label:'AI Insights',icon:Brain},
  {id:'hiring',label:'Hiring',icon:Briefcase},
  {id:'settings',label:'Settings',icon:Settings},
];

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [sel,setSel] = useState(null);
  const [pw,setPw] = useState('');
  const [err,setErr] = useState('');
  const [loading,setLoading] = useState(false);
  const [vis,setVis] = useState(false);

  const login = async () => {
    if (!sel) { setErr('Please select a role to continue'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1300));
    const u = DEMO_USERS.find(x => x.id === sel.id);
    if (pw === u.password) onLogin({...u, role:ROLES[u.id]});
    else { setErr(`Incorrect password. Hint: ${u.password}`); setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',
      justifyContent:'center',fontFamily:"'Sora',sans-serif",position:'relative',overflow:'hidden'}}>
      {[[C.blue,'18%','14%'],[C.purple,'84%','20%'],[C.cyan,'10%','80%']].map(([c,x,y],i) => (
        <div key={i} style={{position:'absolute',width:640,height:640,borderRadius:'50%',
          background:`radial-gradient(circle, ${c}12 0%, transparent 70%)`,
          left:x,top:y,transform:'translate(-50%,-50%)',pointerEvents:'none'}}/>
      ))}
      <div style={{width:470,position:'relative',animation:'fadeIn .4s ease'}}>
        <div style={{textAlign:'center',marginBottom:42}}>
          <div style={{width:64,height:64,borderRadius:20,
            background:`linear-gradient(135deg,${C.blue},${C.cyan})`,
            display:'inline-flex',alignItems:'center',justifyContent:'center',
            marginBottom:18,boxShadow:glow(C.blue,24),animation:'glow 3s infinite'}}>
            <Zap size={28} color="#fff" fill="#fff"/>
          </div>
          <div style={{fontSize:30,fontWeight:800,color:C.txt,letterSpacing:'-.03em'}}>Woo Sho</div>
          <div style={{fontSize:12,color:C.txt3,marginTop:5,letterSpacing:'.1em',textTransform:'uppercase'}}>Admin Control Room</div>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,
          padding:'2.5rem',boxShadow:`0 44px 110px #000000AA`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.txt3,marginBottom:14,
            textTransform:'uppercase',letterSpacing:'.09em'}}>Select Your Role</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:24}}>
            {DEMO_USERS.map(u => {
              const role = ROLES[u.id];
              const active = sel?.id === u.id;
              return (
                <button key={u.id} onClick={()=>{setSel(u);setPw('');setErr('');}} style={{
                  background:active?`${role.color}22`:C.surface,
                  border:`1.5px solid ${active?role.color:C.border}`,
                  borderRadius:12,padding:'13px 14px',cursor:'pointer',textAlign:'left',
                  transition:'all .2s',boxShadow:active?glow(role.color,10):'none',
                  transform:active?'scale(1.03)':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <div style={{width:26,height:26,borderRadius:8,
                      background:active?role.color:`${role.color}33`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,color:active?'#fff':role.color,fontWeight:800}}>
                      {role.icon}
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:active?role.color:C.txt2}}>{role.label}</span>
                  </div>
                  <div style={{fontSize:10,color:C.txt3,lineHeight:1.55}}>{u.name}<br/>{u.email}</div>
                </button>
              );
            })}
          </div>
          {sel && (
            <div style={{animation:'fadeUp .2s ease'}}>
              <div style={{fontSize:11,color:C.txt3,marginBottom:9,fontWeight:700,
                textTransform:'uppercase',letterSpacing:'.07em'}}>
                Password for {sel.name}
              </div>
              <div style={{position:'relative',marginBottom:err?10:20}}>
                <input type={vis?'text':'password'} value={pw}
                  onChange={e=>{setPw(e.target.value);setErr('');}}
                  onKeyDown={e=>e.key==='Enter'&&login()}
                  placeholder="Enter password..."
                  style={{width:'100%',background:C.surface,
                    border:`1.5px solid ${err?C.red:C.border}`,borderRadius:10,
                    padding:'12px 44px 12px 16px',fontSize:13,color:C.txt,boxSizing:'border-box'}}/>
                <button onClick={()=>setVis(v=>!v)} style={{position:'absolute',right:13,top:'50%',
                  transform:'translateY(-50%)',background:'none',border:'none',
                  cursor:'pointer',color:C.txt3,display:'flex',padding:0}}>
                  {vis?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              {err && <div style={{fontSize:12,color:C.red,marginBottom:14,fontWeight:600}}>{err}</div>}
            </div>
          )}
          <button onClick={login} disabled={!sel||loading} style={{
            width:'100%',padding:'13px',
            background:!sel||loading?C.blueDim:C.blue,
            color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,
            cursor:sel&&!loading?'pointer':'not-allowed',
            transition:'all .2s',
            boxShadow:sel&&!loading?glow(C.blue,18):'none'}}>
            {loading?'Authenticating...':`Sign In${sel?' as '+ROLES[sel.id].label:''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({mod, setMod, user}) {
  const allowed = user.role.modules;
  return (
    <div style={{width:C.sideW,background:C.surface,borderRight:`1px solid ${C.border}`,
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
      </div>
      <nav style={{flex:1,overflowY:'auto',padding:'.5rem 0'}}>
        {NAV.map(({id,label,icon:Icon,badge,bc}) => {
          const active = mod === id;
          const ok = allowed.includes(id);
          return (
            <button key={id} onClick={()=>setMod(id)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:11,
              padding:'.7rem 1.375rem',border:'none',cursor:'pointer',textAlign:'left',
              background:active?`${C.blue}1E`:'transparent',
              borderRight:active?`2.5px solid ${C.blue}`:'2.5px solid transparent',
              transition:'all .14s'}}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.background=`${C.border}55`}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent'}}>
              {ok ? <Icon size={15} color={active?C.blue:C.txt3}/>
                  : <Lock size={13} color={C.txt3}/>}
              <span style={{fontSize:13,color:active?C.txt:ok?C.txt2:C.txt3,
                fontWeight:active?700:400,flex:1}}>{label}</span>
              {!ok && <Lock size={9} color={C.txt3}/>}
              {badge && ok && (
                <span style={{background:bc,color:'#fff',fontSize:9,
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
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function TopBar({mod, user, onLogout, addToast}) {
  const [notif,setNotif] = useState(false);
  const [stream,setStream] = useState(liveStream);
  const titles = {dashboard:'Dashboard',orders:'Orders',products:'Products',users:'Users',
    sellers:'Sellers',analytics:'Analytics',support:'Support',ai:'AI Insights',
    hiring:'Hiring',settings:'Settings'};

  useEffect(() => {
    const t = setInterval(() => {
      const msgs = [
        {msg:`New order #WS-${4826+Math.floor(Math.random()*20)} placed`,time:'just now',color:C.green},
        {msg:`AI answered ${10+Math.floor(Math.random()*25)} buyer queries`,time:'just now',color:C.cyan},
        {msg:`${['Adaeze Boutique','TechHub NG','GlowSkin'][Math.floor(Math.random()*3)]} listed new products`,time:'just now',color:C.blue},
      ];
      setStream(s => [msgs[Math.floor(Math.random()*msgs.length)], ...s.slice(0,6)]);
    }, 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{height:60,background:C.surface,borderBottom:`1px solid ${C.border}`,
      display:'flex',alignItems:'center',padding:'0 1.75rem',gap:14,flexShrink:0}}>
      <div style={{flex:1,display:'flex',alignItems:'center',gap:9}}>
        <span style={{fontSize:16,fontWeight:700,color:C.txt}}>{titles[mod]}</span>
        <ChevronRight size={14} color={C.txt3}/>
        <span style={{fontSize:12,color:C.txt3}}>Apr 21, 2026</span>
      </div>
      <div style={{position:'relative'}}>
        <Search size={13} color={C.txt3} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}}/>
        <input placeholder="Global search..." style={{background:C.card,border:`1px solid ${C.border}`,
          borderRadius:9,padding:'8px 13px 8px 31px',fontSize:12,color:C.txt,width:230}}/>
      </div>
      {[['Systems Live',C.green],['AI Online',C.cyan]].map(([l,c]) => (
        <div key={l} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',
          background:`${c}14`,border:`1px solid ${c}33`,borderRadius:20}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:c,animation:'pulse 2s infinite'}}/>
          <span style={{fontSize:11,color:c,fontWeight:700}}>{l}</span>
        </div>
      ))}
      <div style={{position:'relative'}}>
        <button onClick={()=>setNotif(p=>!p)} style={{width:38,height:38,borderRadius:9,
          background:C.card,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',
          justifyContent:'center',cursor:'pointer',position:'relative',transition:'all .15s'}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.boxShadow=glow(C.blue,8)}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow='none'}}>
          <Bell size={15} color={C.txt2}/>
          <span style={{position:'absolute',top:9,right:9,width:6,height:6,borderRadius:'50%',
            background:C.red,border:`2px solid ${C.surface}`,animation:'pulse 1.5s infinite'}}/>
        </button>
        {notif && (
          <div style={{position:'absolute',right:0,top:46,width:340,background:C.card,
            border:`1px solid ${C.border}`,borderRadius:14,zIndex:500,
            boxShadow:`0 28px 72px #000000CC`,overflow:'hidden',animation:'fadeIn .15s ease'}}>
            <div style={{padding:'1rem 1.25rem',borderBottom:`1px solid ${C.border}`,
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,fontWeight:700,color:C.txt}}>Live Activity</span>
              <span style={{fontSize:10,color:C.green,display:'flex',alignItems:'center',gap:4,fontWeight:700}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:C.green,animation:'pulse 1.5s infinite'}}/>LIVE
              </span>
            </div>
            {stream.map((ev,i) => (
              <div key={i} style={{padding:'.75rem 1.25rem',borderBottom:`1px solid ${C.border}22`,
                display:'flex',gap:10,alignItems:'flex-start',
                background:i===0?`${ev.color}0A`:'transparent',transition:'background .3s'}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:ev.color,
                  marginTop:4,flexShrink:0,boxShadow:i===0?glow(ev.color,4):'none'}}/>
                <div>
                  <div style={{fontSize:12,color:C.txt2,lineHeight:1.45}}>{ev.msg}</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:2}}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={onLogout} style={{width:38,height:38,borderRadius:9,background:C.card,
        border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',
        cursor:'pointer',transition:'all .15s'}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.background=`${C.red}18`}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card}}>
        <LogOut size={14} color={C.txt2}/>
      </button>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({addToast}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{background:`linear-gradient(135deg,${C.blueDim}CC,${C.cyanDim}AA)`,
        border:`1px solid ${C.blue}44`,borderRadius:14,padding:'1.25rem 1.5rem',
        display:'flex',alignItems:'center',gap:13}}>
        <Sparkles size={20} color={C.cyan} style={{flexShrink:0}}/>
        <div style={{flex:1}}>
          <span style={{fontSize:13,color:C.txt,fontWeight:700}}>AI Platform Alert — </span>
          <span style={{fontSize:13,color:C.cyan}}>Sneakers category +31% WoW. Cart-to-checkout abandonment at 50% is costing ₦180k/month. 3 high-priority support tickets need immediate action.</span>
        </div>
        <button onClick={()=>addToast('Opening AI Intelligence panel...',C.cyan)} style={{
          padding:'7px 16px',background:`${C.cyan}22`,border:`1px solid ${C.cyan}44`,
          borderRadius:9,fontSize:12,color:C.cyan,cursor:'pointer',fontWeight:700,
          whiteSpace:'nowrap',flexShrink:0,transition:'all .15s'}}
          onMouseEnter={e=>e.currentTarget.style.background=`${C.cyan}38`}
          onMouseLeave={e=>e.currentTarget.style.background=`${C.cyan}22`}>
          Full Analysis →
        </button>
      </div>

      <div style={{display:'flex',gap:13,flexWrap:'wrap'}}>
        <StatCard icon={DollarSign} label="Total Revenue" raw={2400000} change="+18.3%" up accent={C.green}/>
        <StatCard icon={ShoppingBag} label="Total Orders" raw={12847} change="+12.1%" up accent={C.blue}/>
        <StatCard icon={Users} label="Active Users" raw={60214} change="+24.7%" up accent={C.cyan}/>
        <StatCard icon={Percent} label="Conversion Rate" value="5.3%" change="+0.8%" up accent={C.purple}/>
        <StatCard icon={Clock} label="Pending Orders" raw={341} change="+31 today" accent={C.amber}/>
        <StatCard icon={LifeBuoy} label="Open Tickets" raw={47} change="+12 today" accent={C.red}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'5fr 2fr',gap:14}}>
        <Card title="Revenue & Orders Overview" accent={C.blue}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={salesData} margin={{top:8,right:8,bottom:0,left:-18}}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.blue} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.cyan} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,
                borderRadius:10,fontSize:12}} labelStyle={{color:C.txt}}
                formatter={(v,n)=>[n==='rev'?`₦${v}k`:v, n==='rev'?'Revenue':'Orders']}/>
              <Area type="monotone" dataKey="rev" stroke={C.blue} strokeWidth={2.5} fill="url(#g1)" dot={false}/>
              <Area type="monotone" dataKey="orders" stroke={C.cyan} strokeWidth={2} fill="url(#g2)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:'flex',gap:20,marginTop:8,justifyContent:'flex-end'}}>
            {[[C.blue,'Revenue'],[C.cyan,'Orders']].map(([c,l]) => (
              <div key={l} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:C.txt3}}>
                <div style={{width:18,height:2.5,background:c,borderRadius:2}}/>{l}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Live Activity" accent={C.green}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {liveStream.slice(0,6).map((ev,i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',
                opacity:Math.max(0.2,1-i*0.14),transition:'opacity .3s'}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:ev.color,
                  marginTop:4,flexShrink:0,boxShadow:i===0?glow(ev.color,6):'none'}}/>
                <div>
                  <div style={{fontSize:11,color:C.txt2,lineHeight:1.5}}>{ev.msg}</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:1}}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:13}}>
        {catData.map(cat => {
          const [h,h$] = useHover();
          return (
            <div {...h$} key={cat.name} style={{background:C.card,
              border:`1px solid ${h?C.borderHov:C.border}`,borderRadius:13,padding:'1.375rem',
              cursor:'default',
              transform:h?'translateY(-4px)':'none',
              boxShadow:h?`0 12px 40px #00000099, 0 0 20px ${C.blue}14`:`0 2px 8px #00000033`,
              transition:'all .22s cubic-bezier(.4,0,.2,1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <span style={{fontSize:13,fontWeight:700,color:C.txt}}>{cat.name}</span>
                <span style={{fontSize:11,color:C.green,display:'flex',alignItems:'center',gap:2,fontWeight:700}}>
                  <TrendingUp size={11}/> +{cat.growth}%
                </span>
              </div>
              <div style={{fontSize:22,fontWeight:800,color:C.txt,marginBottom:12,
                fontFamily:"'JetBrains Mono',monospace"}}>₦{cat.rev}k</div>
              <div style={{height:4,background:C.border,borderRadius:4}}>
                <div style={{height:'100%',width:`${(cat.rev/1240)*100}%`,
                  background:`linear-gradient(90deg,${C.blue},${C.cyan})`,borderRadius:4,transition:'width .6s ease'}}/>
              </div>
              <div style={{fontSize:10,color:C.txt3,marginTop:8}}>{cat.share}% of GMV</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function Orders({addToast}) {
  const [filter,setFilter] = useState('all');
  const [data,setData] = useState(ordersRaw);
  const filtered = filter==='all' ? data : data.filter(o=>o.status===filter);
  const ship = id => { setData(d=>d.map(o=>o.id===id?{...o,status:'shipped'}:o)); addToast(`Order ${id} marked shipped`,C.blue); };
  const cancel = id => { setData(d=>d.map(o=>o.id===id?{...o,status:'cancelled',payment:'refunded'}:o)); addToast(`Order ${id} cancelled & refunded`,C.red); };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        <StatCard icon={ShoppingCart} label="Total Orders" raw={data.length} accent={C.blue}/>
        <StatCard icon={Clock} label="Pending" raw={data.filter(o=>o.status==='pending').length} accent={C.amber}/>
        <StatCard icon={Truck} label="Shipped" raw={data.filter(o=>o.status==='shipped').length} accent={C.cyan}/>
        <StatCard icon={CheckCircle2} label="Delivered" raw={data.filter(o=>o.status==='delivered').length} accent={C.green}/>
      </div>
      <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
        {['all','pending','shipped','delivered','cancelled'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 16px',borderRadius:9,
            fontSize:12,fontWeight:700,border:'none',cursor:'pointer',textTransform:'capitalize',
            transition:'all .18s',
            background:filter===f?C.blue:C.card,color:filter===f?'#fff':C.txt2,
            boxShadow:filter===f?glow(C.blue,8):'none'}}>
            {f==='all'?`All (${data.length})`:f}
          </button>
        ))}
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <Btn small icon={Filter}>Filter</Btn>
          <Btn small icon={Download}>Export</Btn>
        </div>
      </div>
      <Card title={`Orders (${filtered.length})`} noPad accent={C.blue}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Order ID','Customer','Product','Seller','Status','Payment','Amount','Date','Actions']}/>
            <tbody>
              {filtered.map(o => (
                <Tr key={o.id} highlight={o.status==='pending'}>
                  <Td mono><span style={{color:C.cyan,fontWeight:700}}>{o.id}</span></Td>
                  <Td bold>{o.customer}</Td>
                  <Td>{o.product}</Td>
                  <Td muted>{o.seller}</Td>
                  <Td><Badge type={o.status}/></Td>
                  <Td><Badge type={o.payment}/></Td>
                  <Td mono><span style={{color:C.txt,fontWeight:700}}>{fmt(o.amount)}</span></Td>
                  <Td muted>{o.date}</Td>
                  <Td>
                    <div style={{display:'flex',gap:5}}>
                      <Btn small icon={Eye}>View</Btn>
                      {o.status==='pending'&&<Btn small variant="success" onClick={()=>ship(o.id)} icon={Truck}>Ship</Btn>}
                      {(o.status==='pending'||o.status==='shipped')&&<Btn small variant="danger" onClick={()=>cancel(o.id)} icon={X}/>}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
function Products({addToast, user}) {
  const [data,setData] = useState(productsRaw);
  const approve = id => { setData(d=>d.map(p=>p.id===id?{...p,status:'active'}:p)); addToast('Product approved & live',C.green); };
  const remove = id => { setData(d=>d.filter(p=>p.id!==id)); addToast('Product removed from platform',C.red); };
  const pend = data.filter(p=>p.status==='pending').length;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {pend>0 && (
        <div style={{background:`${C.amber}14`,border:`1px solid ${C.amber}44`,borderRadius:11,
          padding:'.9rem 1.375rem',display:'flex',alignItems:'center',gap:10}}>
          <AlertCircle size={15} color={C.amber}/>
          <span style={{fontSize:13,color:C.amber}}>
            <strong>{pend} product{pend>1?'s':''}</strong> awaiting review and approval
          </span>
        </div>
      )}
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        <StatCard icon={Package} label="Total Products" raw={data.length} accent={C.blue}/>
        <StatCard icon={CheckCircle2} label="Active" raw={data.filter(p=>p.status==='active').length} accent={C.green}/>
        <StatCard icon={Clock} label="Pending Review" raw={pend} accent={C.amber}/>
        <StatCard icon={XCircle} label="Draft" raw={data.filter(p=>p.status==='draft').length} accent={C.txt3}/>
      </div>
      <Card title={`Products (${data.length})`} noPad accent={C.blue}
        actions={[<Btn key="a" variant="solid" small icon={Plus}>Add Product</Btn>]}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Product','Category','Price','Stock','Seller','Views','Status','Actions']}/>
            <tbody>
              {data.map(p => (
                <Tr key={p.id} highlight={p.status==='pending'}>
                  <Td bold>{p.name}</Td>
                  <Td>{p.cat}</Td>
                  <Td mono>{fmt(p.price)}</Td>
                  <Td mono><span style={{color:p.stock<10?C.red:p.stock<20?C.amber:C.txt}}>{p.stock}</span></Td>
                  <Td>{p.seller}</Td>
                  <Td mono>{p.views.toLocaleString()}</Td>
                  <Td><Badge type={p.status}/></Td>
                  <Td>
                    <div style={{display:'flex',gap:5}}>
                      <Btn small icon={Eye}>View</Btn>
                      {p.status==='pending' && user.role.canApprove &&
                        <Btn small variant="success" onClick={()=>approve(p.id)} icon={Check}>Approve</Btn>}
                      {user.role.canApprove &&
                        <Btn small variant="danger" onClick={()=>remove(p.id)} icon={X}/>}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── USERS ────────────────────────────────────────────────────────────────────
function UsersModule() {
  const [tab,setTab] = useState('buyers');
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        <StatCard icon={Users} label="Total Buyers" raw={60214} change="+24.7%" up accent={C.blue}/>
        <StatCard icon={Store} label="Total Sellers" raw={3200} change="+18.4%" up accent={C.purple}/>
        <StatCard icon={Activity} label="Daily Active" raw={14200} change="+8.2%" up accent={C.cyan}/>
        <StatCard icon={TrendingUp} label="30-Day Retention" value="94%" accent={C.green}/>
      </div>
      <div style={{display:'flex',gap:7}}>
        {['buyers','sellers'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 20px',borderRadius:9,
            fontSize:12,fontWeight:700,border:'none',cursor:'pointer',textTransform:'capitalize',
            transition:'all .18s',
            background:tab===t?C.blue:C.card,color:tab===t?'#fff':C.txt2,
            boxShadow:tab===t?glow(C.blue,8):'none'}}>{t}</button>
        ))}
      </div>
      {tab==='buyers' && (
        <Card title="Buyers" noPad accent={C.blue}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Name','Email','City','Orders','Lifetime Value','Activity','Joined']}/>
            <tbody>
              {buyersData.map(b => (
                <Tr key={b.name}>
                  <Td bold>{b.name}</Td><Td>{b.email}</Td><Td muted>{b.city}</Td>
                  <Td mono>{b.orders}</Td>
                  <Td mono><span style={{color:C.txt,fontWeight:700}}>{fmt(b.ltv)}</span></Td>
                  <Td><Badge type={b.activity==='high'?'active':b.activity==='low'?'draft':'pending'}/></Td>
                  <Td muted>{b.joined}</Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {tab==='sellers' && (
        <Card title="Sellers" noPad accent={C.purple}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Store','Status','Revenue','Products','Rating','Orders','Joined']}/>
            <tbody>
              {sellersRaw.map(s => (
                <Tr key={s.id}>
                  <Td bold>{s.name}</Td><Td><Badge type={s.status}/></Td>
                  <Td mono>{s.revenue>0?fmt(s.revenue):'—'}</Td><Td mono>{s.products}</Td>
                  <Td><span style={{color:C.amber,fontWeight:700}}>{s.rating?`★ ${s.rating}`:'—'}</span></Td>
                  <Td mono>{s.orders}</Td><Td muted>{s.joined}</Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ─── SELLERS ──────────────────────────────────────────────────────────────────
function Sellers({addToast, user}) {
  const [data,setData] = useState(sellersRaw);
  const approve = id => { setData(d=>d.map(s=>s.id===id?{...s,status:'active',verified:true}:s)); addToast('Seller approved & live on platform',C.green); };
  const suspend = id => { setData(d=>d.map(s=>s.id===id?{...s,status:'suspended'}:s)); addToast('Seller account suspended',C.red); };
  const reinstate = id => { setData(d=>d.map(s=>s.id===id?{...s,status:'active'}:s)); addToast('Seller reinstated successfully',C.cyan); };
  const pend = data.filter(s=>s.status==='pending').length;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {pend>0 && (
        <div style={{background:`${C.blue}14`,border:`1px solid ${C.blue}44`,borderRadius:11,
          padding:'.9rem 1.375rem',display:'flex',alignItems:'center',gap:10}}>
          <AlertCircle size={15} color={C.blue}/>
          <span style={{fontSize:13,color:C.blue}}>
            <strong>{pend} seller application{pend>1?'s':''}</strong> awaiting verification review
          </span>
        </div>
      )}
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        <StatCard icon={Store} label="Total Sellers" raw={data.length} accent={C.blue}/>
        <StatCard icon={CheckCircle2} label="Active" raw={data.filter(s=>s.status==='active').length} accent={C.green}/>
        <StatCard icon={Clock} label="Pending" raw={pend} accent={C.amber}/>
        <StatCard icon={XCircle} label="Suspended" raw={data.filter(s=>s.status==='suspended').length} accent={C.red}/>
      </div>
      <Card title={`Sellers (${data.length})`} noPad accent={C.purple}
        actions={[<Btn key="e" small icon={Download}>Export</Btn>]}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Store','Status','Revenue','Products','Rating','Verified','Orders','Actions']}/>
            <tbody>
              {data.map(s => (
                <Tr key={s.id} highlight={s.status==='pending'}>
                  <Td bold>{s.name}</Td>
                  <Td><Badge type={s.status}/></Td>
                  <Td mono>{s.revenue>0?fmt(s.revenue):'—'}</Td>
                  <Td mono>{s.products}</Td>
                  <Td><span style={{color:C.amber,fontWeight:700}}>{s.rating?`★ ${s.rating}`:'—'}</span></Td>
                  <Td>
                    {s.verified
                      ? <span style={{color:C.green,fontSize:11,display:'flex',alignItems:'center',gap:3}}><CheckCircle2 size={11}/>Verified</span>
                      : <span style={{color:C.txt3,fontSize:11,display:'flex',alignItems:'center',gap:3}}><XCircle size={11}/>Unverified</span>}
                  </Td>
                  <Td mono>{s.orders}</Td>
                  <Td>
                    <div style={{display:'flex',gap:5}}>
                      <Btn small icon={Eye}>View</Btn>
                      {s.status==='pending' && user.role.canApprove &&
                        <Btn small variant="success" onClick={()=>approve(s.id)} icon={Check}>Approve</Btn>}
                      {s.status==='active' && user.role.canSuspend &&
                        <Btn small variant="danger" onClick={()=>suspend(s.id)}>Suspend</Btn>}
                      {s.status==='suspended' && user.role.canSuspend &&
                        <Btn small variant="cyan" onClick={()=>reinstate(s.id)} icon={RotateCcw}>Reinstate</Btn>}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function Analytics() {
  const pc = [C.blue,C.cyan,C.green,C.purple,C.amber];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        <StatCard icon={DollarSign} label="Gross Merchandise Value" value="₦2.4B" change="+18.3%" up accent={C.green}/>
        <StatCard icon={Percent} label="Platform Revenue (4%)" value="₦96M" change="+18.1%" up accent={C.blue}/>
        <StatCard icon={Activity} label="Conversion Rate" value="5.3%" change="+0.8%" up accent={C.cyan}/>
        <StatCard icon={Users} label="30-Day Retention" value="94%" change="+1.2%" up accent={C.purple}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'5fr 2fr',gap:14}}>
        <Card title="User Growth Trend" accent={C.blue}>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={userGrowthData} margin={{top:8,right:8,bottom:0,left:-18}}>
              <XAxis dataKey="month" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}} labelStyle={{color:C.txt}}/>
              <Line type="monotone" dataKey="buyers" stroke={C.blue} strokeWidth={2.5} dot={false} name="Buyers"/>
              <Line type="monotone" dataKey="sellers" stroke={C.cyan} strokeWidth={2} dot={false} name="Sellers"/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:'flex',gap:20,marginTop:8,justifyContent:'flex-end'}}>
            {[[C.blue,'Buyers'],[C.cyan,'Sellers']].map(([c,l]) => (
              <div key={l} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:C.txt3}}>
                <div style={{width:18,height:2.5,background:c,borderRadius:2}}/>{l}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Category Share" accent={C.purple}>
          <ResponsiveContainer width="100%" height={145}>
            <PieChart>
              <Pie data={catData} dataKey="share" cx="50%" cy="50%" outerRadius={62} innerRadius={34} strokeWidth={0}>
                {catData.map((_,i) => <Cell key={i} fill={pc[i]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
            {catData.map((d,i) => (
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:7,fontSize:11}}>
                <div style={{width:8,height:8,borderRadius:2,background:pc[i],flexShrink:0}}/>
                <span style={{flex:1,color:C.txt2}}>{d.name}</span>
                <span style={{color:C.txt,fontWeight:700}}>{d.share}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 3fr',gap:14}}>
        <Card title="Conversion Funnel" accent={C.cyan}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {funnelData.map((f,i) => (
              <div key={f.stage}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:12,color:C.txt2,fontWeight:600}}>{f.stage}</span>
                  <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:C.txt}}>
                    {f.value.toLocaleString()} <span style={{color:C.txt3}}>({f.pct}%)</span>
                  </span>
                </div>
                <div style={{height:7,background:C.border,borderRadius:20}}>
                  <div style={{height:'100%',width:`${f.pct}%`,
                    background:`linear-gradient(90deg,${C.blue},${C.cyan})`,
                    borderRadius:20,opacity:1-i*0.08}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Category Revenue (₦k)" accent={C.amber}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} margin={{top:8,right:8,bottom:0,left:-18}}>
              <XAxis dataKey="name" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}}
                labelStyle={{color:C.txt}} formatter={v=>[`₦${v}k`,'']}/>
              <Bar dataKey="rev" radius={[5,5,0,0]} fill={C.blue} name="Revenue"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── SUPPORT ──────────────────────────────────────────────────────────────────
function Support({addToast}) {
  const [data,setData] = useState(ticketsRaw);
  const close = id => { setData(d=>d.map(t=>t.id===id?{...t,status:'resolved'}:t)); addToast(`Ticket ${id} resolved`,C.green); };
  const esc = id => addToast(`Ticket ${id} escalated to Super Admin`,C.purple);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        <StatCard icon={Ticket} label="Open Tickets" raw={data.filter(t=>t.status==='open').length} accent={C.red}/>
        <StatCard icon={Clock} label="Avg Response" value="2.4hrs" change="-0.3hrs" up accent={C.amber}/>
        <StatCard icon={CheckCircle2} label="Resolved Today" raw={14} change="+14 today" up accent={C.green}/>
        <StatCard icon={AlertTriangle} label="High Priority" raw={data.filter(t=>t.priority==='high').length} accent={C.red}/>
      </div>
      <Card title="Support Tickets" noPad accent={C.red}
        actions={[<Btn key="f" small icon={Filter}>Filter</Btn>, <Btn key="e" small icon={Download}>Export</Btn>]}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['ID','User','Issue','Category','Status','Priority','Time','Actions']}/>
            <tbody>
              {data.map(t => (
                <Tr key={t.id} highlight={t.priority==='high'&&t.status!=='resolved'}>
                  <Td mono><span style={{color:C.cyan,fontWeight:700}}>{t.id}</span></Td>
                  <Td bold>{t.user}</Td>
                  <Td>{t.issue}</Td>
                  <Td muted>{t.category}</Td>
                  <Td><Badge type={t.status}/></Td>
                  <Td><Badge type={t.priority}/></Td>
                  <Td muted>{t.time}</Td>
                  <Td>
                    <div style={{display:'flex',gap:5}}>
                      <Btn small icon={MessageSquare}>Reply</Btn>
                      {t.status!=='resolved' &&
                        <Btn small variant="success" onClick={()=>close(t.id)} icon={Check}>Close</Btn>}
                      {t.priority==='high' && t.status!=='resolved' &&
                        <Btn small variant="purple" onClick={()=>esc(t.id)} icon={AlertCircle}>Escalate</Btn>}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── AI INSIGHTS ──────────────────────────────────────────────────────────────
function AIInsights({addToast}) {
  const [msgs,setMsgs] = useState([
    {role:'ai', text:"Hello! I'm Woo Sho's platform AI. I have full visibility into orders, sellers, buyers, support tickets, and all performance metrics. What would you like to analyse today?"}
  ]);
  const [q,setQ] = useState('');
  const [thinking,setThinking] = useState(false);
  const endRef = useRef();

  const send = async () => {
    if (!q.trim() || thinking) return;
    const txt = q.trim();
    setMsgs(m => [...m, {role:'user', text:txt}]);
    setQ(''); setThinking(true);
    await new Promise(r => setTimeout(r, 900+Math.random()*700));
    setMsgs(m => [...m, {role:'ai', text:getAIResponse(txt)}]);
    setThinking(false);
  };

  useEffect(() => endRef.current?.scrollIntoView({behavior:'smooth'}), [msgs, thinking]);

  const suggs = ['Revenue anomalies this week','Seller performance breakdown','Support SLA status','Conversion funnel gaps','Fraud risk indicators'];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        <StatCard icon={Brain} label="Total AI Queries" raw={24847} change="+1,203 today" up accent={C.cyan}/>
        <StatCard icon={Zap} label="AI Conversions" raw={3201} change="+32%" up accent={C.blue}/>
        <StatCard icon={XCircle} label="Failed Searches" raw={412} change="-18% WoW" up accent={C.red}/>
        <StatCard icon={Activity} label="AI Response Time" value="1.2s" change="-0.3s" up accent={C.green}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:14}}>
        <Card title="Woo Sho Intelligence Chat" accent={C.cyan}>
          <div style={{height:380,display:'flex',flexDirection:'column'}}>
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:14,paddingBottom:8}}>
              {msgs.map((m,i) => (
                <div key={i} style={{display:'flex',gap:11,alignItems:'flex-start',
                  flexDirection:m.role==='user'?'row-reverse':'row'}}>
                  <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                    background:m.role==='user'?`${C.blue}44`:`${C.cyan}22`,
                    border:`1px solid ${m.role==='user'?C.blue:C.cyan}44`,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {m.role==='user'
                      ? <User size={14} color={C.blue}/>
                      : <Sparkles size={14} color={C.cyan}/>}
                  </div>
                  <div style={{maxWidth:'76%',
                    background:m.role==='user'?`${C.blue}18`:`${C.cyan}0E`,
                    border:`1px solid ${m.role==='user'?C.blue:C.cyan}22`,
                    borderRadius:12,padding:'12px 15px',fontSize:13,color:C.txt2,
                    lineHeight:1.65,animation:'fadeUp .2s ease'}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {thinking && (
                <div style={{display:'flex',gap:11,alignItems:'flex-start'}}>
                  <div style={{width:34,height:34,borderRadius:10,background:`${C.cyan}22`,
                    border:`1px solid ${C.cyan}44`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Sparkles size={14} color={C.cyan}/>
                  </div>
                  <div style={{background:`${C.cyan}0E`,border:`1px solid ${C.cyan}22`,
                    borderRadius:12,padding:'12px 18px',display:'flex',gap:6,alignItems:'center'}}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{width:7,height:7,borderRadius:'50%',background:C.cyan,
                        animation:`pulse 1.2s infinite ${i*0.2}s`}}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
              <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
                {suggs.map(s => (
                  <button key={s} onClick={()=>setQ(s)} style={{
                    padding:'4px 10px',background:`${C.cyan}14`,border:`1px solid ${C.cyan}33`,
                    borderRadius:20,fontSize:10,color:C.cyan,cursor:'pointer',fontWeight:600,
                    transition:'all .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=`${C.cyan}28`}
                    onMouseLeave={e=>e.currentTarget.style.background=`${C.cyan}14`}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:9}}>
                <input value={q} onChange={e=>setQ(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&send()}
                  placeholder="Ask about revenue, sellers, support, conversions..."
                  style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,
                    borderRadius:10,padding:'11px 14px',fontSize:13,color:C.txt}}/>
                <button onClick={send} disabled={!q.trim()||thinking} style={{
                  width:44,height:44,borderRadius:10,
                  background:q.trim()?C.cyan:`${C.cyan}44`,
                  border:'none',cursor:q.trim()?'pointer':'not-allowed',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                  boxShadow:q.trim()?glow(C.cyan,10):'none',transition:'all .2s'}}>
                  <Send size={16} color={q.trim()?'#fff':C.txt3}/>
                </button>
              </div>
            </div>
          </div>
        </Card>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Top AI Searches" accent={C.blue}>
            <div style={{display:'flex',flexDirection:'column'}}>
              {topSearches.map((s,i) => (
                <div key={s.term} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 0',
                  borderBottom:i<topSearches.length-1?`1px solid ${C.border}33`:'none'}}>
                  <span style={{width:18,fontSize:10,color:C.txt3,fontWeight:700,flexShrink:0}}>{i+1}</span>
                  <span style={{flex:1,fontSize:12,color:C.txt2,overflow:'hidden',
                    textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.term}</span>
                  <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,fontWeight:700,flexShrink:0,
                    background:s.found?`${C.green}22`:`${C.red}22`,
                    color:s.found?C.green:C.red}}>
                    {s.found?'✓ hit':'✗ miss'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Anomaly Alerts" accent={C.red}>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              {[
                {msg:'Cancellations +31% above 7-day avg',sev:'high',t:'2hrs ago'},
                {msg:'3 orders same IP — fraud flag',sev:'high',t:'3hrs ago'},
                {msg:'SneakerVault pending 6 days',sev:'medium',t:'6d ago'},
                {msg:'Cart abandonment at checkout 50%',sev:'low',t:'ongoing'},
              ].map((a,i) => (
                <div key={i} style={{display:'flex',gap:10,padding:'.7rem',borderRadius:9,
                  background:a.sev==='high'?`${C.red}0F`:a.sev==='medium'?`${C.amber}0F`:`${C.blue}0A`,
                  border:`1px solid ${a.sev==='high'?C.red:a.sev==='medium'?C.amber:C.blue}22`}}>
                  <AlertTriangle size={13}
                    color={a.sev==='high'?C.red:a.sev==='medium'?C.amber:C.blue}
                    style={{marginTop:1,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:12,color:C.txt2,lineHeight:1.45}}>{a.msg}</div>
                    <div style={{fontSize:10,color:C.txt3,marginTop:2}}>{a.t}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card title="AI vs Standard Conversion Performance" accent={C.purple}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:28}}>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[{label:'Buyers using AI Personal Shopper',val:32,col:C.cyan},
              {label:'Standard browsing conversion',val:5.3,col:C.txt3}].map(d => (
              <div key={d.label}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                  <span style={{fontSize:13,color:C.txt2,fontWeight:500}}>{d.label}</span>
                  <span style={{fontSize:22,fontWeight:800,color:d.col,
                    fontFamily:"'JetBrains Mono',monospace"}}>{d.val}%</span>
                </div>
                <div style={{height:9,background:C.border,borderRadius:20}}>
                  <div style={{height:'100%',width:`${(d.val/32)*100}%`,background:d.col,borderRadius:20}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:`${C.cyan}12`,border:`1px solid ${C.cyan}33`,borderRadius:14,
            padding:'1.5rem',display:'flex',flexDirection:'column',
            justifyContent:'center',alignItems:'center',textAlign:'center'}}>
            <div style={{fontSize:11,color:C.cyan,fontWeight:700,marginBottom:6,
              textTransform:'uppercase',letterSpacing:'.08em'}}>AI Advantage</div>
            <div style={{fontSize:52,fontWeight:800,color:C.txt,
              fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>6×</div>
            <div style={{fontSize:12,color:C.txt3,marginTop:10,lineHeight:1.6}}>
              AI-assisted buyers convert 6× faster than standard browsing
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── HIRING ───────────────────────────────────────────────────────────────────
const SC = {Applied:C.blue,Screening:C.purple,Interview:C.amber,Offer:C.cyan,Hired:C.green};

function Hiring({addToast, user}) {
  const [data,setData] = useState(hiringData);
  if (!user.role.canHire) return <AccessDenied module="Hiring — Super Admin only"/>;

  const move = (stage, name) => {
    const stages = Object.keys(SC);
    const nxt = stages[stages.indexOf(stage)+1];
    if (!nxt) return;
    const c = data[stage].find(x => x.name===name);
    setData(d => ({...d, [stage]:d[stage].filter(x=>x.name!==name), [nxt]:[...d[nxt],c]}));
    addToast(`${name} moved to ${nxt}`, SC[nxt]);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
        {Object.keys(SC).map(s => (
          <StatCard key={s} icon={Briefcase} label={s} raw={data[s].length} accent={SC[s]}/>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
        {Object.keys(SC).map(stage => (
          <div key={stage} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:'hidden'}}>
            <div style={{padding:'.85rem 1rem',borderBottom:`1px solid ${C.border}`,
              display:'flex',alignItems:'center',gap:8,background:`${SC[stage]}0D`}}>
              <div style={{width:9,height:9,borderRadius:'50%',background:SC[stage]}}/>
              <span style={{fontSize:13,fontWeight:700,color:C.txt,flex:1}}>{stage}</span>
              <span style={{fontSize:10,color:SC[stage],background:`${SC[stage]}22`,
                padding:'2px 8px',borderRadius:20,fontWeight:700}}>{data[stage].length}</span>
            </div>
            <div style={{padding:'.75rem',display:'flex',flexDirection:'column',gap:9}}>
              {data[stage].map(c => (
                <div key={c.name} style={{background:C.surface,border:`1px solid ${C.border}`,
                  borderRadius:9,padding:'.8rem',transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=SC[stage];e.currentTarget.style.background=`${SC[stage]}0D`}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.txt,marginBottom:3}}>{c.name}</div>
                  <div style={{fontSize:10,color:C.txt3,marginBottom:10}}>{c.role} · {c.exp}</div>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:10}}>
                    <div style={{flex:1,height:3,background:C.border,borderRadius:2}}>
                      <div style={{height:'100%',width:`${c.score}%`,background:SC[stage],borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:11,color:SC[stage],fontWeight:800}}>{c.score}</span>
                  </div>
                  {stage!=='Hired' && (
                    <button onClick={()=>move(stage,c.name)} style={{width:'100%',padding:'5px',
                      background:`${SC[stage]}22`,border:`1px solid ${SC[stage]}44`,borderRadius:7,
                      fontSize:10,color:SC[stage],cursor:'pointer',fontWeight:700,transition:'all .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background=`${SC[stage]}38`}
                      onMouseLeave={e=>e.currentTarget.style.background=`${SC[stage]}22`}>
                      Move Forward →
                    </button>
                  )}
                </div>
              ))}
              {!data[stage].length && (
                <div style={{fontSize:11,color:C.txt3,textAlign:'center',padding:'1.5rem 0',fontStyle:'italic'}}>
                  No candidates
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsModule({addToast, user}) {
  const [showPw,setShowPw] = useState(false);
  const [unlocked,setUnlocked] = useState(false);
  const [revealed,setRevealed] = useState({});

  const requestKey = name => {
    if (!user.role.canViewKeys) { addToast('API key access requires Super Admin role',C.red); return; }
    if (!unlocked) { setShowPw(true); return; }
    setRevealed(r => ({...r, [name]:!r[name]}));
  };

  const roles = [
    {name:'Super Admin',email:'sarmiz@woosho.ng',access:'Full platform access — all modules',status:'active'},
    {name:'Support Lead',email:'support@woosho.ng',access:'Support, Users, Orders',status:'active'},
    {name:'Finance Manager',email:'finance@woosho.ng',access:'Orders, Analytics, Settings',status:'active'},
    {name:'Content Mod',email:'content@woosho.ng',access:'Products, Sellers',status:'active'},
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {showPw && (
        <PasswordModal
          onClose={()=>setShowPw(false)}
          onSuccess={()=>{setUnlocked(true); addToast('Admin verified — API keys unlocked',C.green);}}/>
      )}

      <Card title="Admin Roles (RBAC)" noPad accent={C.purple}
        actions={user.role.canViewKeys ? [<Btn key="a" variant="solid" small icon={Plus}>Add Admin</Btn>] : []}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <Th cols={['Role Name','Email','Access Level','Status','Actions']}/>
          <tbody>
            {roles.map(r => (
              <Tr key={r.name}>
                <Td bold>{r.name}</Td>
                <Td>{r.email}</Td>
                <Td><span style={{fontSize:12,color:C.cyan}}>{r.access}</span></Td>
                <Td><Badge type={r.status}/></Td>
                <Td>
                  <div style={{display:'flex',gap:5}}>
                    <Btn small icon={Eye}>View</Btn>
                    {user.role.canViewKeys && <Btn small variant="purple">Edit</Btn>}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="API Keys & Integrations" accent={C.red}
        actions={[
          unlocked
            ? <div key="u" style={{display:'flex',alignItems:'center',gap:5,padding:'4px 12px',
                background:`${C.green}18`,border:`1px solid ${C.green}44`,borderRadius:20}}>
                <CheckSquare size={11} color={C.green}/>
                <span style={{fontSize:11,color:C.green,fontWeight:700}}>Unlocked</span>
              </div>
            : <div key="l" style={{display:'flex',alignItems:'center',gap:5,padding:'4px 12px',
                background:`${C.red}18`,border:`1px solid ${C.red}44`,borderRadius:20}}>
                <Lock size={11} color={C.red}/>
                <span style={{fontSize:11,color:C.red,fontWeight:700}}>Locked</span>
              </div>
        ]}>
        {!user.role.canViewKeys && (
          <div style={{background:`${C.red}14`,border:`1px solid ${C.red}33`,borderRadius:9,
            padding:'.875rem',display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <Shield size={14} color={C.red}/>
            <span style={{fontSize:13,color:C.red}}>API key access is restricted to <strong>Super Admin</strong> only.</span>
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          {apiKeys.map(k => (
            <div key={k.name} style={{display:'flex',alignItems:'center',gap:13,padding:'.9rem',
              background:C.surface,border:`1px solid ${C.border}`,borderRadius:11,transition:'all .2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHov}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:38,height:38,borderRadius:10,background:`${C.blue}22`,
                border:`1px solid ${C.blue}33`,display:'flex',alignItems:'center',
                justifyContent:'center',flexShrink:0}}>
                <Key size={16} color={C.blue}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.txt,marginBottom:4}}>{k.name}</div>
                <div style={{fontSize:10,color:C.txt3,fontFamily:"'JetBrains Mono',monospace",
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {user.role.canViewKeys && unlocked && revealed[k.name]
                    ? k.key
                    : `${k.key.substring(0,16)}${'•'.repeat(28)}`}
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
                <span style={{fontSize:10,background:`${C.blue}22`,color:C.blue,
                  padding:'3px 9px',borderRadius:20,fontWeight:700}}>{k.service}</span>
                <span style={{fontSize:10,
                  background:k.env==='Production'?`${C.green}22`:`${C.amber}22`,
                  color:k.env==='Production'?C.green:C.amber,
                  padding:'3px 9px',borderRadius:20,fontWeight:700}}>{k.env}</span>
                <button onClick={()=>requestKey(k.name)} style={{
                  padding:'6px 12px',background:`${C.purple}22`,border:`1px solid ${C.purple}44`,
                  borderRadius:8,fontSize:11,color:C.purple,cursor:'pointer',
                  display:'flex',alignItems:'center',gap:5,fontWeight:700,transition:'all .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${C.purple}38`}
                  onMouseLeave={e=>e.currentTarget.style.background=`${C.purple}22`}>
                  {user.role.canViewKeys && unlocked && revealed[k.name]
                    ? <><EyeOff size={11}/> Hide</>
                    : <><Eye size={11}/> View</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <Card title="Payment Configuration" accent={C.green}>
          <div style={{display:'flex',flexDirection:'column'}}>
            {[
              {label:'Platform Commission',value:'4% per transaction',icon:Percent},
              {label:'Payout Schedule',value:'Every 48 hours',icon:Clock},
              {label:'Minimum Payout',value:'₦5,000',icon:DollarSign},
              {label:'Payment Processor',value:'Stripe Connect',icon:CreditCard},
              {label:'Refund Window',value:'14 days',icon:RotateCcw},
            ].map((item,i) => (
              <div key={item.label} style={{display:'flex',alignItems:'center',gap:11,
                padding:'.85rem 0',borderBottom:i<4?`1px solid ${C.border}33`:'none'}}>
                <item.icon size={14} color={C.txt3}/>
                <span style={{flex:1,fontSize:13,color:C.txt2}}>{item.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:C.txt}}>{item.value}</span>
                {user.role.canViewFinance && <Btn small>Edit</Btn>}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Delivery Integrations" accent={C.blue}>
          <div style={{display:'flex',flexDirection:'column',gap:9}}>
            {[
              {name:'GIG Logistics',status:'active',coverage:'Nationwide'},
              {name:'Sendbox',status:'active',coverage:'Lagos + Abuja'},
              {name:'DHL Express',status:'draft',coverage:'International'},
              {name:'Kwik Delivery',status:'pending',coverage:'Lagos'},
            ].map(d => (
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:10,
                padding:'.8rem',background:C.surface,border:`1px solid ${C.border}`,
                borderRadius:10,transition:'all .15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderHov}
                onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <Truck size={14} color={C.txt3}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.txt}}>{d.name}</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:2}}>{d.coverage}</div>
                </div>
                <Badge type={d.status}/>
                <Btn small>Config</Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminModernDashboard() {
  const [user,setUser] = useState(null);
  const [mod,setMod] = useState('dashboard');
  const [loading,setLoading] = useState(false);
  const [toasts,setToasts] = useState([]);

  const addToast = useCallback((msg, color=C.green) => {
    const id = Date.now();
    setToasts(t => [...t, {id,msg,color}]);
    setTimeout(() => setToasts(t => t.filter(x=>x.id!==id)), 3500);
  }, []);

  const switchMod = async id => {
    if (id===mod) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    setMod(id);
    setLoading(false);
  };

  if (!user) {
    return (
      <>
        <style>{STYLES}</style>
        <Login onLogin={u => { setUser(u); addToast(`Welcome back, ${u.name.split(' ')[0]}!`, u.role.color); }}/>
        <Toast toasts={toasts}/>
      </>
    );
  }

  const allowed = user.role.modules;
  const props = {addToast, user};
  const gate = mod => <AccessDenied module={NAV.find(n=>n.id===mod)?.label||mod}/>;

  const MODULES = {
    dashboard: <Dashboard {...props}/>,
    orders:    allowed.includes('orders')    ? <Orders {...props}/>    : gate('orders'),
    products:  allowed.includes('products')  ? <Products {...props}/>  : gate('products'),
    users:     allowed.includes('users')     ? <UsersModule {...props}/> : gate('users'),
    sellers:   allowed.includes('sellers')   ? <Sellers {...props}/>   : gate('sellers'),
    analytics: allowed.includes('analytics') ? <Analytics {...props}/> : gate('analytics'),
    support:   allowed.includes('support')   ? <Support {...props}/>   : gate('support'),
    ai:        allowed.includes('ai')        ? <AIInsights {...props}/> : gate('ai'),
    hiring:    allowed.includes('hiring')    ? <Hiring {...props}/>    : gate('hiring'),
    settings:  allowed.includes('settings')  ? <SettingsModule {...props}/> : gate('settings'),
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{display:'flex',height:'100vh',background:C.bg,color:C.txt,
        fontFamily:"'Sora',sans-serif",overflow:'hidden',fontSize:14}}>
        <Sidebar mod={mod} setMod={switchMod} user={user}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <TopBar mod={mod} user={user} onLogout={()=>setUser(null)} addToast={addToast}/>
          <main style={{flex:1,overflow:'auto',padding:'1.5rem 1.75rem'}}>
            {loading
              ? <ModuleLoader/>
              : <div className="mod" key={mod}>{MODULES[mod]}</div>}
          </main>
        </div>
      </div>
      <Toast toasts={toasts}/>
    </>
  );
}

