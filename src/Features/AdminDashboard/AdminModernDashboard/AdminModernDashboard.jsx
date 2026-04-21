import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, BarChart2,
  LifeBuoy, Brain, Briefcase, Settings, Bell, Search, TrendingUp,
  Check, X, Eye, AlertCircle, Clock, CheckCircle2, XCircle, Zap,
  Activity, DollarSign, ShoppingBag, Percent, MessageSquare,
  ArrowUpRight, ArrowDownRight, Filter, Download, Plus, RefreshCw,
  Shield, Key, CreditCard, Truck, LogOut, Ticket
} from "lucide-react";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const C = {
  bg:         '#070C18',
  surface:    '#0D1526',
  card:       '#111E33',
  cardHov:    '#152035',
  border:     '#1A2B45',
  blue:       '#3B82F6',
  blueDim:    '#1E3A5F',
  cyan:       '#06B6D4',
  cyanDim:    '#0C4A5A',
  green:      '#10B981',
  greenDim:   '#064E36',
  amber:      '#F59E0B',
  amberDim:   '#6B3A0A',
  red:        '#EF4444',
  redDim:     '#5C1A1A',
  purple:     '#8B5CF6',
  purpleDim:  '#3B1F6B',
  txt:        '#F1F5F9',
  txt2:       '#94A3B8',
  txt3:       '#475569',
  sideW:      220,
};

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const salesData = [
  {day:'Mon',rev:245,orders:32},{day:'Tue',rev:312,orders:47},
  {day:'Wed',rev:289,orders:41},{day:'Thu',rev:398,orders:58},
  {day:'Fri',rev:467,orders:71},{day:'Sat',rev:534,orders:89},
  {day:'Sun',rev:421,orders:64},
];
const ordersData = [
  {id:'WS-4821',customer:'Chioma Obi',product:'Ankara Midi Dress',status:'delivered',payment:'paid',amount:15500,date:'Apr 18'},
  {id:'WS-4820',customer:'Emeka Eze',product:'JBL Wireless Earbuds',status:'shipped',payment:'paid',amount:24000,date:'Apr 18'},
  {id:'WS-4819',customer:'Amara Nwosu',product:'Shea Butter Set (x3)',status:'pending',payment:'paid',amount:8500,date:'Apr 17'},
  {id:'WS-4818',customer:'Bello Musa',product:'Nike Air Force 1 (UK42)',status:'pending',payment:'pending',amount:42000,date:'Apr 17'},
  {id:'WS-4817',customer:'Ngozi Adeyemi',product:'Handmade Leather Bag',status:'cancelled',payment:'refunded',amount:19500,date:'Apr 17'},
  {id:'WS-4816',customer:'Tunde Fashola',product:'Samsung Buds Pro',status:'delivered',payment:'paid',amount:31000,date:'Apr 16'},
  {id:'WS-4815',customer:'Adaeze Okonkwo',product:'Gold Jewellery Set',status:'shipped',payment:'paid',amount:12500,date:'Apr 16'},
  {id:'WS-4814',customer:'Yakubu Aliyu',product:'Smart Watch HW12 Pro',status:'delivered',payment:'paid',amount:28000,date:'Apr 15'},
  {id:'WS-4813',customer:'Fatima Ibrahim',product:'Ankara Fabric (3yds)',status:'pending',payment:'paid',amount:6500,date:'Apr 15'},
  {id:'WS-4812',customer:'Ola Martins',product:'Protein Supplement 1kg',status:'delivered',payment:'paid',amount:18000,date:'Apr 14'},
];
const productsInit = [
  {name:'Premium Ankara Tote Bag',cat:'Fashion',price:15500,stock:23,seller:'Adaeze Boutique',status:'active'},
  {name:'JBL Flip 6 Speaker',cat:'Electronics',price:45000,stock:8,seller:'TechHub NG',status:'active'},
  {name:'Natural Shea Butter Set',cat:'Beauty',price:8500,stock:54,seller:'GlowSkin Store',status:'active'},
  {name:'Nike Air Force 1 (UK42)',cat:'Sneakers',price:42000,stock:5,seller:'SneakerVault',status:'pending'},
  {name:'Gold Plated Ring Set',cat:'Fashion',price:12500,stock:31,seller:'Bling by Ngozi',status:'active'},
  {name:'Smart Watch HW12 Pro',cat:'Electronics',price:28000,stock:12,seller:'TechHub NG',status:'pending'},
  {name:'Waist Trainer Premium',cat:'Fashion',price:9500,stock:67,seller:'FitStore NG',status:'active'},
  {name:'Handwoven Kente Fabric',cat:'Fashion',price:22000,stock:7,seller:'Cultural Threads',status:'draft'},
];
const sellersInit = [
  {name:'Adaeze Boutique',status:'active',revenue:847000,products:34,rating:4.9,verified:true},
  {name:'TechHub NG',status:'active',revenue:1240000,products:67,rating:4.7,verified:true},
  {name:'GlowSkin Store',status:'active',revenue:523000,products:28,rating:4.8,verified:true},
  {name:'SneakerVault',status:'pending',revenue:0,products:12,rating:null,verified:false},
  {name:'Bling by Ngozi',status:'active',revenue:312000,products:19,rating:4.6,verified:true},
  {name:'Cultural Threads',status:'suspended',revenue:89000,products:8,rating:3.2,verified:false},
  {name:'FitStore NG',status:'active',revenue:445000,products:41,rating:4.5,verified:true},
  {name:'FreshFarm NG',status:'pending',revenue:0,products:5,rating:null,verified:false},
];
const buyers = [
  {name:'Chioma Obi',email:'chioma@gmail.com',orders:12,ltv:187000,activity:'high',joined:'Jan 2024'},
  {name:'Emeka Eze',email:'emeka@gmail.com',orders:7,ltv:124000,activity:'medium',joined:'Feb 2024'},
  {name:'Amara Nwosu',email:'amara@yahoo.com',orders:4,ltv:56000,activity:'low',joined:'Mar 2024'},
  {name:'Bello Musa',email:'bello@gmail.com',orders:19,ltv:342000,activity:'high',joined:'Dec 2023'},
  {name:'Ngozi Adeyemi',email:'ngozi@gmail.com',orders:3,ltv:31000,activity:'low',joined:'Apr 2024'},
  {name:'Tunde Fashola',email:'tunde@gmail.com',orders:9,ltv:198000,activity:'medium',joined:'Feb 2024'},
];
const ticketsInit = [
  {id:'TK-291',user:'Chioma Obi',issue:'Item not as described',status:'open',priority:'high',time:'2hrs ago'},
  {id:'TK-290',user:'Bello Musa',issue:'Payment not reflecting',status:'pending',priority:'high',time:'4hrs ago'},
  {id:'TK-289',user:'Amara Nwosu',issue:'Seller not responding',status:'open',priority:'medium',time:'6hrs ago'},
  {id:'TK-288',user:'Fatima Ibrahim',issue:'Wrong size delivered',status:'resolved',priority:'low',time:'1d ago'},
  {id:'TK-287',user:'Ola Martins',issue:'Refund not received',status:'pending',priority:'high',time:'2d ago'},
  {id:'TK-286',user:'Tunde Fashola',issue:'AI suggestion incorrect',status:'resolved',priority:'low',time:'2d ago'},
  {id:'TK-285',user:'Yakubu Aliyu',issue:'Account access issue',status:'resolved',priority:'medium',time:'3d ago'},
];
const topSearches = [
  {term:'ankara dress size 12',count:847,found:true},
  {term:'wireless earbuds under 20k',count:634,found:true},
  {term:'natural skincare set',count:512,found:true},
  {term:'jordans size 44',count:398,found:false},
  {term:'custom wedding gift',count:287,found:true},
  {term:'original versace belt',count:234,found:false},
  {term:'ankara fabric 6 yards',count:198,found:true},
  {term:'samsung screen protector',count:167,found:false},
];
const funnelData = [
  {stage:'Visits',value:60000,pct:100},
  {stage:'Product View',value:28000,pct:47},
  {stage:'Add to Cart',value:8400,pct:14},
  {stage:'Checkout',value:4200,pct:7},
  {stage:'Purchase',value:3200,pct:5.3},
];
const userGrowthData = [
  {month:'Jan',buyers:1200,sellers:180},{month:'Feb',buyers:1840,sellers:243},
  {month:'Mar',buyers:2340,sellers:312},{month:'Apr',buyers:3100,sellers:421},
  {month:'May',buyers:4200,sellers:534},{month:'Jun',buyers:5800,sellers:687},
  {month:'Jul',buyers:7200,sellers:842},
];
const catData = [
  {name:'Fashion',rev:1240,growth:18},{name:'Electronics',rev:987,growth:24},
  {name:'Beauty',rev:634,growth:12},{name:'Sneakers',rev:521,growth:31},
  {name:'Home',rev:312,growth:8},
];
const liveEvents = [
  {msg:'New order #WS-4825 placed · ₦15,500',time:'just now',color:C.green},
  {msg:'TechHub NG uploaded 3 new products',time:'1m ago',color:C.blue},
  {msg:'Support ticket #TK-292 opened',time:'3m ago',color:C.amber},
  {msg:'SneakerVault applied for seller approval',time:'5m ago',color:C.purple},
  {msg:'Refund #WS-4817 requested · ₦19,500',time:'8m ago',color:C.red},
  {msg:'AI handled 47 buyer inquiries automatically',time:'12m ago',color:C.cyan},
  {msg:'New order #WS-4824 placed · ₦28,000',time:'15m ago',color:C.green},
];
const hiringData = {
  Applied:[
    {name:'Temi Adeyemi',role:'Frontend Engineer',score:82},
    {name:'Kayode Bello',role:'Product Designer',score:77},
    {name:'Sade Williams',role:'Marketing Lead',score:91},
  ],
  Screening:[
    {name:'Emeka Obi',role:'Backend Engineer',score:88},
    {name:'Nkechi Eze',role:'Data Analyst',score:79},
  ],
  Interview:[
    {name:'Chukwuma Adeola',role:'Senior React Dev',score:94},
    {name:'Amina Musa',role:'AI/ML Engineer',score:87},
  ],
  Offer:[{name:'Rotimi Owolabi',role:'Lead Designer',score:96}],
  Hired:[{name:'Zara Afolabi',role:'Operations Manager',score:92}],
};

