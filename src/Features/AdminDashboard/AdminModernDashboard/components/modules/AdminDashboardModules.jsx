import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Brain,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Key,
  LifeBuoy,
  Package,
  RotateCcw,
  Send,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  Ticket,
  TrendingUp,
  Truck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  useAdminDashboard,
  useMoveAdminHiringCandidate,
  useQueueAdminAiQuery,
  useSetAdminOrderStatus,
  useSetAdminProductActive,
  useSetAdminSellerStatus,
  useSetAdminSupportTicketStatus,
} from "../../hooks/useAdminDashboardQueries";
import {
  ADMIN_NAV,
  ADMIN_ROLES,
  BADGE_MAP,
  C,
} from "../../constants/adminDashboardConfig";

const STAGE_COLORS = {
  applied: C.blue,
  screening: C.purple,
  interview: C.amber,
  offer: C.cyan,
  hired: C.green,
};

const formatMoney = (minor = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(minor || 0) / 100);

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value)) : "-";

const titleCase = (value = "") =>
  value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

function useHover() {
  const [hovered, setHovered] = useState(false);
  return [
    hovered,
    {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
  ];
}

function Badge({ type }) {
  const [foreground, background] = BADGE_MAP[type] || [C.txt3, `${C.border}99`];
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',
      borderRadius:20,fontSize:11,fontWeight:600,background,color:foreground,
      border:`1px solid ${foreground}55`,textTransform:'capitalize',whiteSpace:'nowrap'}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:foreground}}/>
      {titleCase(type)}
    </span>
  );
}

function Btn({ children, disabled, icon: Icon, onClick, variant="ghost" }) {
  const variants = {
    ghost: [C.txt2, "transparent", C.border],
    success: [C.green, `${C.green}18`, `${C.green}44`],
    danger: [C.red, `${C.red}18`, `${C.red}44`],
    cyan: [C.cyan, `${C.cyan}18`, `${C.cyan}44`],
    purple: [C.purple, `${C.purple}18`, `${C.purple}44`],
  };
  const [color, background, border] = variants[variant] || variants.ghost;
  return (
    <button disabled={disabled} onClick={onClick} style={{display:'inline-flex',alignItems:'center',
      gap:5,padding:'5px 10px',borderRadius:8,fontSize:11,fontWeight:700,
      color:disabled?C.txt3:color,background,border:`1px solid ${border}`,
      cursor:disabled?'not-allowed':'pointer',opacity:disabled?.6:1}}>
      {Icon && <Icon size={11}/>}
      {children}
    </button>
  );
}

function Card({ accent, actions, children, title }) {
  const [hovered, hoverProps] = useHover();
  return (
    <section className="admin-card" {...hoverProps} style={{background:C.card,border:`1px solid ${hovered?C.borderHov:C.border}`,
      borderRadius:14,overflow:'hidden',transform:hovered?'translateY(-2px)':'none',
      boxShadow:hovered?`0 12px 44px #000000AA, 0 0 22px ${C.blue}10`:`0 2px 12px #00000044`,
      transition:'all .22s cubic-bezier(.4,0,.2,1)'}}>
      {title && (
        <header style={{padding:'1rem 1.25rem',borderBottom:`1px solid ${C.border}`,
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <span style={{display:'flex',alignItems:'center',gap:10}}>
            {accent && <span style={{width:3,height:18,borderRadius:2,background:accent}}/>}
            <strong style={{fontSize:14,color:C.txt}}>{title}</strong>
          </span>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

function Stat({ icon: Icon, label, value, color=C.blue }) {
  const [hovered, hoverProps] = useHover();
  return (
    <div className="admin-stat-card" {...hoverProps} style={{flex:'1 1 170px',padding:'1.5rem',background:C.card,
      border:`1px solid ${hovered?C.borderHov:C.border}`,borderRadius:14,cursor:'default',
      position:'relative',overflow:'hidden',transform:hovered?'translateY(-5px) scale(1.015)':'none',
      boxShadow:hovered?`0 16px 52px #000000AA, 0 0 30px ${color}28`:`0 2px 12px #00000044`,
      transition:'all .25s cubic-bezier(.4,0,.2,1)'}}>
      <span style={{position:'absolute',top:0,right:0,width:100,height:100,borderRadius:'50%',
        background:`radial-gradient(circle, ${color}1C 0%, transparent 70%)`,
        transform:'translate(28px,-28px)',pointerEvents:'none'}}/>
      <div style={{width:44,height:44,borderRadius:12,display:'flex',alignItems:'center',
        justifyContent:'center',background:`${color}22`,border:`1px solid ${color}33`,marginBottom:18}}>
        <Icon size={20} color={color}/>
      </div>
      <div style={{fontSize:25,fontWeight:800,color:C.txt,letterSpacing:'-.03em',
        fontFamily:"'JetBrains Mono',monospace"}}>{value}</div>
      <div style={{fontSize:12,color:C.txt2,marginTop:6,fontWeight:500}}>{label}</div>
    </div>
  );
}

function Stats({ children }) {
  return <div className="admin-stats" style={{display:'flex',gap:12,flexWrap:'wrap'}}>{children}</div>;
}

function Table({ columns, rows, emptyMessage }) {
  return (
    <div className="admin-table-scroll" style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${C.border}`}}>{columns.map((column) => (
            <th key={column} style={{padding:'11px 13px',textAlign:'left',fontSize:10,
              textTransform:'uppercase',letterSpacing:'.08em',color:C.txt3,
              background:`${C.surface}88`,whiteSpace:'nowrap'}}>{column}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.length ? rows : (
            <tr>
              <td colSpan={columns.length} style={{padding:'2rem',textAlign:'center',color:C.txt3,fontSize:13}}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children }) {
  return <td style={{padding:'11px 13px',borderBottom:`1px solid ${C.border}55`,
    color:C.txt2,fontSize:12,verticalAlign:'middle',whiteSpace:'nowrap'}}>{children}</td>;
}

function PanelMessage({ children }) {
  return <div style={{padding:'1rem 1.2rem',border:`1px solid ${C.border}`,borderRadius:12,
    background:C.card,color:C.txt2,fontSize:13,lineHeight:1.6}}>{children}</div>;
}

export function ModuleLoader() {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <Stats>
        {[1,2,3,4].map((item) => (
          <div key={item} style={{flex:1,minWidth:170,height:150,background:C.card,
            border:`1px solid ${C.border}`,borderRadius:14,
            backgroundImage:`linear-gradient(90deg, ${C.card} 25%, ${C.cardHov} 50%, ${C.card} 75%)`,
            backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite'}}/>
        ))}
      </Stats>
      <div style={{height:280,borderRadius:14,border:`1px solid ${C.border}`,
        backgroundImage:`linear-gradient(90deg, ${C.card} 25%, ${C.cardHov} 50%, ${C.card} 75%)`,
        backgroundSize:'200% 100%',animation:'shimmer 1.4s infinite'}}/>
    </div>
  );
}

export function Toast({ toasts }) {
  return (
    <div className="admin-toast-container" style={{position:'fixed',right:24,bottom:24,zIndex:9999,display:'flex',
      flexDirection:'column',gap:9,pointerEvents:'none'}}>
      {toasts.map((toast) => (
        <div className="admin-toast" key={toast.id} style={{padding:'12px 18px',borderRadius:11,color:C.txt,background:C.card,
          border:`1px solid ${toast.color}55`,boxShadow:`0 10px 36px #000000BB, 0 0 18px ${toast.color}33`,
          display:'flex',alignItems:'center',gap:10,animation:'slideIn .22s cubic-bezier(.4,0,.2,1)',
          minWidth:290,maxWidth:390}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:toast.color,flexShrink:0}}/>
          <span style={{fontSize:13,fontWeight:500}}>{toast.msg}</span>
        </div>
      ))}
    </div>
  );
}

function AccessDenied({ module }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      minHeight:440,gap:18,textAlign:'center'}}>
      <div style={{width:80,height:80,borderRadius:24,background:`${C.red}18`,
        border:`1px solid ${C.red}33`,display:'flex',alignItems:'center',
        justifyContent:'center',boxShadow:`0 0 16px ${C.red}44`}}>
        <Shield size={34} color={C.red}/>
      </div>
      <strong style={{fontSize:22,color:C.txt}}>Access Restricted</strong>
      <div style={{fontSize:13,color:C.txt2,maxWidth:360,lineHeight:1.75}}>
        Your current role does not have permission to view <strong style={{color:C.txt}}>{module}</strong>.
      </div>
    </div>
  );
}