// ── HELPERS ────────────────────────────────────────────────────────────────────
const fmt = n => '₦' + Number(n).toLocaleString();

const BADGE = {
  delivered:['#10B981','#064E3622'], shipped:['#3B82F6','#1E3A5F22'],
  pending:['#F59E0B','#6B3A0A22'], cancelled:['#EF4444','#5C1A1A22'],
  paid:['#10B981','#064E3622'], refunded:['#EF4444','#5C1A1A22'],
  active:['#10B981','#064E3622'], suspended:['#EF4444','#5C1A1A22'],
  draft:['#475569','#1A254022'], open:['#EF4444','#5C1A1A22'],
  resolved:['#10B981','#064E3622'], high:['#EF4444','#5C1A1A22'],
  medium:['#F59E0B','#6B3A0A22'], low:['#475569','#1A254022'],
};

function Badge({ type }) {
  const [fg, bg] = BADGE[type] || [C.txt3, '#1A254022'];
  return (
    <span style={{
      display:'inline-block', padding:'2px 9px', borderRadius:20,
      fontSize:11, fontWeight:500, background:bg, color:fg,
      border:`1px solid ${fg}44`, textTransform:'capitalize',
    }}>{type}</span>
  );
}

function Stat({ icon: Icon, label, value, change, up, accent }) {
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:10,
      padding:'1rem', flex:'1 1 140px', minWidth:0,
      transition:'background .15s', cursor:'default',
    }}
      onMouseEnter={e=>e.currentTarget.style.background=C.cardHov}
      onMouseLeave={e=>e.currentTarget.style.background=C.card}
    >
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:(accent||C.blue)+'22',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon size={15} color={accent||C.blue} />
        </div>
        {change && (
          <span style={{fontSize:11,fontWeight:500,color:up?C.green:C.red,display:'flex',alignItems:'center',gap:2}}>
            {up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}{change}
          </span>
        )}
      </div>
      <div style={{fontSize:21,fontWeight:700,color:C.txt,fontVariantNumeric:'tabular-nums'}}>{value}</div>
      <div style={{fontSize:12,color:C.txt2,marginTop:2}}>{label}</div>
    </div>
  );
}