function activityColor(type) {
  return {
    order_status: C.blue,
    product_status: C.cyan,
    seller_status: C.purple,
  }[type] || C.green;
}

function CategoryMetricCard({ category, maximum }) {
  const [hovered, hoverProps] = useHover();
  const revenue = Number(category.revenue_minor || 0);
  return (
    <div {...hoverProps} style={{background:C.card,border:`1px solid ${hovered?C.borderHov:C.border}`,
      borderRadius:13,padding:'1.375rem',cursor:'default',transform:hovered?'translateY(-4px)':'none',
      boxShadow:hovered?`0 12px 40px #00000099, 0 0 20px ${C.blue}14`:`0 2px 8px #00000033`,
      transition:'all .22s cubic-bezier(.4,0,.2,1)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <strong style={{fontSize:13,color:C.txt}}>{category.name}</strong>
        <span style={{fontSize:11,color:C.cyan,display:'flex',alignItems:'center',gap:3,fontWeight:700}}>
          <TrendingUp size={11}/>{Number(category.share || 0)}%
        </span>
      </div>
      <div style={{fontSize:20,fontWeight:800,color:C.txt,marginBottom:12,
        fontFamily:"'JetBrains Mono',monospace"}}>{formatMoney(revenue)}</div>
      <div style={{height:4,background:C.border,borderRadius:4}}>
        <div style={{height:'100%',width:`${revenue / maximum * 100}%`,
          background:`linear-gradient(90deg,${C.blue},${C.cyan})`,borderRadius:4}}/>
      </div>
      <div style={{fontSize:10,color:C.txt3,marginTop:8}}>Share of category revenue</div>
    </div>
  );
}

function DashboardModule({ data }) {
  const stats = data.stats || {};
  const categories = data.categories || [];
  const categoryMaximum = Math.max(...categories.map((category) => Number(category.revenue_minor || 0)), 1);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="admin-dashboard-banner" style={{background:`linear-gradient(135deg,${C.blueDim}CC,${C.cyanDim}AA)`,
        border:`1px solid ${C.blue}44`,borderRadius:14,padding:'1.25rem 1.5rem',
        display:'flex',alignItems:'center',gap:13}}>
        <Sparkles size={20} color={C.cyan}/>
        <div>
          <strong style={{fontSize:13,color:C.txt}}>Live backend overview</strong>
          <span style={{fontSize:13,color:C.cyan}}>
            {` - ${stats.pendingOrders || 0} pending orders, ${stats.openTickets || 0} open support tickets, and ${stats.products || 0} catalog products.`}
          </span>
        </div>
      </div>
      <Stats>
        <Stat icon={DollarSign} label="Total Revenue" value={formatMoney(stats.revenueMinor)} color={C.green}/>
        <Stat icon={ShoppingCart} label="Total Orders" value={stats.orders || 0}/>
        <Stat icon={Users} label="Users" value={stats.users || 0} color={C.cyan}/>
        <Stat icon={Package} label="Products" value={stats.products || 0} color={C.purple}/>
        <Stat icon={Clock} label="Pending Orders" value={stats.pendingOrders || 0} color={C.amber}/>
        <Stat icon={LifeBuoy} label="Open Tickets" value={stats.openTickets || 0} color={C.red}/>
      </Stats>
      <div className="admin-grid-overview" style={{display:'grid',gridTemplateColumns:'minmax(0,5fr) minmax(260px,2fr)',gap:14}}>
        <Card title="Revenue & Orders Overview" accent={C.blue}>
          <div style={{padding:'1.25rem'}}>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={data.salesChart || []} margin={{top:8,right:8,bottom:0,left:-18}}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}}
                  labelStyle={{color:C.txt}} formatter={(value,name)=>[
                    name === "revenueMinor" ? formatMoney(value) : value,
                    name === "revenueMinor" ? "Revenue" : "Orders",
                  ]}/>
                <Area type="monotone" dataKey="revenueMinor" stroke={C.blue} strokeWidth={2.5} fill="url(#adminRevenue)" dot={false}/>
                <Area type="monotone" dataKey="orders" stroke={C.cyan} strokeWidth={2} fill="transparent" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Live Activity" accent={C.green}>
          <div style={{padding:'1rem',display:'flex',flexDirection:'column',gap:9}}>
            {(data.activities || []).slice(0,6).map((activity,index) => (
              <div key={activity.id} style={{display:'flex',gap:10,alignItems:'flex-start',opacity:Math.max(.3,1-index*.12)}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:activityColor(activity.type),
                  marginTop:4,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:11,color:C.txt2,lineHeight:1.5}}>{activity.message}</div>
                  <small style={{color:C.txt3}}>{formatDate(activity.created_at)}</small>
                </div>
              </div>
            ))}
            {!data.activities?.length && <span style={{fontSize:12,color:C.txt3}}>No admin activity recorded yet.</span>}
          </div>
        </Card>
      </div>
      {categories.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:13}}>
          {categories.map((category) => <CategoryMetricCard key={category.name} category={category} maximum={categoryMaximum}/>)}
        </div>
      )}
      {!categories.length && <PanelMessage>No category revenue is available yet.</PanelMessage>}
    </div>
  );
}