function Card({ title, actions, children, noPad }) {
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
      <div style={{padding:'.8rem 1.1rem',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:13,fontWeight:600,color:C.txt}}>{title}</span>
        {actions && <div style={{display:'flex',gap:6}}>{actions}</div>}
      </div>
      <div style={noPad ? {} : {padding:'1rem'}}>{children}</div>
    </div>
  );
}

function Btn({ children, variant='ghost', onClick, small }) {
  const bg = variant==='solid' ? C.blue : variant==='success' ? C.green+'22' : variant==='danger' ? C.red+'22' : 'transparent';
  const col = variant==='solid' ? '#fff' : variant==='success' ? C.green : variant==='danger' ? C.red : C.txt2;
  const brd = variant==='solid' ? 'none' : `1px solid ${variant==='success' ? C.green+'44' : variant==='danger' ? C.red+'44' : C.border}`;
  return (
    <button onClick={onClick} style={{
      background:bg, border:brd, color:col, borderRadius:6, cursor:'pointer',
      padding: small ? '3px 9px' : '5px 12px', fontSize:11, fontWeight:500,
      display:'inline-flex', alignItems:'center', gap:4, whiteSpace:'nowrap',
      transition:'opacity .15s',
    }}
      onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
      onMouseLeave={e=>e.currentTarget.style.opacity='1'}
    >{children}</button>
  );
}