function OrdersModule({ data, mutation, toast }) {
  const [filter, setFilter] = useState("all");
  const orders = data.orders || [];
  const filtered = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  const update = (id, status) => mutation.mutate({ id, status }, {
    onSuccess: () => toast("Order status updated", C.green),
    onError: (error) => toast(error.message, C.red),
  });
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={ShoppingCart} label="Orders" value={orders.length}/>
        <Stat icon={Clock} label="Pending" value={orders.filter((order)=>order.status==="pending").length} color={C.amber}/>
        <Stat icon={Truck} label="Shipped" value={orders.filter((order)=>order.status==="shipped").length} color={C.cyan}/>
        <Stat icon={CheckCircle2} label="Delivered" value={orders.filter((order)=>order.status==="delivered").length} color={C.green}/>
      </Stats>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        {["all","pending","processing","shipped","delivered","cancelled"].map((status) => (
          <Btn key={status} variant={filter===status?"cyan":"ghost"} onClick={()=>setFilter(status)}>{titleCase(status)}</Btn>
        ))}
      </div>
      <Card title={`Orders (${filtered.length})`}>
        <Table columns={["Order","Customer","Products","Sellers","Status","Payment","Amount","Date","Actions"]}
          emptyMessage="No orders found in the backend."
          rows={filtered.map((order) => (
            <tr key={order.id}>
              <Td>{order.id.slice(0,8)}</Td><Td>{order.customer}</Td><Td>{order.products}</Td><Td>{order.sellers}</Td>
              <Td><Badge type={order.status}/></Td><Td><Badge type={order.payment}/></Td>
              <Td>{formatMoney(order.amount_minor)}</Td><Td>{formatDate(order.created_at)}</Td>
              <Td><div style={{display:'flex',gap:5}}>
                {order.status==="pending" && <Btn icon={Truck} variant="success" onClick={()=>update(order.id,"shipped")}>Ship</Btn>}
                {!["cancelled","delivered"].includes(order.status) && <Btn icon={X} variant="danger" onClick={()=>update(order.id,"cancelled")}>Cancel</Btn>}
              </div></Td>
            </tr>
          ))}/>
      </Card>
    </div>
  );
}

function ProductsModule({ data, mutation, toast }) {
  const products = data.products || [];
  const update = (id, active) => mutation.mutate({ id, active }, {
    onSuccess: () => toast("Product visibility updated", C.green),
    onError: (error) => toast(error.message, C.red),
  });
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Package} label="Products" value={products.length}/>
        <Stat icon={CheckCircle2} label="Active" value={products.filter((product)=>product.is_active).length} color={C.green}/>
        <Stat icon={XCircle} label="Inactive" value={products.filter((product)=>!product.is_active).length} color={C.red}/>
      </Stats>
      <Card title={`Products (${products.length})`}>
        <Table columns={["Product","Category","Seller","Price","Stock","Views","Status","Actions"]}
          emptyMessage="No products found in the backend."
          rows={products.map((product) => (
            <tr key={product.id}>
              <Td>{product.name}</Td><Td>{product.category}</Td><Td>{product.seller}</Td>
              <Td>{formatMoney(product.price_minor)}</Td><Td>{product.stock}</Td><Td>{product.views}</Td>
              <Td><Badge type={product.is_active?"active":"inactive"}/></Td>
              <Td>{product.is_active
                ? <Btn icon={X} variant="danger" onClick={()=>update(product.id,false)}>Deactivate</Btn>
                : <Btn icon={Check} variant="success" onClick={()=>update(product.id,true)}>Activate</Btn>}</Td>
            </tr>
          ))}/>
      </Card>
    </div>
  );
}

function UsersModule({ data }) {
  const [tab, setTab] = useState("buyers");
  const records = tab === "buyers" ? data.buyers || [] : data.sellers || [];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Users} label="Buyers" value={(data.buyers || []).length}/>
        <Stat icon={Store} label="Sellers" value={(data.sellers || []).length} color={C.purple}/>
      </Stats>
      <div style={{display:'flex',gap:7}}>
        {["buyers","sellers"].map((name) => <Btn key={name} variant={tab===name?"cyan":"ghost"} onClick={()=>setTab(name)}>{titleCase(name)}</Btn>)}
      </div>
      <Card title={titleCase(tab)}>
        {tab === "buyers" ? (
          <Table columns={["Name","Email","Orders","Lifetime Value","Joined"]} emptyMessage="No buyers found in the backend."
            rows={records.map((buyer) => <tr key={buyer.id}><Td>{buyer.name}</Td><Td>{buyer.email}</Td>
              <Td>{buyer.orders}</Td><Td>{formatMoney(buyer.lifetime_value_minor)}</Td><Td>{formatDate(buyer.created_at)}</Td></tr>)}/>
        ) : (
          <Table columns={["Store","Status","Revenue","Products","Orders","Joined"]} emptyMessage="No sellers found in the backend."
            rows={records.map((seller) => <tr key={seller.id}><Td>{seller.name}</Td><Td><Badge type={seller.status}/></Td>
              <Td>{formatMoney(seller.revenue_minor)}</Td><Td>{seller.products}</Td><Td>{seller.orders}</Td><Td>{formatDate(seller.created_at)}</Td></tr>)}/>
        )}
      </Card>
    </div>
  );
}

function SellersModule({ data, mutation, toast }) {
  const sellers = data.sellers || [];
  const update = (id, status) => mutation.mutate({ id, status }, {
    onSuccess: () => toast("Seller status updated", C.green),
    onError: (error) => toast(error.message, C.red),
  });
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Store} label="Sellers" value={sellers.length}/>
        <Stat icon={CheckCircle2} label="Active" value={sellers.filter((seller)=>seller.status==="active").length} color={C.green}/>
        <Stat icon={Clock} label="Pending" value={sellers.filter((seller)=>seller.status==="pending").length} color={C.amber}/>
        <Stat icon={XCircle} label="Suspended" value={sellers.filter((seller)=>seller.status==="suspended").length} color={C.red}/>
      </Stats>
      <Card title={`Sellers (${sellers.length})`}>
        <Table columns={["Store","Status","Revenue","Products","Orders","Verified","Actions"]} emptyMessage="No sellers found in the backend."
          rows={sellers.map((seller) => (
            <tr key={seller.id}>
              <Td>{seller.name}</Td><Td><Badge type={seller.status}/></Td><Td>{formatMoney(seller.revenue_minor)}</Td>
              <Td>{seller.products}</Td><Td>{seller.orders}</Td><Td>{seller.verified?"Yes":"No"}</Td>
              <Td><div style={{display:'flex',gap:5}}>
                {seller.status!=="active" && <Btn icon={Check} variant="success" onClick={()=>update(seller.id,"active")}>Activate</Btn>}
                {seller.status!=="suspended" && <Btn icon={X} variant="danger" onClick={()=>update(seller.id,"suspended")}>Suspend</Btn>}
                {seller.status==="suspended" && <Btn icon={RotateCcw} variant="cyan" onClick={()=>update(seller.id,"pending")}>Reset</Btn>}
              </div></Td>
            </tr>
          ))}/>
      </Card>
    </div>
  );
}