function Th({ cols }) {
  return (
    <thead>
      <tr style={{borderBottom:`1px solid ${C.border}`}}>
        {cols.map(c=>(
          <th key={c} style={{padding:'8px 10px',textAlign:'left',fontSize:10,fontWeight:600,color:C.txt3,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

function Tr({ children }) {
  const [hov, setHov] = useState(false);
  return (
    <tr style={{borderBottom:`1px solid ${C.border}22`,background:hov?C.cardHov:'transparent',transition:'background .1s'}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {children}
    </tr>
  );
}

function Td({ children, mono, bold }) {
  return (
    <td style={{
      padding:'9px 10px', fontSize:12, color: bold ? C.txt : C.txt2,
      fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
      verticalAlign:'middle', whiteSpace:'nowrap',
    }}>{children}</td>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV = [
  {id:'dashboard',label:'Dashboard',icon:LayoutDashboard},
  {id:'orders',label:'Orders',icon:ShoppingCart,badge:{v:7,c:C.amber}},
  {id:'products',label:'Products',icon:Package},
  {id:'users',label:'Users',icon:Users},
  {id:'sellers',label:'Sellers',icon:Store,badge:{v:2,c:C.blue}},
  {id:'analytics',label:'Analytics',icon:BarChart2},
  {id:'support',label:'Support',icon:LifeBuoy,badge:{v:4,c:C.red}},
  {id:'ai',label:'AI Insights',icon:Brain},
  {id:'hiring',label:'Hiring',icon:Briefcase},
  {id:'settings',label:'Settings',icon:Settings},
];

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ mod, setMod }) {
  return (
    <div style={{width:C.sideW,background:C.surface,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'1rem 1.25rem',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.blue},${C.cyan})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Zap size={15} color="#fff" fill="#fff" />
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.txt,letterSpacing:'.02em'}}>Woo Sho</div>
          <div style={{fontSize:9,color:C.txt3,textTransform:'uppercase',letterSpacing:'.07em'}}>Admin Console</div>
        </div>
      </div>

      <nav style={{flex:1,overflowY:'auto',padding:'.375rem 0'}}>
        {NAV.map(({id,label,icon:Icon,badge})=>{
          const active = mod===id;
          return (
            <button key={id} onClick={()=>setMod(id)} style={{
              width:'100%',display:'flex',alignItems:'center',gap:9,
              padding:'.5rem 1.125rem',border:'none',cursor:'pointer',textAlign:'left',
              background: active ? `${C.blue}18` : 'transparent',
              borderRight: active ? `2px solid ${C.blue}` : '2px solid transparent',
              transition:'background .1s',
            }}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.background=`${C.border}66`}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent'}}
            >
              <Icon size={14} color={active?C.blue:C.txt3} />
              <span style={{fontSize:13,color:active?C.txt:C.txt2,fontWeight:active?500:400,flex:1}}>{label}</span>
              {badge && (
                <span style={{background:badge.c,color:'#fff',fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:20,minWidth:16,textAlign:'center'}}>{badge.v}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{padding:'.75rem 1.125rem',borderTop:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${C.purple},${C.blue})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <span style={{fontSize:10,color:'#fff',fontWeight:700}}>SA</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:C.txt,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Super Admin</div>
            <div style={{fontSize:10,color:C.txt3}}>admin@woosho.ng</div>
          </div>
          <LogOut size={13} color={C.txt3} style={{cursor:'pointer'}}/>
        </div>
      </div>
    </div>
  );
}

// ── TOPBAR ────────────────────────────────────────────────────────────────────
function TopBar({ mod, searchQ, setSearchQ }) {
  const [notif, setNotif] = useState(false);
  const titles = {dashboard:'Dashboard',orders:'Orders',products:'Products',users:'Users',sellers:'Sellers',analytics:'Analytics',support:'Support',ai:'AI Insights',hiring:'Hiring',settings:'Settings'};
  return (
    <div style={{height:52,background:C.surface,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 1.5rem',gap:12,flexShrink:0}}>
      <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:15,fontWeight:600,color:C.txt}}>{titles[mod]}</span>
        <span style={{fontSize:11,color:C.txt3}}>· Apr 21, 2026</span>
      </div>

      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        <Search size={12} color={C.txt3} style={{position:'absolute',left:9,pointerEvents:'none'}}/>
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search anything..."
          style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:'5px 10px 5px 27px',fontSize:12,color:C.txt,outline:'none',width:210}}/>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',background:`${C.green}18`,border:`1px solid ${C.green}33`,borderRadius:20}}>
        <div style={{width:6,height:6,borderRadius:'50%',background:C.green}}/>
        <span style={{fontSize:11,color:C.green,fontWeight:500}}>All Systems Live</span>
      </div>

      <div style={{position:'relative'}}>
        <button onClick={()=>setNotif(!notif)} style={{width:34,height:34,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative'}}>
          <Bell size={14} color={C.txt2}/>
          <span style={{position:'absolute',top:7,right:7,width:6,height:6,borderRadius:'50%',background:C.red,border:`2px solid ${C.surface}`}}/>
        </button>
        {notif && (
          <div style={{position:'absolute',right:0,top:40,width:295,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,zIndex:200,boxShadow:`0 20px 60px #000C`,overflow:'hidden'}}>
            <div style={{padding:'.7rem 1rem',borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:600,color:C.txt}}>Live Activity</div>
            {liveEvents.slice(0,5).map((ev,i)=>(
              <div key={i} style={{padding:'.55rem 1rem',borderBottom:`1px solid ${C.border}22`,display:'flex',gap:9,alignItems:'flex-start'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:ev.color,marginTop:5,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:11,color:C.txt2,lineHeight:1.4}}>{ev.msg}</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:1}}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const [feedIdx, setFeedIdx] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=>setFeedIdx(i=>(i+1)%liveEvents.length), 3500);
    return ()=>clearInterval(t);
  },[]);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Stat icon={DollarSign} label="Total Revenue" value="₦2.4B" change="+18.3%" up accent={C.green}/>
        <Stat icon={ShoppingBag} label="Total Orders" value="12,847" change="+12.1%" up accent={C.blue}/>
        <Stat icon={Users} label="Active Users" value="60,214" change="+24.7%" up accent={C.cyan}/>
        <Stat icon={Percent} label="Conversion Rate" value="5.3%" change="+0.8%" up accent={C.purple}/>
        <Stat icon={Clock} label="Pending Orders" value="341" change="+31" accent={C.amber}/>
        <Stat icon={LifeBuoy} label="Open Tickets" value="47" change="+12" accent={C.red}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}>
        <Card title="Revenue This Week" actions={[<Btn key="d" small>Daily</Btn>,<Btn key="w" small>Weekly</Btn>]}>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={salesData} margin={{top:4,right:4,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.blue} stopOpacity={0.35}/>
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}} labelStyle={{color:C.txt}} formatter={v=>[`₦${v}k`,'']}/>
              <Area type="monotone" dataKey="rev" stroke={C.blue} strokeWidth={2} fill="url(#rg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Live Activity" actions={[<div key="dot" style={{width:7,height:7,borderRadius:'50%',background:C.green,animation:'pulse 1.5s infinite'}}/>]}>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {liveEvents.map((ev,i)=>(
              <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',opacity:Math.max(0.15,1-i*0.14),transition:'opacity .4s'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:ev.color,marginTop:4,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:11,color:C.txt2,lineHeight:1.4}}>{ev.msg}</div>
                  <div style={{fontSize:10,color:C.txt3,marginTop:1}}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Top Categories" actions={[<Btn key="v" small>View All</Btn>]}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10}}>
          {catData.map(cat=>(
            <div key={cat.name} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'.75rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:500,color:C.txt}}>{cat.name}</span>
                <span style={{fontSize:11,color:C.green,display:'flex',alignItems:'center',gap:2}}><TrendingUp size={10}/> +{cat.growth}%</span>
              </div>
              <div style={{fontSize:16,fontWeight:700,color:C.txt,marginBottom:8}}>₦{cat.rev}k</div>
              <div style={{height:3,background:C.border,borderRadius:3}}>
                <div style={{height:'100%',width:`${(cat.rev/1240)*100}%`,background:`linear-gradient(90deg,${C.blue},${C.cyan})`,borderRadius:3}}/>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
function Orders() {
  const [filter, setFilter] = useState('all');
  const list = filter==='all' ? ordersData : ordersData.filter(o=>o.status===filter);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
        {['all','pending','shipped','delivered','cancelled'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:'5px 14px',borderRadius:6,fontSize:12,fontWeight:500,
            border:'none',cursor:'pointer',textTransform:'capitalize',transition:'all .15s',
            background:filter===f?C.blue:C.card, color:filter===f?'#fff':C.txt2,
          }}>{f==='all'?`All (${ordersData.length})`:f}</button>
        ))}
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          <Btn small><Filter size={11}/> Filter</Btn>
          <Btn small><Download size={11}/> Export</Btn>
        </div>
      </div>
      <Card title={`Orders (${list.length})`} noPad>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Order ID','Customer','Product','Status','Payment','Amount','Date','Actions']}/>
            <tbody>
              {list.map(o=>(
                <Tr key={o.id}>
                  <Td mono><span style={{color:C.cyan,fontWeight:500}}>{o.id}</span></Td>
                  <Td bold>{o.customer}</Td>
                  <Td>{o.product}</Td>
                  <Td><Badge type={o.status}/></Td>
                  <Td><Badge type={o.payment}/></Td>
                  <Td mono><span style={{color:C.txt,fontWeight:600}}>{fmt(o.amount)}</span></Td>
                  <Td>{o.date}</Td>
                  <Td>
                    <div style={{display:'flex',gap:4}}>
                      <Btn small><Eye size={10}/></Btn>
                      {o.status==='pending' && <Btn small variant="success"><Check size={10}/></Btn>}
                      {o.payment==='refunded' && <Btn small variant="danger"><RefreshCw size={10}/></Btn>}
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

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
function Products() {
  const [data, setData] = useState(productsInit);
  const approve = name => setData(d=>d.map(p=>p.name===name?{...p,status:'active'}:p));
  const remove  = name => setData(d=>d.filter(p=>p.name!==name));
  return (
    <Card title={`Products (${data.length})`} noPad actions={[<Btn key="a" variant="solid" small><Plus size={11}/> Add</Btn>]}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <Th cols={['Product','Category','Price','Stock','Seller','Status','Actions']}/>
          <tbody>
            {data.map(p=>(
              <Tr key={p.name}>
                <Td bold>{p.name}</Td>
                <Td>{p.cat}</Td>
                <Td mono>{fmt(p.price)}</Td>
                <Td mono><span style={{color:p.stock<10?C.amber:C.txt2}}>{p.stock}</span></Td>
                <Td>{p.seller}</Td>
                <Td><Badge type={p.status}/></Td>
                <Td>
                  <div style={{display:'flex',gap:4}}>
                    <Btn small><Eye size={10}/></Btn>
                    {p.status==='pending' && <Btn small variant="success" onClick={()=>approve(p.name)}><Check size={10}/> Approve</Btn>}
                    <Btn small variant="danger" onClick={()=>remove(p.name)}><X size={10}/></Btn>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── USERS ─────────────────────────────────────────────────────────────────────
function UsersModule() {
  const [tab, setTab] = useState('buyers');
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',gap:6}}>
        {['buyers','sellers'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'5px 16px',borderRadius:6,fontSize:12,fontWeight:500,border:'none',cursor:'pointer',
            textTransform:'capitalize',transition:'all .15s',
            background:tab===t?C.blue:C.card, color:tab===t?'#fff':C.txt2,
          }}>{t}</button>
        ))}
      </div>
      {tab==='buyers' && (
        <Card title={`Buyers (${buyers.length})`} noPad>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Name','Email','Orders','Lifetime Value','Activity','Joined']}/>
            <tbody>
              {buyers.map(b=>(
                <Tr key={b.name}>
                  <Td bold>{b.name}</Td>
                  <Td>{b.email}</Td>
                  <Td mono>{b.orders}</Td>
                  <Td mono><span style={{color:C.txt,fontWeight:600}}>{fmt(b.ltv)}</span></Td>
                  <Td><Badge type={b.activity==='high'?'active':b.activity==='low'?'draft':'pending'}/></Td>
                  <Td>{b.joined}</Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {tab==='sellers' && (
        <Card title={`Sellers Overview (${sellersInit.length})`} noPad>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Store Name','Status','Revenue','Products','Rating','Actions']}/>
            <tbody>
              {sellersInit.map(s=>(
                <Tr key={s.name}>
                  <Td bold>{s.name}</Td>
                  <Td><Badge type={s.status}/></Td>
                  <Td mono>{s.revenue>0?fmt(s.revenue):'—'}</Td>
                  <Td mono>{s.products}</Td>
                  <Td><span style={{color:C.amber,fontWeight:500}}>{s.rating?`★ ${s.rating}`:'—'}</span></Td>
                  <Td><Btn small><Eye size={10}/> View</Btn></Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ── SELLERS ───────────────────────────────────────────────────────────────────
function Sellers() {
  const [data, setData] = useState(sellersInit);
  const approve  = name => setData(d=>d.map(s=>s.name===name?{...s,status:'active',verified:true}:s));
  const suspend  = name => setData(d=>d.map(s=>s.name===name?{...s,status:'suspended'}:s));
  const pending  = data.filter(s=>s.status==='pending').length;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {pending>0 && (
        <div style={{background:`${C.amber}18`,border:`1px solid ${C.amber}44`,borderRadius:8,padding:'.7rem 1rem',display:'flex',alignItems:'center',gap:9}}>
          <AlertCircle size={14} color={C.amber}/>
          <span style={{fontSize:12,color:C.amber}}><strong>{pending} seller application{pending>1?'s':''}</strong> awaiting review</span>
        </div>
      )}
      <Card title={`Sellers (${data.length})`} noPad actions={[<Btn key="e" small><Download size={11}/> Export</Btn>]}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Store Name','Status','Revenue','Products','Rating','Verified','Actions']}/>
            <tbody>
              {data.map(s=>(
                <Tr key={s.name}>
                  <Td bold>{s.name}</Td>
                  <Td><Badge type={s.status}/></Td>
                  <Td mono>{s.revenue>0?fmt(s.revenue):'—'}</Td>
                  <Td mono>{s.products}</Td>
                  <Td><span style={{color:C.amber,fontWeight:500}}>{s.rating?`★ ${s.rating}`:'—'}</span></Td>
                  <Td>
                    {s.verified
                      ? <span style={{color:C.green,fontSize:11,display:'flex',alignItems:'center',gap:3}}><CheckCircle2 size={11}/>Verified</span>
                      : <span style={{color:C.txt3,fontSize:11}}>Unverified</span>
                    }
                  </Td>
                  <Td>
                    <div style={{display:'flex',gap:4}}>
                      <Btn small><Eye size={10}/></Btn>
                      {s.status==='pending'  && <Btn small variant="success" onClick={()=>approve(s.name)}><Check size={10}/> Approve</Btn>}
                      {s.status==='active'   && <Btn small variant="danger"  onClick={()=>suspend(s.name)}>Suspend</Btn>}
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

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
function Analytics() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Stat icon={DollarSign} label="Gross Merchandise Value" value="₦2.4B" change="+18.3%" up accent={C.green}/>
        <Stat icon={Percent} label="Platform Revenue (4%)" value="₦96M" change="+18.1%" up accent={C.blue}/>
        <Stat icon={Activity} label="Conversion Rate" value="5.3%" change="+0.8%" up accent={C.cyan}/>
        <Stat icon={Users} label="30-Day Retention" value="94%" change="+1.2%" up accent={C.purple}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:12}}>
        <Card title="User Growth">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={userGrowthData} margin={{top:4,right:4,bottom:0,left:-20}}>
              <XAxis dataKey="month" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}} labelStyle={{color:C.txt}}/>
              <Line type="monotone" dataKey="buyers" stroke={C.blue} strokeWidth={2} dot={false} name="Buyers"/>
              <Line type="monotone" dataKey="sellers" stroke={C.cyan} strokeWidth={2} dot={false} name="Sellers"/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:'flex',gap:16,marginTop:8,justifyContent:'center'}}>
            {[['Buyers',C.blue],['Sellers',C.cyan]].map(([l,c])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:C.txt3}}>
                <div style={{width:16,height:2,background:c,borderRadius:1}}/>{l}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Conversion Funnel">
          <div style={{display:'flex',flexDirection:'column',gap:8,paddingTop:4}}>
            {funnelData.map((f,i)=>(
              <div key={f.stage}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:12,color:C.txt2}}>{f.stage}</span>
                  <span style={{fontSize:11,color:C.txt}}>{f.value.toLocaleString()} <span style={{color:C.txt3}}>({f.pct}%)</span></span>
                </div>
                <div style={{height:6,background:C.border,borderRadius:3}}>
                  <div style={{height:'100%',width:`${f.pct}%`,background:`linear-gradient(90deg,${C.blue},${C.cyan})`,borderRadius:3,opacity:1-i*0.1}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Category Performance">
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={catData} margin={{top:4,right:4,bottom:0,left:-20}}>
            <XAxis dataKey="name" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}} labelStyle={{color:C.txt}} formatter={v=>[`₦${v}k`,'']}/>
            <Bar dataKey="rev" fill={C.blue} radius={[4,4,0,0]} name="Revenue (₦k)"/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ── SUPPORT ───────────────────────────────────────────────────────────────────
function Support() {
  const [data, setData] = useState(ticketsInit);
  const close = id => setData(d=>d.map(t=>t.id===id?{...t,status:'resolved'}:t));
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Stat icon={Ticket} label="Open Tickets" value={data.filter(t=>t.status==='open').length} change="+3 today" accent={C.red}/>
        <Stat icon={Clock} label="Avg Response" value="2.4hrs" change="-0.3hrs" up accent={C.amber}/>
        <Stat icon={CheckCircle2} label="Resolved Today" value="14" change="+14" up accent={C.green}/>
        <Stat icon={AlertCircle} label="High Priority" value={data.filter(t=>t.priority==='high').length} change="" accent={C.red}/>
      </div>
      <Card title="Support Tickets" noPad actions={[<Btn key="f" small><Filter size={11}/> Filter</Btn>]}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <Th cols={['Ticket ID','User','Issue','Status','Priority','Time','Actions']}/>
            <tbody>
              {data.map(t=>(
                <Tr key={t.id}>
                  <Td mono><span style={{color:C.cyan,fontWeight:500}}>{t.id}</span></Td>
                  <Td bold>{t.user}</Td>
                  <Td>{t.issue}</Td>
                  <Td><Badge type={t.status}/></Td>
                  <Td><Badge type={t.priority}/></Td>
                  <Td>{t.time}</Td>
                  <Td>
                    <div style={{display:'flex',gap:4}}>
                      <Btn small><MessageSquare size={10}/> Reply</Btn>
                      {t.status!=='resolved' && <Btn small variant="success" onClick={()=>close(t.id)}><Check size={10}/></Btn>}
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

// ── AI INSIGHTS ───────────────────────────────────────────────────────────────
function AIInsights() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <Stat icon={Brain} label="Total AI Queries" value="24,847" change="+1,203 today" up accent={C.cyan}/>
        <Stat icon={Zap} label="AI-Assisted Conversions" value="3,201" change="+32%" up accent={C.blue}/>
        <Stat icon={XCircle} label="Failed Searches" value="412" change="-18%" up accent={C.red}/>
        <Stat icon={Activity} label="Avg AI Response Time" value="1.2s" change="-0.3s" up accent={C.green}/>
      </div>

      <div style={{background:`linear-gradient(135deg,${C.cyanDim}55,${C.blueDim}55)`,border:`1px solid ${C.cyan}44`,borderRadius:10,padding:'1rem 1.25rem',display:'flex',gap:12}}>
        <Zap size={20} color={C.cyan} style={{flexShrink:0,marginTop:2}}/>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:C.txt,marginBottom:4}}>Platform Intelligence Insight</div>
          <div style={{fontSize:12,color:C.txt2,lineHeight:1.65}}>
            Buyers who interact with the AI Personal Shopper convert <strong style={{color:C.cyan}}>32% faster</strong> and have an <strong style={{color:C.cyan}}>18% higher average order value</strong> compared to standard browsers. Prioritising AI onboarding for new users will directly increase GMV. 412 failed search terms represent an inventory gap — these are unmet demand signals.
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Card title="Top AI Search Terms">
          <div style={{display:'flex',flexDirection:'column'}}>
            {topSearches.map((s,i)=>(
              <div key={s.term} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 0',borderBottom:i<topSearches.length-1?`1px solid ${C.border}33`:'none'}}>
                <span style={{width:16,fontSize:10,color:C.txt3,fontWeight:600,flexShrink:0}}>{i+1}</span>
                <span style={{flex:1,fontSize:12,color:C.txt2}}>{s.term}</span>
                <span style={{fontSize:11,color:C.txt3,minWidth:32,textAlign:'right'}}>{s.count}</span>
                <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,fontWeight:500,background:s.found?`${C.green}22`:`${C.red}22`,color:s.found?C.green:C.red,flexShrink:0}}>
                  {s.found?'✓ hit':'✗ miss'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="AI vs Standard Conversion">
          <div style={{display:'flex',flexDirection:'column',gap:16,padding:'8px 0'}}>
            {[{label:'With AI Shopper',val:32,col:C.cyan},{label:'Standard Browsing',val:5.3,col:C.txt3}].map(d=>(
              <div key={d.label}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:12,color:C.txt2}}>{d.label}</span>
                  <span style={{fontSize:16,fontWeight:700,color:d.col}}>{d.val}%</span>
                </div>
                <div style={{height:8,background:C.border,borderRadius:20}}>
                  <div style={{height:'100%',width:`${(d.val/32)*100}%`,background:d.col,borderRadius:20}}/>
                </div>
              </div>
            ))}
            <div style={{background:`${C.cyan}11`,border:`1px solid ${C.cyan}33`,borderRadius:8,padding:'.75rem',marginTop:4}}>
              <div style={{fontSize:10,color:C.cyan,fontWeight:600,marginBottom:2,textTransform:'uppercase',letterSpacing:'.06em'}}>AI Advantage</div>
              <div style={{fontSize:22,fontWeight:700,color:C.txt}}>6.0×</div>
              <div style={{fontSize:11,color:C.txt3,marginTop:1}}>AI-assisted buyers convert 6× faster than standard browsing</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── HIRING ────────────────────────────────────────────────────────────────────
const STAGE_COLORS = {Applied:C.blue,Screening:C.purple,Interview:C.amber,Offer:C.cyan,Hired:C.green};

function Hiring() {
  const stages = Object.keys(hiringData);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        {stages.map(s=>(
          <Stat key={s} icon={Briefcase} label={s} value={hiringData[s].length} accent={STAGE_COLORS[s]}/>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
        {stages.map(stage=>(
          <div key={stage} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
            <div style={{padding:'.6rem .875rem',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:STAGE_COLORS[stage]}}/>
              <span style={{fontSize:12,fontWeight:600,color:C.txt,flex:1}}>{stage}</span>
              <span style={{fontSize:9,color:C.txt3,background:C.surface,padding:'1px 6px',borderRadius:20}}>{hiringData[stage].length}</span>
            </div>
            <div style={{padding:'.6rem',display:'flex',flexDirection:'column',gap:6}}>
              {hiringData[stage].map(c=>(
                <div key={c.name} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:'.6rem'}}>
                  <div style={{fontSize:12,fontWeight:500,color:C.txt,marginBottom:2}}>{c.name}</div>
                  <div style={{fontSize:10,color:C.txt3,marginBottom:7}}>{c.role}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{height:3,flex:1,background:C.border,borderRadius:2}}>
                      <div style={{height:'100%',width:`${c.score}%`,background:STAGE_COLORS[stage],borderRadius:2}}/>
                    </div>
                    <span style={{fontSize:10,color:STAGE_COLORS[stage],fontWeight:700}}>{c.score}</span>
                  </div>
                </div>
              ))}
              {hiringData[stage].length===0 && (
                <div style={{fontSize:11,color:C.txt3,textAlign:'center',padding:'1rem 0',fontStyle:'italic'}}>No candidates</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function SettingsModule() {
  const [vis, setVis] = useState({});
  const apiKeys = [
    {name:'Supabase Anon Key',key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...xY4mPq',env:'Production'},
    {name:'Stripe Secret Key',key:'sk_live_4xR7mN2pQsTvYh...8KjLmN',env:'Production'},
    {name:'Claude API Key',key:'sk-ant-api03-jK8mP2rT...9Xz1Qw',env:'Production'},
    {name:'Paystack Secret Key',key:'sk_live_8hTyU3nWx...5RpQvM',env:'Staging'},
  ];
  const roles = [
    {name:'Super Admin',email:'admin@woosho.ng',access:'Full Access',status:'active'},
    {name:'Support Lead',email:'support@woosho.ng',access:'Support + Users',status:'active'},
    {name:'Finance Manager',email:'finance@woosho.ng',access:'Orders + Analytics',status:'active'},
    {name:'Content Moderator',email:'content@woosho.ng',access:'Products + Sellers',status:'active'},
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      <Card title="Admin Roles (RBAC)" noPad actions={[<Btn key="a" variant="solid" small><Plus size={11}/> Add Admin</Btn>]}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <Th cols={['Name','Email','Access Level','Status','Actions']}/>
          <tbody>
            {roles.map(r=>(
              <Tr key={r.name}>
                <Td bold>{r.name}</Td>
                <Td>{r.email}</Td>
                <Td><span style={{fontSize:12,color:C.cyan}}>{r.access}</span></Td>
                <Td><Badge type={r.status}/></Td>
                <Td><div style={{display:'flex',gap:4}}><Btn small>Edit</Btn><Btn small variant="danger">Remove</Btn></div></Td>
              </Tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="API Keys & Integrations">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {apiKeys.map(k=>(
            <div key={k.name} style={{display:'flex',alignItems:'center',gap:10,padding:'.7rem',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8}}>
              <Key size={14} color={C.txt3}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:C.txt,marginBottom:2}}>{k.name}</div>
                <div style={{fontSize:10,color:C.txt3,fontFamily:"'JetBrains Mono',monospace",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {vis[k.name] ? k.key : k.key.substring(0,12)+'•••••••••••'}
                </div>
              </div>
              <span style={{fontSize:10,background:`${C.blue}22`,color:C.blue,padding:'2px 8px',borderRadius:20,flexShrink:0}}>{k.env}</span>
              <Btn small onClick={()=>setVis(v=>({...v,[k.name]:!v[k.name]}))}>
                <Eye size={10}/>{vis[k.name]?'Hide':'View'}
              </Btn>
            </div>
          ))}
        </div>
      </Card>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Card title="Payment Settings">
          <div style={{display:'flex',flexDirection:'column',gap:1}}>
            {[
              {label:'Platform Commission',value:'4%',icon:CreditCard},
              {label:'Payout Schedule',value:'48 hours',icon:Clock},
              {label:'Minimum Payout',value:'₦5,000',icon:DollarSign},
              {label:'Payment Processor',value:'Stripe Connect',icon:Shield},
            ].map((item,i)=>(
              <div key={item.label} style={{display:'flex',alignItems:'center',gap:10,padding:'.6rem 0',borderBottom:i<3?`1px solid ${C.border}33`:'none'}}>
                <item.icon size={13} color={C.txt3}/>
                <span style={{flex:1,fontSize:12,color:C.txt2}}>{item.label}</span>
                <span style={{fontSize:12,fontWeight:500,color:C.txt,marginRight:8}}>{item.value}</span>
                <Btn small>Edit</Btn>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Delivery Integrations">
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {[
              {name:'GIG Logistics',status:'active'},
              {name:'Sendbox',status:'active'},
              {name:'DHL Express',status:'draft'},
              {name:'Kwik Delivery',status:'pending'},
            ].map(d=>(
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:9,padding:'.6rem',background:C.surface,border:`1px solid ${C.border}`,borderRadius:7}}>
                <Truck size={13} color={C.txt3}/>
                <span style={{flex:1,fontSize:12,color:C.txt}}>{d.name}</span>
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

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AdminModernDashboard() {
  const [mod, setMod] = useState('dashboard');
  const [searchQ, setSearchQ] = useState('');

  const MODULES = {
    dashboard: <Dashboard/>,
    orders:    <Orders/>,
    products:  <Products/>,
    users:     <UsersModule/>,
    sellers:   <Sellers/>,
    analytics: <Analytics/>,
    support:   <Support/>,
    ai:        <AIInsights/>,
    hiring:    <Hiring/>,
    settings:  <SettingsModule/>,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0D1526; }
        ::-webkit-scrollbar-thumb { background: #1A2B45; border-radius: 2px; }
        input::placeholder { color: #475569; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
      `}</style>
      <div style={{
        display:'flex', height:'100vh', background:C.bg,
        color:C.txt, fontFamily:"'Sora', sans-serif", overflow:'hidden', fontSize:14,
      }}>
        <Sidebar mod={mod} setMod={setMod}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <TopBar mod={mod} searchQ={searchQ} setSearchQ={setSearchQ}/>
          <main style={{flex:1,overflow:'auto',padding:'1.25rem 1.5rem'}}>
            {MODULES[mod]}
          </main>
        </div>
      </div>
    </>
  );
}