function AnalyticsModule({ data }) {
  const analytics = data.analytics || {};
  const funnel = analytics.funnel || [];
  const categories = data.categories || [];
  const palette = [C.blue,C.cyan,C.green,C.purple,C.amber];
  const maximum = Math.max(...funnel.map((item)=>Number(item.value || 0)), 1);
  const growth = (analytics.userGrowth || []).map((item) => ({
    ...item,
    month: item.month
      ? new Intl.DateTimeFormat("en-NG", { month:"short", year:"2-digit" }).format(new Date(item.month))
      : "-",
  }));
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={DollarSign} label="Gross Merchandise Value" value={formatMoney(data.stats?.revenueMinor)} color={C.green}/>
        <Stat icon={ShoppingCart} label="Total Orders" value={data.stats?.orders || 0}/>
        <Stat icon={Users} label="Registered Users" value={data.stats?.users || 0} color={C.cyan}/>
        <Stat icon={Package} label="Catalog Products" value={data.stats?.products || 0} color={C.purple}/>
      </Stats>
      <div className="admin-grid-overview" style={{display:'grid',gridTemplateColumns:'minmax(0,5fr) minmax(240px,2fr)',gap:14}}>
        <Card title="User Growth Trend" accent={C.blue}>
          <div style={{padding:'1.25rem'}}>
            {growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={growth} margin={{top:8,right:8,bottom:0,left:-18}}>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}}
                    labelStyle={{color:C.txt}}/>
                  <Line type="monotone" dataKey="buyers" stroke={C.blue} strokeWidth={2.5} dot={false} name="Buyers"/>
                  <Line type="monotone" dataKey="sellers" stroke={C.cyan} strokeWidth={2} dot={false} name="Sellers"/>
                </LineChart>
              </ResponsiveContainer>
            ) : <PanelMessage>No user-growth records are available yet.</PanelMessage>}
          </div>
        </Card>
        <Card title="Category Share" accent={C.purple}>
          <div style={{padding:'1.1rem'}}>
            {categories.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={145}>
                  <PieChart>
                    <Pie data={categories} dataKey="share" cx="50%" cy="50%" outerRadius={62} innerRadius={34} strokeWidth={0}>
                      {categories.map((category,index) => <Cell key={category.name} fill={palette[index%palette.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
                  {categories.map((category,index) => (
                    <div key={category.name} style={{display:'flex',alignItems:'center',gap:7,fontSize:11}}>
                      <span style={{width:8,height:8,borderRadius:2,background:palette[index%palette.length]}}/>
                      <span style={{flex:1,color:C.txt2}}>{category.name}</span>
                      <strong style={{color:C.txt}}>{Number(category.share || 0)}%</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : <PanelMessage>No category revenue is available yet.</PanelMessage>}
          </div>
        </Card>
      </div>
      <div className="admin-grid-analytics-bottom" style={{display:'grid',gridTemplateColumns:'minmax(280px,2fr) minmax(0,3fr)',gap:14}}>
        <Card title="Commerce Funnel" accent={C.cyan}>
          <div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:14}}>
            {funnel.map((item) => <div key={item.stage}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:C.txt2,marginBottom:6}}>
                <strong>{item.stage}</strong>
                <span style={{fontFamily:"'JetBrains Mono',monospace",color:C.txt}}>
                  {Number(item.value || 0).toLocaleString()}
                </span>
              </div>
              <div style={{height:7,background:C.border,borderRadius:20}}>
                <div style={{height:'100%',width:`${Number(item.value || 0) / maximum * 100}%`,
                  background:`linear-gradient(90deg,${C.blue},${C.cyan})`,borderRadius:20}}/>
              </div>
            </div>)}
            {!funnel.length && <PanelMessage>No funnel records are available yet.</PanelMessage>}
          </div>
        </Card>
        <Card title="Category Revenue" accent={C.amber}>
          <div style={{padding:'1.25rem'}}>
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categories} margin={{top:8,right:8,bottom:0,left:-18}}>
                  <XAxis dataKey="name" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}}
                    labelStyle={{color:C.txt}} formatter={(value)=>[formatMoney(value),"Revenue"]}/>
                  <Bar dataKey="revenue_minor" radius={[5,5,0,0]} fill={C.blue} name="Revenue"/>
                </BarChart>
              </ResponsiveContainer>
            ) : <PanelMessage>No category revenue is available yet.</PanelMessage>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SupportModule({ data, mutation, toast }) {
  const tickets = data.supportTickets || [];
  const update = (id, status, escalate=false) => mutation.mutate({ id, status, escalate }, {
    onSuccess: () => toast("Support ticket updated", C.green),
    onError: (error) => toast(error.message, C.red),
  });
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Ticket} label="Open tickets" value={tickets.filter((ticket)=>ticket.status!=="resolved").length} color={C.red}/>
        <Stat icon={AlertTriangle} label="High priority" value={tickets.filter((ticket)=>ticket.priority==="high").length} color={C.amber}/>
        <Stat icon={CheckCircle2} label="Resolved" value={tickets.filter((ticket)=>ticket.status==="resolved").length} color={C.green}/>
      </Stats>
      <Card title={`Support Tickets (${tickets.length})`}>
        <Table columns={["Ticket","User","Subject","Category","Priority","Status","Created","Actions"]}
          emptyMessage="No support tickets found in the backend."
          rows={tickets.map((ticket) => <tr key={ticket.id}>
            <Td>{ticket.ticket_number}</Td><Td>{ticket.user_name}</Td><Td>{ticket.subject}</Td><Td>{ticket.category}</Td>
            <Td><Badge type={ticket.priority}/></Td><Td><Badge type={ticket.status}/></Td><Td>{formatDate(ticket.created_at)}</Td>
            <Td><div style={{display:'flex',gap:5}}>
              {ticket.status!=="resolved" && <Btn icon={Check} variant="success" onClick={()=>update(ticket.id,"resolved")}>Resolve</Btn>}
              {!ticket.is_escalated && <Btn icon={AlertCircle} variant="purple" onClick={()=>update(ticket.id,ticket.status,true)}>Escalate</Btn>}
            </div></Td>
          </tr>)}/>
      </Card>
    </div>
  );
}

function AiModule({ data, mutation, toast }) {
  const [prompt, setPrompt] = useState("");
  const ai = data.ai || {};
  const submit = () => {
    if (!prompt.trim()) return;
    mutation.mutate(prompt.trim(), {
      onSuccess: () => { setPrompt(""); toast("AI analysis request queued", C.cyan); },
      onError: (error) => toast(error.message, C.red),
    });
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Brain} label="Queued AI analysis requests" value={ai.queryCount || 0} color={C.cyan}/>
        <Stat icon={Activity} label="Product search signals" value={ai.failedSearches || 0} color={C.blue}/>
      </Stats>
      <PanelMessage>
        AI requests are stored in the backend queue. Connect a server-side worker or Edge Function to process them and write responses.
      </PanelMessage>
      <Card title="Queue Platform Analysis">
        <div className="admin-ai-form" style={{padding:'1.2rem',display:'flex',gap:8}}>
          <input value={prompt} onChange={(event)=>setPrompt(event.target.value)} placeholder="Describe the platform analysis needed"
            style={{flex:1,padding:'10px 12px',borderRadius:9,border:`1px solid ${C.border}`,background:C.surface,color:C.txt}}/>
          <Btn icon={Send} variant="cyan" disabled={!prompt.trim() || mutation.isPending} onClick={submit}>Queue</Btn>
        </div>
      </Card>
      <Card title="Recent AI Requests">
        <Table columns={["Prompt","Status","Created","Response"]} emptyMessage="No AI requests found in the backend."
          rows={(ai.queries || []).map((query) => <tr key={query.id}><Td>{query.prompt}</Td><Td><Badge type={query.status}/></Td>
            <Td>{formatDate(query.created_at)}</Td><Td>{query.response || "-"}</Td></tr>)}/>
      </Card>
    </div>
  );
}

function HiringModule({ data, mutation, toast }) {
  const candidates = data.hiringCandidates || [];
  const stages = data.hiringStages || [];
  const move = (candidate, stage) => mutation.mutate({ id:candidate.id, stage }, {
    onSuccess: () => toast("Candidate stage updated", C.green),
    onError: (error) => toast(error.message, C.red),
  });
  return (
    <div className="admin-hiring-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:12}}>
      {stages.map((stage, index) => {
        const stageCandidates = candidates.filter((candidate)=>candidate.stage===stage);
        return <Card key={stage} title={`${titleCase(stage)} (${stageCandidates.length})`}>
          <div style={{padding:'.8rem',display:'flex',flexDirection:'column',gap:8}}>
            {stageCandidates.map((candidate) => <div key={candidate.id} style={{padding:'.8rem',borderRadius:9,
              background:C.surface,border:`1px solid ${C.border}`}}>
              <strong style={{fontSize:12,color:C.txt}}>{candidate.full_name}</strong>
              <div style={{fontSize:11,color:C.txt3,marginTop:4}}>{candidate.role_title}</div>
              <div style={{fontSize:11,color:STAGE_COLORS[stage],marginTop:6}}>Score: {candidate.score ?? "-"}</div>
              {index < stages.length - 1 && <div style={{marginTop:8}}><Btn icon={Briefcase} variant="cyan"
                onClick={()=>move(candidate,stages[index+1])}>Move Forward</Btn></div>}
            </div>)}
            {!stageCandidates.length && <span style={{fontSize:11,color:C.txt3}}>No candidates.</span>}
          </div>
        </Card>;
      })}
    </div>
  );
}

function SettingsModule({ data }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Card title="Admin Accounts">
        <Table columns={["Name","Email","Role","Status"]} emptyMessage="No admin accounts found in the backend."
          rows={(data.admins || []).map((admin) => <tr key={admin.id}><Td>{admin.full_name || "-"}</Td><Td>{admin.email}</Td>
            <Td>{ADMIN_ROLES[admin.role]?.label || titleCase(admin.role)}</Td><Td><Badge type={admin.is_active?"active":"inactive"}/></Td></tr>)}/>
      </Card>
      <Card title="Platform Integrations">
        <Table columns={["Name","Service","Environment","Status"]} emptyMessage="No platform integrations configured in the backend."
          rows={(data.integrations || []).map((integration) => <tr key={integration.id}><Td><Key size={13} color={C.blue}/> {integration.name}</Td>
            <Td>{integration.service}</Td><Td>{integration.environment || "-"}</Td><Td><Badge type={integration.status}/></Td></tr>)}/>
      </Card>
      <Card title="Platform Settings">
        <Table columns={["Setting","Value","Updated"]} emptyMessage="No platform settings configured in the backend."
          rows={(data.settings || []).map((setting) => <tr key={setting.key}><Td>{setting.key}</Td>
            <Td>{JSON.stringify(setting.value)}</Td><Td>{formatDate(setting.updated_at)}</Td></tr>)}/>
      </Card>
    </div>
  );
}

export function AdminDashboardModules({ addToast, moduleId, user }) {
  const dashboard = useAdminDashboard();
  const orderMutation = useSetAdminOrderStatus();
  const productMutation = useSetAdminProductActive();
  const sellerMutation = useSetAdminSellerStatus();
  const supportMutation = useSetAdminSupportTicketStatus();
  const hiringMutation = useMoveAdminHiringCandidate();
  const aiMutation = useQueueAdminAiQuery();

  if (dashboard.isLoading) return <ModuleLoader/>;
  if (dashboard.isError) return <PanelMessage>{dashboard.error.message}</PanelMessage>;

  const data = dashboard.data || {};
  const shared = { data, toast:addToast };
  const modules = {
    dashboard: <DashboardModule data={data}/>,
    orders: <OrdersModule {...shared} mutation={orderMutation}/>,
    products: <ProductsModule {...shared} mutation={productMutation}/>,
    users: <UsersModule data={data}/>,
    sellers: <SellersModule {...shared} mutation={sellerMutation}/>,
    analytics: <AnalyticsModule data={data}/>,
    support: <SupportModule {...shared} mutation={supportMutation}/>,
    ai: <AiModule {...shared} mutation={aiMutation}/>,
    hiring: <HiringModule {...shared} mutation={hiringMutation}/>,
    settings: <SettingsModule data={data}/>,
  };

  if (!user.role.modules.includes(moduleId)) {
    return <AccessDenied module={ADMIN_NAV.find((item)=>item.id===moduleId)?.label || moduleId}/>;
  }

  return <div className="mod">{modules[moduleId]}</div>;
}
