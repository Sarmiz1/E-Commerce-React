import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit2,
  Eye,
  Filter,
  Key,
  LifeBuoy,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Search,
  Send,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  Ticket,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  useAdminDashboard,
  useAdminAdverts,
  useAdminBuyers,
  useAdminDealsOfDay,
  useAdminDeactivatedBuyers,
  useAdminHiring,
  useAdminPageActivity,
  useAdminPaidSalesChart,
  useAdminPromoCodes,
  useAdminSellerAdvertisements,
  useAdminProducts,
  useAdminUserGrowth,
  useConfigureAdminPromotionPasscode,
  useCreateAdminJobOpening,
  useDeleteAdminCareerQuestion,
  useDeleteAdminIntegration,
  useDeleteAdminPromoCode,
  useDeleteAdminSetting,
  useMoveAdminHiringCandidate,
  useOpenAdminCareerDocument,
  usePromoteAdmin,
  useQueueAdminAiQuery,
  usePermanentlyDeleteBuyerAccount,
  useReviewBuyerReactivation,
  useSaveAdminIntegration,
  useSaveAdminAdvert,
  useSaveAdminCareerQuestion,
  useSaveAdminDealOfDay,
  useSaveAdminPromoCode,
  useSaveAdminSetting,
  useSetAdminJobOpeningStatus,
  useSetAdminOrderStatus,
  useSetAdminProductActive,
  useSetAdminProductModerationStatus,
  useSetAdminSellerStatus,
  useSetAdminSupportTicketStatus,
  useUpdateSellerAdvertisementStatus,
  useDeleteAdminAdvert,
  useDeleteAdminDealOfDay,
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

const SALES_CHART_RANGES = [
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "years", label: "Years" },
];

const USER_GROWTH_RANGES = [
  { id: "days", label: "Days" },
  { id: "months", label: "Months" },
  { id: "years", label: "Years" },
];

const adminPromoSchema = z.object({
  code: z.string().trim().min(3, "Code must be at least 3 characters.").max(24, "Code is too long.")
    .regex(/^[A-Z0-9_-]+$/i, "Use letters, numbers, underscores, or hyphens."),
  label: z.string().trim().min(2, "Label is required.").max(80, "Label is too long."),
  type: z.enum(["percent", "fixed", "shipping"]),
  value: z.coerce.number().min(0, "Value cannot be negative."),
  minOrder: z.coerce.number().min(0, "Minimum order cannot be negative."),
  maxUses: z.union([z.literal(""), z.coerce.number().int().positive("Use limit must be positive.")]).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
}).superRefine((value, ctx) => {
  if (value.type !== "shipping" && value.value <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Value must be greater than zero." });
  }
  if (value.type === "percent" && value.value > 90) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Percent promos cannot exceed 90%." });
  }
});

const adminPromoDefaults = {
  code: "",
  label: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  maxUses: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

const toMinor = (value = 0) => Math.round(Number(value || 0) * 100);
const fromMinor = (value = 0) => Number(value || 0) / 100;
const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
};
const promoToForm = (promo) => ({
  code: promo?.code || "",
  label: promo?.label || "",
  type: promo?.type || "percent",
  value: promo?.type === "fixed" ? fromMinor(promo?.value) : Number(promo?.value || 0),
  minOrder: fromMinor(promo?.min_order_cents),
  maxUses: promo?.max_uses || "",
  startsAt: toDateTimeLocal(promo?.starts_at),
  expiresAt: toDateTimeLocal(promo?.expires_at),
  isActive: promo?.is_active ?? true,
});

const SELLER_FILTERS = [
  { id: "all", label: "All" },
  { id: "with_products", label: "With Products" },
  { id: "without_products", label: "No Products" },
  { id: "suspended", label: "Suspended" },
];

const SUPPORT_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "pending", label: "Pending" },
  { id: "resolved", label: "Resolved" },
  { id: "escalated", label: "Escalated" },
  { id: "high_priority", label: "High Priority" },
];

const PRODUCT_PAGE_SIZE = 75;

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

const formatMoney = (minor = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(minor || 0) / 100);

const formatCompactMoney = (minor = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(minor || 0) / 100);

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value)) : "-";

const formatSalesChartLabel = (value, range) => {
  if (!value) return "-";
  const date = new Date(value);
  if (range === "weeks") return `Week of ${formatDate(value)}`;
  if (range === "months") {
    return new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" }).format(date);
  }
  if (range === "years") return String(date.getFullYear());
  return formatDate(value);
};

const titleCase = (value = "") =>
  value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

const getAdminProductStatus = (product) =>
  product.moderation_status === "pending" || product.moderation_status === "rejected"
    ? product.moderation_status
    : Number(product.stock || 0) <= 0
    ? "out_of_stock"
    : product.status || (!product.is_active ? "inactive" : "active");

const PRODUCT_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending Review" },
  { id: "rejected", label: "Rejected" },
  { id: "out_of_stock", label: "Out Of Stock" },
  { id: "inactive", label: "Inactive" },
  { id: "no_views", label: "No Views" },
  { id: "has_views", label: "Has Views" },
];

const matchesAdminSellerFilter = (seller, filter) => {
  if (filter === "all") return true;
  if (filter === "with_products") return Number(seller.products || 0) > 0;
  if (filter === "without_products") return Number(seller.products || 0) === 0;
  return seller.status === filter;
};

const matchesSupportFilter = (ticket, filter) => {
  if (filter === "all") return true;
  if (filter === "escalated") return ticket.is_escalated;
  if (filter === "high_priority") return ticket.priority === "high";
  return ticket.status === filter;
};

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

function Btn({ children, disabled, icon: Icon, iconSpin=false, onClick, type="button", variant="ghost" }) {
  const [hovered, hoverProps] = useHover();
  const variants = {
    ghost: [C.txt2, "transparent", C.border],
    success: [C.green, `${C.green}18`, `${C.green}44`],
    danger: [C.red, `${C.red}18`, `${C.red}44`],
    cyan: [C.cyan, `${C.cyan}18`, `${C.cyan}44`],
    purple: [C.purple, `${C.purple}18`, `${C.purple}44`],
  };
  const [color, background, border] = variants[variant] || variants.ghost;
  const isHovered = hovered && !disabled;
  return (
    <button {...hoverProps} type={type} disabled={disabled} onClick={onClick} style={{display:'inline-flex',alignItems:'center',
      gap:5,padding:'5px 10px',borderRadius:8,fontSize:11,fontWeight:700,
      color:disabled?C.txt3:color,background:isHovered?`${color}24`:background,
      border:`1px solid ${isHovered?`${color}88`:border}`,
      cursor:disabled?'not-allowed':'pointer',opacity:disabled?.6:1,
      transform:isHovered?'translateY(-2px) scale(1.035)':'none',
      boxShadow:isHovered?`0 8px 18px ${color}22`:'none',
      transition:'transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease'}}>
      {Icon && <Icon size={11} style={iconSpin?{animation:'spin .7s linear infinite'}:undefined}/>}
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

function Table({ columns, rows, emptyMessage, virtualize=false }) {
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 54;
  const viewportHeight = 560;
  const overscan = 6;
  const startIndex = virtualize ? Math.max(0, Math.floor(scrollTop / rowHeight) - overscan) : 0;
  const visibleCount = virtualize ? Math.ceil(viewportHeight / rowHeight) + overscan * 2 : rows.length;
  const visibleRows = virtualize ? rows.slice(startIndex, startIndex + visibleCount) : rows;
  const leadingHeight = startIndex * rowHeight;
  const trailingHeight = Math.max(0, (rows.length - startIndex - visibleRows.length) * rowHeight);

  return (
    <div className="admin-table-scroll" onScroll={virtualize?(event)=>setScrollTop(event.currentTarget.scrollTop):undefined}
      style={{overflowX:'auto',overflowY:virtualize?'auto':undefined,maxHeight:virtualize?viewportHeight:undefined}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${C.border}`}}>{columns.map((column) => (
            <th key={column} style={{padding:'11px 13px',textAlign:'left',fontSize:10,
              textTransform:'uppercase',letterSpacing:'.08em',color:C.txt3,
              background:`${C.surface}88`,whiteSpace:'nowrap'}}>{column}</th>
          ))}</tr>
        </thead>
        <tbody>
          {leadingHeight > 0 && <tr aria-hidden="true"><td colSpan={columns.length} style={{height:leadingHeight,padding:0}}/></tr>}
          {rows.length ? visibleRows : (
            <tr>
              <td colSpan={columns.length} style={{padding:'2rem',textAlign:'center',color:C.txt3,fontSize:13}}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {trailingHeight > 0 && <tr aria-hidden="true"><td colSpan={columns.length} style={{height:trailingHeight,padding:0}}/></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AdminModal({ children, onClose, title }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{position:'fixed',inset:0,zIndex:1200,
      display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'#000000BB'}}>
      <button type="button" aria-label="Close modal" onClick={onClose}
        style={{position:'absolute',inset:0,border:0,background:'transparent',cursor:'pointer'}}/>
      <section style={{position:'relative',width:'min(900px,100%)',maxHeight:'min(760px,calc(100dvh - 2rem))',
        overflow:'auto',background:C.card,border:`1px solid ${C.borderHov}`,borderRadius:16,
        boxShadow:'0 28px 90px #000000DD'}}>
        <header style={{position:'sticky',top:0,zIndex:1,display:'flex',alignItems:'center',
          justifyContent:'space-between',gap:12,padding:'1rem 1.2rem',background:C.card,borderBottom:`1px solid ${C.border}`}}>
          <strong style={{fontSize:15,color:C.txt}}>{title}</strong>
          <Btn icon={X} onClick={onClose}>Close</Btn>
        </header>
        {children}
      </section>
    </div>
  );
}

const inputStyle = {width:'100%',padding:'10px 12px',borderRadius:9,border:`1px solid ${C.border}`,
  background:C.surface,color:C.txt,fontSize:12};

function Field({ children, label }) {
  return (
    <label style={{display:'flex',flexDirection:'column',gap:6,fontSize:11,color:C.txt3}}>
      <span style={{fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</span>
      {children}
    </label>
  );
}

function SearchInput({ onChange, placeholder, value }) {
  return (
    <label style={{position:'relative',display:'block',minWidth:220,flex:'1 1 260px'}}>
      <Search size={14} color={C.txt3} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}}/>
      <input value={value} onChange={onChange} placeholder={placeholder}
        style={{...inputStyle,paddingLeft:34}}/>
    </label>
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

function PageActivityMetric({ label, metric, valueKey, valueLabel }) {
  const value = Number(metric?.[valueKey] || 0);
  return (
    <div style={{padding:'1rem',border:`1px solid ${C.border}`,borderRadius:12,background:`${C.surface}88`}}>
      <div style={{fontSize:11,color:C.txt3,textTransform:'uppercase',letterSpacing:'.06em'}}>{label}</div>
      <strong style={{display:'block',marginTop:8,fontSize:14,color:C.txt,overflowWrap:'anywhere'}}>
        {metric?.path || "No tracked page yet"}
      </strong>
      <div style={{marginTop:7,fontSize:12,color:C.cyan,fontFamily:"'JetBrains Mono',monospace"}}>
        {value.toLocaleString()} {valueLabel}
      </div>
    </div>
  );
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
      <div style={{fontSize:10,color:C.txt3,marginTop:8}}>Share of category merchandise sales</div>
    </div>
  );
}

function DashboardModule({ data }) {
  const [salesChartRange, setSalesChartRange] = useState("days");
  const salesChartQuery = useAdminPaidSalesChart(salesChartRange);
  const stats = data.stats || {};
  const categories = data.categories || [];
  const salesChartPayload = salesChartQuery.data?.series ??
    (salesChartRange === "days" ? data.salesChart : []);
  const salesChart = Array.isArray(salesChartPayload) ? salesChartPayload.filter(Boolean) : [];
  const salesChartMeta = salesChartQuery.data?.meta || {};
  const hasSalesChartInformation = salesChart.some((item) =>
    Number(item.revenueMinor || 0) > 0 || Number(item.orders || 0) > 0);
  const chartRevenueMinor = salesChart.reduce((total, item) => total + Number(item.revenueMinor || 0), 0);
  const chartOrders = salesChart.reduce((total, item) => total + Number(item.orders || 0), 0);
  const chartPeriod = salesChartMeta.startDate && salesChartMeta.endDate
    ? `${formatDate(salesChartMeta.startDate)} - ${formatDate(salesChartMeta.endDate)}`
    : "Loading paid-sales period";
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
            {` - ${stats.pendingOrders || 0} pending orders worth ${formatMoney(stats.pendingUnpaidValueMinor)}, ${stats.openTickets || 0} open support tickets, and ${stats.products || 0} catalog products.`}
          </span>
        </div>
      </div>
      <Stats>
        <Stat icon={DollarSign} label="Paid Revenue" value={formatMoney(stats.revenueMinor)} color={C.green}/>
        <Stat icon={ShoppingCart} label="Total Orders" value={stats.orders || 0}/>
        <Stat icon={Users} label="Users" value={stats.users || 0} color={C.cyan}/>
        <Stat icon={Package} label="Products" value={stats.products || 0} color={C.purple}/>
        <Stat icon={Clock} label="Pending Orders" value={stats.pendingOrders || 0} color={C.amber}/>
        <Stat icon={Clock} label="Pending Unpaid Value" value={formatMoney(stats.pendingUnpaidValueMinor)} color={C.amber}/>
        <Stat icon={LifeBuoy} label="Open Tickets" value={stats.openTickets || 0} color={C.red}/>
      </Stats>
      <div className="admin-grid-overview" style={{display:'grid',gridTemplateColumns:'minmax(0,5fr) minmax(260px,2fr)',gap:14}}>
        <Card title="Paid Revenue & Orders Overview" accent={C.blue}>
          <div className="admin-paid-chart-body" style={{padding:'1.25rem'}}>
            <div className="admin-chart-toolbar" style={{display:'flex',justifyContent:'space-between',
              alignItems:'flex-start',gap:14,marginBottom:16}}>
              <div>
                <div style={{display:'flex',alignItems:'baseline',gap:10,flexWrap:'wrap'}}>
                  <strong style={{fontSize:20,color:C.txt,fontFamily:"'JetBrains Mono',monospace"}}>
                    {formatMoney(chartRevenueMinor)}
                  </strong>
                  <span style={{fontSize:12,color:C.cyan}}>{chartOrders.toLocaleString()} paid orders</span>
                </div>
                <div style={{fontSize:11,color:C.txt3,marginTop:6}}>
                  {salesChartMeta.isHistorical ? `Latest recorded paid activity: ${chartPeriod}` : chartPeriod}
                  {salesChartQuery.isFetching ? " - updating" : ""}
                </div>
                {Number(salesChartMeta.legacyFallbackOrders || 0) > 0 && (
                  <div style={{fontSize:10,color:C.amber,marginTop:6,lineHeight:1.5}}>
                    {`${Number(salesChartMeta.legacyFallbackOrders).toLocaleString()} legacy paid orders have no payment-settlement timestamp and are plotted by their recorded order date.`}
                  </div>
                )}
              </div>
              <div className="admin-chart-range" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {SALES_CHART_RANGES.map((range) => (
                  <Btn key={range.id} variant={salesChartRange===range.id?"cyan":"ghost"}
                    onClick={()=>setSalesChartRange(range.id)}>{range.label}</Btn>
                ))}
              </div>
            </div>
            {salesChartQuery.isError || (!salesChartQuery.isFetching && !hasSalesChartInformation) ? (
              <PanelMessage>No available information</PanelMessage>
            ) : !hasSalesChartInformation ? (
              <PanelMessage>Loading available information...</PanelMessage>
            ) : (
              <div className="admin-chart-frame" style={{width:'100%',height:300,minWidth:0}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChart} margin={{top:4,right:2,bottom:0,left:0}}>
                    <defs>
                      <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.blue} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={`${C.border}AA`} strokeDasharray="3 4"/>
                    <XAxis dataKey="label" minTickGap={18} interval="preserveStartEnd"
                      tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="revenue" width={68} tickFormatter={formatCompactMoney}
                      tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="orders" orientation="right" width={38}
                      tick={{fontSize:10,fill:C.cyan}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}}
                      labelStyle={{color:C.txt}} labelFormatter={(_label, entries) =>
                        formatSalesChartLabel(entries?.[0]?.payload?.date, salesChartRange)}
                      formatter={(value,name)=>[
                        name === "Paid Revenue" ? formatMoney(value) : Number(value).toLocaleString(),
                        name,
                      ]}/>
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:11,color:C.txt2,paddingTop:8}}/>
                    <Area yAxisId="revenue" type="monotone" dataKey="revenueMinor" name="Paid Revenue"
                      stroke={C.blue} strokeWidth={2.5} fill="url(#adminRevenue)" dot={false}/>
                    <Area yAxisId="orders" type="monotone" dataKey="orders" name="Paid Orders"
                      stroke={C.cyan} strokeWidth={2} fill="transparent" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
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
      {!categories.length && <PanelMessage>No paid category merchandise sales are available yet.</PanelMessage>}
    </div>
  );
}

function OrdersModule({ data, mutation, toast }) {
  const [filter, setFilter] = useState("all");
  const inFlightOrderIds = useRef(new Set());
  const orders = data.orders || [];
  const filtered = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  const pendingUpdates = new Map(
    (mutation.pendingUpdates || []).filter(Boolean).map((pendingUpdate) => [pendingUpdate.id, pendingUpdate]),
  );
  const update = async (id, status) => {
    if (inFlightOrderIds.current.has(id)) return;
    inFlightOrderIds.current.add(id);

    try {
      await mutation.mutateAsync({ id, status });
      toast("Order status updated", C.green);
    } catch (error) {
      toast(error.message, C.red);
    } finally {
      inFlightOrderIds.current.delete(id);
    }
  };
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
          rows={filtered.map((order) => {
            const pendingUpdate = pendingUpdates.get(order.id);
            const isUpdating = Boolean(pendingUpdate);
            return (
              <tr key={order.id}>
                <Td>{order.id.slice(0,8)}</Td><Td>{order.customer}</Td><Td>{order.products}</Td><Td>{order.sellers}</Td>
                <Td><Badge type={order.status}/></Td><Td><Badge type={order.payment}/></Td>
                <Td>{formatMoney(order.amount_minor)}</Td><Td>{formatDate(order.created_at)}</Td>
                <Td><div style={{display:'flex',gap:5}}>
                  {order.status==="pending" && <Btn disabled={isUpdating} icon={Truck} variant="success"
                    onClick={()=>update(order.id,"shipped")}>{pendingUpdate?.status==="shipped"?"Shipping...":"Ship"}</Btn>}
                  {!["cancelled","delivered"].includes(order.status) && <Btn disabled={isUpdating} icon={X} variant="danger"
                    onClick={()=>update(order.id,"cancelled")}>{isUpdating?"Updating...":"Cancel"}</Btn>}
                </div></Td>
              </tr>
            );
          })}/>
      </Card>
    </div>
  );
}

function ProductsModule({ moderationMutation, mutation, toast }) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const inFlightProductIds = useRef(new Set());
  const productsQuery = useAdminProducts({
    filter,
    page,
    pageSize: PRODUCT_PAGE_SIZE,
    search,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  if (productsQuery.isLoading) return <ModuleLoader/>;
  if (productsQuery.isError) return <PanelMessage>{productsQuery.error.message}</PanelMessage>;

  const products = asArray(productsQuery.data?.items);
  const summary = productsQuery.data?.summary || {};
  const total = Number(productsQuery.data?.total || 0);
  const pageCount = Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE));
  const pendingUpdates = new Map(
    (mutation.pendingUpdates || []).filter(Boolean).map((pendingUpdate) => [pendingUpdate.id, pendingUpdate]),
  );
  const pendingModerationUpdates = new Map(
    (moderationMutation.pendingUpdates || []).filter(Boolean).map((pendingUpdate) => [pendingUpdate.id, pendingUpdate]),
  );
  const update = async (id, active) => {
    if (inFlightProductIds.current.has(id)) return;
    inFlightProductIds.current.add(id);

    try {
      await mutation.mutateAsync({ id, active });
      toast("Product visibility updated", C.green);
    } catch (error) {
      toast(error.message, C.red);
    } finally {
      inFlightProductIds.current.delete(id);
    }
  };
  const moderate = async (id, status) => {
    if (inFlightProductIds.current.has(id)) return;
    inFlightProductIds.current.add(id);

    try {
      await moderationMutation.mutateAsync({ id, status });
      toast(`Product ${status}`, status === "approved" ? C.green : C.amber);
    } catch (error) {
      toast(error.message, C.red);
    } finally {
      inFlightProductIds.current.delete(id);
    }
  };
  const changeFilter = (nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Package} label="Products" value={Number(summary.all || 0)}/>
        <Stat icon={CheckCircle2} label="Active" value={Number(summary.active || 0)} color={C.green}/>
        <Stat icon={Clock} label="Pending Review" value={Number(summary.pending || 0)} color={C.amber}/>
        <Stat icon={XCircle} label="Out Of Stock" value={Number(summary.out_of_stock || 0)} color={C.red}/>
      </Stats>
      <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
        <SearchInput value={searchInput} onChange={(event)=>setSearchInput(event.target.value)}
          placeholder="Search products, categories, or sellers..."/>
        {PRODUCT_FILTERS.map(({ id, label }) => (
          <Btn key={id} variant={filter===id?"cyan":"ghost"} onClick={()=>changeFilter(id)}>{label}</Btn>
        ))}
      </div>
      <Card title={`Products (${total.toLocaleString()})`} actions={
        <span style={{fontSize:11,color:C.txt3}}>Page {page} of {pageCount}</span>
      }>
        <Table columns={["Product","Category","Seller","Price","Stock","Views","Date Created","Date Updated","Status","Actions"]}
          emptyMessage="No products match this filter." virtualize
          rows={products.map((product) => {
            const pendingUpdate = pendingUpdates.get(product.id) || pendingModerationUpdates.get(product.id);
            const isUpdating = Boolean(pendingUpdate) || inFlightProductIds.current.has(product.id);
            const productStatus = getAdminProductStatus(product);
            const hasSellableStock = Number(product.stock || 0) > 0;
            return (
              <tr key={product.id}>
                <Td>{product.name}</Td><Td>{product.category}</Td><Td>{product.seller}</Td>
                <Td>{formatMoney(product.price_minor)}</Td><Td>{product.stock}</Td><Td>{product.views}</Td>
                <Td>{formatDate(product.created_at)}</Td><Td>{formatDate(product.updated_at)}</Td>
                <Td><Badge type={productStatus}/></Td>
                <Td><div style={{display:'flex',gap:5}}>
                  {product.moderation_status==="pending" && <>
                    <Btn disabled={isUpdating} icon={isUpdating?Loader2:Check} iconSpin={isUpdating} variant="success"
                      onClick={()=>moderate(product.id,"approved")}>{isUpdating?"Saving...":"Approve"}</Btn>
                    <Btn disabled={isUpdating} icon={X} variant="danger"
                      onClick={()=>moderate(product.id,"rejected")}>Reject</Btn>
                  </>}
                  {product.moderation_status==="rejected" &&
                    <Btn disabled={isUpdating} icon={isUpdating?Loader2:Check} iconSpin={isUpdating} variant="success"
                      onClick={()=>moderate(product.id,"approved")}>{isUpdating?"Saving...":"Approve"}</Btn>}
                  {product.moderation_status==="approved" && (product.is_active
                  ? <Btn disabled={isUpdating} icon={isUpdating?Loader2:X} iconSpin={isUpdating} variant="danger"
                    onClick={()=>update(product.id,false)}>{isUpdating?"Deactivating...":"Deactivate"}</Btn>
                  : !hasSellableStock
                    ? <Btn disabled icon={XCircle}>Restock required</Btn>
                  : <Btn disabled={isUpdating} icon={isUpdating?Loader2:Check} iconSpin={isUpdating} variant="success"
                    onClick={()=>update(product.id,true)}>{isUpdating?"Activating...":"Activate"}</Btn>)}
                </div></Td>
              </tr>
            );
          })}/>
      </Card>
      <div style={{display:'flex',justifyContent:'flex-end',gap:7}}>
        <Btn disabled={page<=1 || productsQuery.isFetching} icon={ChevronLeft} onClick={()=>setPage((current)=>Math.max(1,current-1))}>Previous</Btn>
        <Btn disabled={page>=pageCount || productsQuery.isFetching} icon={ChevronRight} onClick={()=>setPage((current)=>Math.min(pageCount,current+1))}>Next</Btn>
      </div>
    </div>
  );
}

function UsersModule({ buyersQuery, canManageDeactivatedAccounts, data, deactivatedBuyersQuery, deleteBuyerMutation, reviewBuyerMutation, toast }) {
  const [tab, setTab] = useState("buyers");
  if (buyersQuery.isLoading || deactivatedBuyersQuery.isLoading) return <ModuleLoader/>;
  if (buyersQuery.isError) return <PanelMessage>{buyersQuery.error.message}</PanelMessage>;
  if (deactivatedBuyersQuery.isError) return <PanelMessage>{deactivatedBuyersQuery.error.message}</PanelMessage>;

  const buyers = asArray(buyersQuery.data);
  const sellers = asArray(data.sellers);
  const deactivatedBuyers = asArray(deactivatedBuyersQuery.data);
  const records = tab === "buyers" ? buyers : tab === "sellers" ? sellers : deactivatedBuyers;
  const review = async (id, approve) => {
    try {
      await reviewBuyerMutation.mutateAsync({ id, approve });
      toast(approve ? "Buyer account reactivated" : "Reactivation request rejected", approve ? C.green : C.amber);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const permanentlyDelete = async (id) => {
    if (!window.confirm("Permanently delete this inactive buyer account and its retained personal data? This cannot be undone.")) return;
    try {
      await deleteBuyerMutation.mutateAsync(id);
      toast("Buyer account permanently deleted", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Users} label="Buyers" value={buyers.length}/>
        <Stat icon={Store} label="Sellers" value={sellers.length} color={C.purple}/>
        <Stat icon={AlertTriangle} label="Deactivated Buyers" value={deactivatedBuyers.length} color={C.red}/>
      </Stats>
      <div style={{display:'flex',gap:7}}>
        {["buyers","sellers","deactivated_buyers"].map((name) => <Btn key={name} variant={tab===name?"cyan":"ghost"} onClick={()=>setTab(name)}>{titleCase(name)}</Btn>)}
      </div>
      <Card title={titleCase(tab)}>
        {tab === "buyers" ? (
          <Table columns={["Name","Email","Paid Orders","Paid Lifetime Value","Joined"]} emptyMessage="No buyers found in the backend."
            rows={records.map((buyer) => <tr key={buyer.id}><Td>{buyer.name}</Td><Td>{buyer.email}</Td>
              <Td>{buyer.orders}</Td><Td>{formatMoney(buyer.lifetime_value_minor)}</Td><Td>{formatDate(buyer.created_at)}</Td></tr>)}/>
        ) : tab === "sellers" ? (
          <Table columns={["Store","Status","Merchandise Sales","Products","Paid Orders","Joined"]} emptyMessage="No sellers found in the backend."
            rows={records.map((seller) => <tr key={seller.id}><Td>{seller.name}</Td><Td><Badge type={seller.status}/></Td>
              <Td>{formatMoney(seller.revenue_minor)}</Td><Td>{seller.products}</Td><Td>{seller.orders}</Td><Td>{formatDate(seller.created_at)}</Td></tr>)}/>
        ) : (
          <Table columns={["Name","Email","Reason","Recovery Request","Deactivated","Actions"]} emptyMessage="No deactivated buyer accounts found."
            rows={records.map((buyer) => <tr key={buyer.id}><Td>{buyer.name}</Td><Td>{buyer.email}</Td>
              <Td><span style={{display:'block',maxWidth:240,whiteSpace:'normal'}}>{titleCase(buyer.reason_code)}{buyer.reason_detail ? `: ${buyer.reason_detail}` : ""}</span></Td>
              <Td><Badge type={buyer.reactivation_status}/></Td><Td>{formatDate(buyer.deactivated_at)}</Td>
              <Td><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                <Btn disabled={!canManageDeactivatedAccounts || reviewBuyerMutation.isPending} icon={RotateCcw} variant="success" onClick={()=>review(buyer.id,true)}>Restore</Btn>
                <Btn disabled={!canManageDeactivatedAccounts || reviewBuyerMutation.isPending} icon={XCircle} onClick={()=>review(buyer.id,false)}>Reject</Btn>
                <Btn disabled={!canManageDeactivatedAccounts || deleteBuyerMutation.isPending} icon={Trash2} variant="danger" onClick={()=>permanentlyDelete(buyer.id)}>Delete Permanently</Btn>
              </div></Td></tr>)}/>
        )}
      </Card>
      {!canManageDeactivatedAccounts && tab === "deactivated_buyers" && (
        <PanelMessage>Support leads can review deactivated accounts. Only super admins can restore, reject, or permanently delete them.</PanelMessage>
      )}
    </div>
  );
}

function SellersModule({ data, mutation, toast }) {
  const [filter, setFilter] = useState("all");
  const inFlightSellerIds = useRef(new Set());
  const sellers = asArray(data.sellers);
  const filteredSellers = sellers.filter((seller) => matchesAdminSellerFilter(seller, filter));
  const pendingUpdates = new Map(
    (mutation.pendingUpdates || []).filter(Boolean).map((pendingUpdate) => [pendingUpdate.id, pendingUpdate]),
  );
  const update = async (id, status) => {
    if (inFlightSellerIds.current.has(id)) return;
    inFlightSellerIds.current.add(id);

    try {
      await mutation.mutateAsync({ id, status });
      toast("Seller status updated", C.green);
    } catch (error) {
      toast(error.message, C.red);
    } finally {
      inFlightSellerIds.current.delete(id);
    }
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Store} label="Sellers" value={sellers.length}/>
        <Stat icon={CheckCircle2} label="Active" value={sellers.filter((seller)=>seller.status==="active").length} color={C.green}/>
        <Stat icon={Clock} label="Pending" value={sellers.filter((seller)=>seller.status==="pending").length} color={C.amber}/>
        <Stat icon={XCircle} label="Suspended" value={sellers.filter((seller)=>seller.status==="suspended").length} color={C.red}/>
      </Stats>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        {SELLER_FILTERS.map(({ id, label }) => (
          <Btn key={id} variant={filter===id?"cyan":"ghost"} onClick={()=>setFilter(id)}>{label}</Btn>
        ))}
      </div>
      <Card title={`Sellers (${filteredSellers.length})`}>
        <Table columns={["Store","Status","Merchandise Sales","Products","Paid Orders","Verified","Actions"]} emptyMessage="No sellers match this filter."
          rows={filteredSellers.map((seller) => {
            const pendingUpdate = pendingUpdates.get(seller.id);
            const isUpdating = Boolean(pendingUpdate);
            return <tr key={seller.id}>
              <Td>{seller.name}</Td><Td><Badge type={seller.status}/></Td><Td>{formatMoney(seller.revenue_minor)}</Td>
              <Td>{seller.products}</Td><Td>{seller.orders}</Td><Td>{seller.verified?"Yes":"No"}</Td>
              <Td><div style={{display:'flex',gap:5}}>
                {seller.status!=="active" && <Btn disabled={isUpdating} icon={isUpdating?Loader2:Check} iconSpin={isUpdating}
                  variant="success" onClick={()=>update(seller.id,"active")}>
                  {pendingUpdate?.status==="active"?"Activating...":"Activate"}
                </Btn>}
                {seller.status!=="suspended" && <Btn disabled={isUpdating} icon={isUpdating?Loader2:X} iconSpin={isUpdating}
                  variant="danger" onClick={()=>update(seller.id,"suspended")}>
                  {pendingUpdate?.status==="suspended"?"Suspending...":"Suspend"}
                </Btn>}
                {seller.status==="suspended" && <Btn disabled={isUpdating} icon={isUpdating?Loader2:RotateCcw} iconSpin={isUpdating}
                  variant="cyan" onClick={()=>update(seller.id,"pending")}>
                  {pendingUpdate?.status==="pending"?"Resetting...":"Reset"}
                </Btn>}
              </div></Td>
            </tr>;
          })}/>
      </Card>
    </div>
  );
}

function AnalyticsModule({ data }) {
  const [growthRange, setGrowthRange] = useState("months");
  const [pageActivityOpen, setPageActivityOpen] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  const growthQuery = useAdminUserGrowth(growthRange);
  const pageActivityQuery = useAdminPageActivity();
  const analytics = data.analytics && typeof data.analytics === "object" ? data.analytics : {};
  const funnel = asArray(analytics.funnel);
  const categories = asArray(data.categories);
  const pageActivity = pageActivityQuery.data && typeof pageActivityQuery.data === "object"
    ? pageActivityQuery.data
    : {};
  const pageRows = asArray(pageActivity.pages);
  const filteredPageRows = pageRows.filter((page) =>
    page.path?.toLowerCase().includes(pageSearch.trim().toLowerCase()));
  const palette = [C.blue,C.cyan,C.green,C.purple,C.amber];
  const maximum = Math.max(...funnel.map((item)=>Number(item.value || 0)), 1);
  const growthPayload = asArray(growthQuery.data);
  const growthRecords = growthPayload.length > 0
    ? growthPayload
    : growthRange === "months" ? asArray(analytics.userGrowth) : [];
  const growth = growthRecords.map((item) => ({
    ...item,
    label: item.label || ((item.month || item.date)
      ? new Intl.DateTimeFormat("en-NG", growthRange === "years"
        ? { year:"numeric" }
        : growthRange === "days"
          ? { month:"short", day:"numeric" }
          : { month:"short", year:"2-digit" }).format(new Date(item.month || item.date))
      : "-"),
  }));
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={DollarSign} label="Paid Revenue" value={formatMoney(data.stats?.revenueMinor)} color={C.green}/>
        <Stat icon={ShoppingCart} label="Total Orders" value={data.stats?.orders || 0}/>
        <Stat icon={Users} label="Registered Users" value={data.stats?.users || 0} color={C.cyan}/>
        <Stat icon={Package} label="Catalog Products" value={data.stats?.products || 0} color={C.purple}/>
      </Stats>
      <Card title="Page Activity" accent={C.cyan} actions={
        <Btn icon={Eye} onClick={()=>setPageActivityOpen(true)}>View All Pages</Btn>
      }>
        <div style={{padding:'1.25rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:10}}>
          {pageActivityQuery.isError ? <PanelMessage>{pageActivityQuery.error.message}</PanelMessage> : (
            <>
              <PageActivityMetric label="Most Visited Page" metric={pageActivity.mostVisitedPage}
                valueKey="visits" valueLabel="visits"/>
              <PageActivityMetric label="Highest Activity Page" metric={pageActivity.highestActivityPage}
                valueKey="events" valueLabel="events"/>
              <PageActivityMetric label="Lowest Activity Page" metric={pageActivity.lowestActivityPage}
                valueKey="events" valueLabel="events"/>
            </>
          )}
        </div>
      </Card>
      <div className="admin-grid-overview" style={{display:'grid',gridTemplateColumns:'minmax(0,5fr) minmax(240px,2fr)',gap:14}}>
        <Card title="User Growth Trend" accent={C.blue} actions={
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {USER_GROWTH_RANGES.map(({ id, label }) => (
              <Btn key={id} variant={growthRange===id?"cyan":"ghost"} onClick={()=>setGrowthRange(id)}>{label}</Btn>
            ))}
          </div>
        }>
          <div style={{padding:'1.25rem'}}>
            {growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={growth} margin={{top:8,right:8,bottom:0,left:-18}}>
                  <XAxis dataKey="label" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:C.txt3}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}}
                    labelStyle={{color:C.txt}}/>
                  <Line type="monotone" dataKey="buyers" stroke={C.blue} strokeWidth={2.5} dot={false} name="Buyers"/>
                  <Line type="monotone" dataKey="sellers" stroke={C.cyan} strokeWidth={2} dot={false} name="Sellers"/>
                </LineChart>
              </ResponsiveContainer>
            ) : growthQuery.isError
              ? <PanelMessage>{growthQuery.error.message}</PanelMessage>
              : growthQuery.isLoading
                ? <PanelMessage>Loading user-growth records...</PanelMessage>
                : <PanelMessage>No user-growth records are available yet.</PanelMessage>}
          </div>
        </Card>
        <Card title="Merchandise Category Share" accent={C.purple}>
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
            ) : <PanelMessage>No paid category merchandise sales are available yet.</PanelMessage>}
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
        <Card title="Category Merchandise Sales" accent={C.amber}>
          <div style={{padding:'1.25rem'}}>
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categories} margin={{top:18,right:18,bottom:8,left:36}}>
                  <XAxis dataKey="name" tick={{fontSize:11,fill:C.txt3}} axisLine={false} tickLine={false}/>
                  <YAxis
                    tick={{fontSize:10,fill:C.txt3}}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value)=>formatMoney(value)}
                    width={72}
                  />
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12}}
                    labelStyle={{color:C.txt}} formatter={(value)=>[formatMoney(value),"Merchandise Sales"]}/>
                  <Bar dataKey="revenue_minor" radius={[5,5,0,0]} fill={C.blue} name="Merchandise Sales"/>
                </BarChart>
              </ResponsiveContainer>
            ) : <PanelMessage>No paid category merchandise sales are available yet.</PanelMessage>}
          </div>
        </Card>
      </div>
      {pageActivityOpen && (
        <AdminModal title="All Page Activity" onClose={()=>{setPageActivityOpen(false);setPageSearch("");}}>
          <div style={{padding:'1rem 1.2rem',display:'flex',flexDirection:'column',gap:12}}>
            <SearchInput value={pageSearch} onChange={(event)=>setPageSearch(event.target.value)}
              placeholder="Filter pages by path..."/>
            <Table columns={["Page Path","Views","Activity Events"]}
              emptyMessage="No tracked pages match this search."
              rows={filteredPageRows.map((page) => <tr key={page.path}>
                <Td>{page.path}</Td><Td>{Number(page.visits || 0).toLocaleString()}</Td>
                <Td>{Number(page.events || 0).toLocaleString()}</Td>
              </tr>)}/>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

function SupportModule({ data, mutation, toast }) {
  const [filter, setFilter] = useState("all");
  const inFlightTicketIds = useRef(new Set());
  const tickets = asArray(data.supportTickets);
  const filteredTickets = tickets.filter((ticket) => matchesSupportFilter(ticket, filter));
  const pendingUpdates = new Map(
    (mutation.pendingUpdates || []).filter(Boolean).map((pendingUpdate) => [pendingUpdate.id, pendingUpdate]),
  );
  const update = async (id, status, escalate=false) => {
    if (inFlightTicketIds.current.has(id)) return;
    inFlightTicketIds.current.add(id);

    try {
      await mutation.mutateAsync({ id, status, escalate });
      toast("Support ticket updated", C.green);
    } catch (error) {
      toast(error.message, C.red);
    } finally {
      inFlightTicketIds.current.delete(id);
    }
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Ticket} label="Open tickets" value={tickets.filter((ticket)=>ticket.status!=="resolved").length} color={C.red}/>
        <Stat icon={AlertTriangle} label="High priority" value={tickets.filter((ticket)=>ticket.priority==="high").length} color={C.amber}/>
        <Stat icon={CheckCircle2} label="Resolved" value={tickets.filter((ticket)=>ticket.status==="resolved").length} color={C.green}/>
      </Stats>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        {SUPPORT_FILTERS.map(({ id, label }) => (
          <Btn key={id} variant={filter===id?"cyan":"ghost"} onClick={()=>setFilter(id)}>{label}</Btn>
        ))}
      </div>
      <Card title={`Support Tickets (${filteredTickets.length})`}>
        <Table columns={["Ticket","User","Subject","Category","Priority","Status","Created","Actions"]}
          emptyMessage="No support tickets match this filter."
          rows={filteredTickets.map((ticket) => {
            const isUpdating = pendingUpdates.has(ticket.id) || inFlightTicketIds.current.has(ticket.id);
            return <tr key={ticket.id}>
              <Td>{ticket.ticket_number}</Td><Td>{ticket.user_name}</Td><Td>{ticket.subject}</Td><Td>{ticket.category}</Td>
              <Td><Badge type={ticket.priority}/></Td><Td><Badge type={ticket.status}/></Td><Td>{formatDate(ticket.created_at)}</Td>
              <Td><div style={{display:'flex',gap:5}}>
                {ticket.status!=="resolved" && <Btn disabled={isUpdating} icon={isUpdating?Loader2:Check} iconSpin={isUpdating}
                  variant="success" onClick={()=>update(ticket.id,"resolved")}>{isUpdating?"Saving...":"Resolve"}</Btn>}
                {!ticket.is_escalated && <Btn disabled={isUpdating} icon={isUpdating?Loader2:AlertCircle} iconSpin={isUpdating}
                  variant="purple" onClick={()=>update(ticket.id,ticket.status,true)}>{isUpdating?"Saving...":"Escalate"}</Btn>}
              </div></Td>
            </tr>;
          })}/>
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

function HiringModule({ hiringQuery, jobMutation, jobStatusMutation, mutation, toast }) {
  const [candidateFilter, setCandidateFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [questionJob, setQuestionJob] = useState(null);
  const [questionEditor, setQuestionEditor] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [jobForm, setJobForm] = useState({
    id: null,
    title: "",
    department: "",
    location: "",
    employmentType: "full_time",
    openings: 1,
    summary: "",
    description: "",
    responsibilitiesText: "",
    requirementsText: "",
    isTechnical: false,
  });
  const questionMutation = useSaveAdminCareerQuestion();
  const deleteQuestionMutation = useDeleteAdminCareerQuestion();
  const documentMutation = useOpenAdminCareerDocument();
  if (hiringQuery.isLoading) return <ModuleLoader/>;
  if (hiringQuery.isError) return <PanelMessage>{hiringQuery.error.message}</PanelMessage>;

  const candidates = asArray(hiringQuery.data?.candidates);
  const jobs = asArray(hiringQuery.data?.jobs);
  const stages = asArray(hiringQuery.data?.stages);
  const talentPoolQuestionGroup = {
    id: null,
    questions: asArray(hiringQuery.data?.talentPoolQuestions),
    scope: "talent_pool",
    title: "Talent Pool",
  };
  const activeQuestionJob = questionJob?.scope === "talent_pool"
    ? talentPoolQuestionGroup
    : jobs.find((job)=>job.id===questionJob?.id) || questionJob;
  const filteredJobs = jobs.filter((job) => jobFilter === "all" || job.status === jobFilter);
  const visibleCandidates = candidates.filter((candidate) => candidateFilter === "all" || candidate.stage === candidateFilter);
  const openVacancies = jobs.filter((job) => job.status === "open")
    .reduce((total, job) => total + Number(job.openings || 0), 0);
  const move = (candidate, stage) => mutation.mutate({ id:candidate.id, stage }, {
    onSuccess: () => toast("Candidate stage updated", C.green),
    onError: (error) => toast(error.message, C.red),
  });
  const createJob = async (event) => {
    event.preventDefault();
    try {
      await jobMutation.mutateAsync({
        ...jobForm,
        responsibilities: jobForm.responsibilitiesText.split("\n").map((item)=>item.trim()).filter(Boolean),
        requirements: jobForm.requirementsText.split("\n").map((item)=>item.trim()).filter(Boolean),
      });
      setJobModalOpen(false);
      setJobForm({id:null,title:"",department:"",location:"",employmentType:"full_time",openings:1,summary:"",description:"",responsibilitiesText:"",requirementsText:"",isTechnical:false});
      toast(jobForm.id ? "Job opening updated" : "Job opening created", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const editJob = (job) => {
    setJobForm({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employment_type,
      openings: job.openings,
      summary: job.summary || "",
      description: job.description || "",
      responsibilitiesText: asArray(job.responsibilities).join("\n"),
      requirementsText: asArray(job.requirements).join("\n"),
      isTechnical: Boolean(job.is_technical),
    });
    setJobModalOpen(true);
  };
  const saveQuestion = async (event) => {
    event.preventDefault();
    try {
      await questionMutation.mutateAsync({
        ...questionEditor,
        jobId: activeQuestionJob.id,
        options: questionEditor.optionsText.split(",").map((option)=>option.trim()).filter(Boolean),
        scope: activeQuestionJob.scope || "role",
      });
      setQuestionEditor(null);
      toast("Application question saved", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const removeQuestion = (id) => {
    if (!window.confirm("Delete this application question?")) return;
    deleteQuestionMutation.mutate(id, {
      onSuccess:()=>toast("Application question deleted",C.green),
      onError:(error)=>toast(error.message,C.red),
    });
  };
  const openDocument = async (document) => {
    try {
      const url = await documentMutation.mutateAsync(document.id);
      const link = window.document.createElement("a");
      link.href = url;
      link.rel = "noopener noreferrer";
      link.target = "_blank";
      link.click();
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const updateJobStatus = (id, status) => jobStatusMutation.mutate({ id, status }, {
    onSuccess: () => toast("Job opening updated", C.green),
    onError: (error) => toast(error.message, C.red),
  });
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Stats>
        <Stat icon={Briefcase} label="Open Vacancies" value={openVacancies} color={C.green}/>
        <Stat icon={Users} label="Candidates" value={candidates.length} color={C.blue}/>
        <Stat icon={Clock} label="In Interviews" value={candidates.filter((candidate)=>candidate.stage==="interview").length} color={C.amber}/>
        <Stat icon={CheckCircle2} label="Hired" value={candidates.filter((candidate)=>candidate.stage==="hired").length} color={C.cyan}/>
      </Stats>
      <Card title="Vacancy Management" accent={C.green} actions={<>
        <Btn icon={Plus} onClick={()=>setQuestionJob({scope:"talent_pool"})}>Talent Pool Questions</Btn>
        <Btn icon={Plus} variant="success" onClick={()=>setJobModalOpen(true)}>Create Job</Btn>
      </>}>
        <div style={{padding:'1rem 1.2rem',display:'flex',gap:7,flexWrap:'wrap'}}>
          {["all","open","draft","closed"].map((status) => (
            <Btn key={status} variant={jobFilter===status?"cyan":"ghost"} onClick={()=>setJobFilter(status)}>{titleCase(status)}</Btn>
          ))}
        </div>
        <Table columns={["Role","Department","Location","Type","Vacancies","Status","Actions"]}
          emptyMessage="No job openings match this filter."
          rows={filteredJobs.map((job) => <tr key={job.id}>
            <Td>{job.title}</Td><Td>{job.department}</Td><Td>{job.location}</Td>
            <Td>{titleCase(job.employment_type)}</Td><Td>{job.openings}</Td><Td><Badge type={job.status}/></Td>
            <Td><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <Btn icon={Edit2} onClick={()=>editJob(job)}>Edit</Btn>
              <Btn icon={Plus} onClick={()=>setQuestionJob(job)}>Questions</Btn>
              {job.status==="open"
                ? <Btn disabled={jobStatusMutation.isPending} icon={X} variant="danger" onClick={()=>updateJobStatus(job.id,"closed")}>Close</Btn>
                : <Btn disabled={jobStatusMutation.isPending} icon={RotateCcw} variant="success" onClick={()=>updateJobStatus(job.id,"open")}>Reopen</Btn>}
            </div></Td>
          </tr>)}/>
      </Card>
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <Filter size={14} color={C.txt3}/>
        <span style={{fontSize:12,color:C.txt3}}>Candidate stage</span>
        <select value={candidateFilter} onChange={(event)=>setCandidateFilter(event.target.value)} style={{...inputStyle,width:'auto'}}>
          <option value="all">All stages</option>
          {stages.map((stage) => <option key={stage} value={stage}>{titleCase(stage)}</option>)}
        </select>
      </div>
      <div className="admin-hiring-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(185px,1fr))',gap:12}}>
        {stages.map((stage, index) => {
          const stageCandidates = visibleCandidates.filter((candidate)=>candidate.stage===stage);
          return <Card key={stage} title={`${titleCase(stage)} (${stageCandidates.length})`}>
            <div style={{padding:'.8rem',display:'flex',flexDirection:'column',gap:8}}>
              {stageCandidates.map((candidate) => <div key={candidate.id} style={{padding:'.8rem',borderRadius:9,
                background:C.surface,border:`1px solid ${C.border}`}}>
                <strong style={{fontSize:12,color:C.txt}}>{candidate.full_name}</strong>
                <div style={{fontSize:11,color:C.txt3,marginTop:4}}>{candidate.role_title}</div>
                <div style={{fontSize:11,color:STAGE_COLORS[stage],marginTop:6}}>Score: {candidate.score ?? "-"}</div>
                {candidate.application && <div style={{marginTop:8}}><Btn icon={Eye} onClick={()=>setSelectedCandidate(candidate)}>Review</Btn></div>}
                {index < stages.length - 1 && <div style={{marginTop:8}}><Btn icon={Briefcase} variant="cyan"
                  onClick={()=>move(candidate,stages[index+1])}>Move Forward</Btn></div>}
              </div>)}
              {!stageCandidates.length && <span style={{fontSize:11,color:C.txt3}}>No candidates.</span>}
            </div>
          </Card>;
        })}
      </div>
      {jobModalOpen && (
        <AdminModal title={jobForm.id?"Edit Job Opening":"Create Job Opening"} onClose={()=>setJobModalOpen(false)}>
          <form onSubmit={createJob} style={{padding:'1.2rem',display:'grid',gap:12}}>
            <Field label="Job Title"><input required value={jobForm.title} onChange={(event)=>setJobForm({...jobForm,title:event.target.value})} style={inputStyle}/></Field>
            <Field label="Department"><input required value={jobForm.department} onChange={(event)=>setJobForm({...jobForm,department:event.target.value})} style={inputStyle}/></Field>
            <Field label="Location"><input required value={jobForm.location} onChange={(event)=>setJobForm({...jobForm,location:event.target.value})} style={inputStyle}/></Field>
            <Field label="Employment Type"><select value={jobForm.employmentType} onChange={(event)=>setJobForm({...jobForm,employmentType:event.target.value})} style={inputStyle}>
              {["full_time","part_time","contract","internship"].map((type)=><option key={type} value={type}>{titleCase(type)}</option>)}
            </select></Field>
            <Field label="Vacancies"><input required min="1" type="number" value={jobForm.openings}
              onChange={(event)=>setJobForm({...jobForm,openings:event.target.value})} style={inputStyle}/></Field>
            <Field label="Summary"><textarea rows="2" value={jobForm.summary} onChange={(event)=>setJobForm({...jobForm,summary:event.target.value})} style={{...inputStyle,resize:"vertical"}}/></Field>
            <Field label="Description"><textarea rows="3" value={jobForm.description} onChange={(event)=>setJobForm({...jobForm,description:event.target.value})} style={{...inputStyle,resize:"vertical"}}/></Field>
            <Field label="Responsibilities (one per line)"><textarea rows="4" value={jobForm.responsibilitiesText} onChange={(event)=>setJobForm({...jobForm,responsibilitiesText:event.target.value})} style={{...inputStyle,resize:"vertical"}}/></Field>
            <Field label="Requirements (one per line)"><textarea rows="4" value={jobForm.requirementsText} onChange={(event)=>setJobForm({...jobForm,requirementsText:event.target.value})} style={{...inputStyle,resize:"vertical"}}/></Field>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.txt2}}><input checked={jobForm.isTechnical} onChange={(event)=>setJobForm({...jobForm,isTechnical:event.target.checked})} type="checkbox"/> Require a live-project URL for this technical role</label>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <Btn onClick={()=>setJobModalOpen(false)}>Cancel</Btn>
              <Btn type="submit" disabled={jobMutation.isPending} icon={jobMutation.isPending?Loader2:Plus} iconSpin={jobMutation.isPending}
                variant="success">{jobMutation.isPending?"Saving...":"Save Job"}</Btn>
            </div>
          </form>
        </AdminModal>
      )}
      {activeQuestionJob && !questionEditor && (
        <AdminModal title={`Questions · ${activeQuestionJob.title}`} onClose={()=>{setQuestionJob(null);setQuestionEditor(null);}}>
          <div style={{padding:"1.2rem",display:"grid",gap:10}}>
            <PanelMessage>
              {activeQuestionJob.scope==="talent_pool"
                ? "The talent pool is always available, even when no vacancies are open. Manage its focused questions here. Dropdown options are comma-separated."
                : "Core questions are shared across all applications. Add role-specific questions here. Dropdown options are comma-separated."}
            </PanelMessage>
            {asArray(activeQuestionJob.questions).map((question)=><div key={question.id} style={{padding:10,borderRadius:9,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",gap:8}}>
              <div><strong style={{fontSize:12,color:C.txt}}>{question.label}</strong><div style={{fontSize:11,color:C.txt3,marginTop:3}}>{titleCase(question.field_type)} · {question.is_required?"Required":"Optional"}</div></div>
              <div style={{display:"flex",gap:5}}><Btn icon={Edit2} onClick={()=>setQuestionEditor({id:question.id,key:question.field_key,label:question.label,type:question.field_type,placeholder:question.placeholder||"",optionsText:asArray(question.options).join(", "),required:Boolean(question.is_required),position:question.position||0})}>Edit</Btn><Btn disabled={deleteQuestionMutation.isPending} icon={Trash2} variant="danger" onClick={()=>removeQuestion(question.id)}>Delete</Btn></div>
            </div>)}
            {!asArray(activeQuestionJob.questions).length && <PanelMessage>No {activeQuestionJob.scope==="talent_pool"?"talent-pool":"role-specific"} questions configured.</PanelMessage>}
            <Btn icon={Plus} variant="success" onClick={()=>setQuestionEditor({id:null,key:"",label:"",type:"text",placeholder:"",optionsText:"",required:false,position:0})}>Add Question</Btn>
          </div>
        </AdminModal>
      )}
      {questionEditor && activeQuestionJob && (
        <AdminModal title={questionEditor.id?"Edit Application Question":"Add Application Question"} onClose={()=>setQuestionEditor(null)}>
          <form onSubmit={saveQuestion} style={{padding:"1.2rem",display:"grid",gap:12}}>
            <Field label="Stable key"><input required value={questionEditor.key} onChange={(event)=>setQuestionEditor({...questionEditor,key:event.target.value.replace(/[^a-z0-9_]/gi,"_").toLowerCase()})} style={inputStyle}/></Field>
            <Field label="Question"><input required value={questionEditor.label} onChange={(event)=>setQuestionEditor({...questionEditor,label:event.target.value})} style={inputStyle}/></Field>
            <Field label="Answer type"><select value={questionEditor.type} onChange={(event)=>setQuestionEditor({...questionEditor,type:event.target.value})} style={inputStyle}>{["text","textarea","url","select","checkbox"].map((type)=><option key={type} value={type}>{titleCase(type)}</option>)}</select></Field>
            <Field label="Placeholder"><input value={questionEditor.placeholder} onChange={(event)=>setQuestionEditor({...questionEditor,placeholder:event.target.value})} style={inputStyle}/></Field>
            {questionEditor.type==="select" && <Field label="Dropdown options"><input required value={questionEditor.optionsText} onChange={(event)=>setQuestionEditor({...questionEditor,optionsText:event.target.value})} placeholder="Option one, Option two" style={inputStyle}/></Field>}
            <Field label="Position"><input min="0" type="number" value={questionEditor.position} onChange={(event)=>setQuestionEditor({...questionEditor,position:event.target.value})} style={inputStyle}/></Field>
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.txt2}}><input checked={questionEditor.required} onChange={(event)=>setQuestionEditor({...questionEditor,required:event.target.checked})} type="checkbox"/> Required question</label>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}><Btn onClick={()=>setQuestionEditor(null)}>Cancel</Btn><Btn disabled={questionMutation.isPending} icon={questionMutation.isPending?Loader2:Check} iconSpin={questionMutation.isPending} type="submit" variant="success">{questionMutation.isPending?"Saving...":"Save Question"}</Btn></div>
          </form>
        </AdminModal>
      )}
      {selectedCandidate && (
        <AdminModal title={`Application · ${selectedCandidate.full_name}`} onClose={()=>setSelectedCandidate(null)}>
          <div style={{padding:"1.2rem",display:"grid",gap:12}}>
            <PanelMessage>{selectedCandidate.role_title} · submitted {formatDate(selectedCandidate.application.created_at)}</PanelMessage>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
              <Field label="Email"><span style={{fontSize:12,color:C.txt}}>{selectedCandidate.application.email}</span></Field>
              <Field label="Phone"><span style={{fontSize:12,color:C.txt}}>{selectedCandidate.application.phone||"-"}</span></Field>
              <Field label="Location"><span style={{fontSize:12,color:C.txt}}>{selectedCandidate.application.location}</span></Field>
            </div>
            {[["LinkedIn",selectedCandidate.application.linkedin_url],["Portfolio",selectedCandidate.application.portfolio_url],["Live project",selectedCandidate.application.live_project_url]].filter(([,url])=>url).map(([label,url])=><a href={url} key={label} rel="noreferrer" style={{fontSize:12,color:C.blue}} target="_blank">{label}: {url}</a>)}
            <Card title="Answers">{Object.entries(selectedCandidate.application.answers||{}).map(([key,value])=><div key={key} style={{padding:"8px 12px",borderBottom:`1px solid ${C.border}`}}><strong style={{display:"block",fontSize:11,color:C.txt3}}>{titleCase(key)}</strong><span style={{fontSize:12,color:C.txt}}>{String(value)}</span></div>)}</Card>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{asArray(selectedCandidate.application.documents).map((document)=><Btn disabled={documentMutation.isPending} icon={Eye} key={document.id} onClick={()=>openDocument(document)}>{document.document_type==="cv"?"Open CV":"Open Cover Letter"}</Btn>)}</div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

function SettingsModule({ data, deleteIntegrationMutation, deleteSettingMutation, integrationMutation, settingMutation, toast }) {
  const [integrationEditor, setIntegrationEditor] = useState(null);
  const [settingEditor, setSettingEditor] = useState(null);
  const saveIntegration = async (event) => {
    event.preventDefault();
    try {
      await integrationMutation.mutateAsync(integrationEditor);
      setIntegrationEditor(null);
      toast("Platform integration saved", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const saveSetting = async (event) => {
    event.preventDefault();
    try {
      await settingMutation.mutateAsync({...settingEditor,value:JSON.parse(settingEditor.value)});
      setSettingEditor(null);
      toast("Platform setting saved", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const removeIntegration = (id) => {
    if (!window.confirm("Delete this platform integration?")) return;
    deleteIntegrationMutation.mutate(id, {
      onSuccess:()=>toast("Platform integration deleted",C.green),
      onError:(error)=>toast(error.message,C.red),
    });
  };
  const removeSetting = (key) => {
    if (!window.confirm(`Delete the "${key}" platform setting?`)) return;
    deleteSettingMutation.mutate(key, {
      onSuccess:()=>toast("Platform setting deleted",C.green),
      onError:(error)=>toast(error.message,C.red),
    });
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <Card title="Admin Accounts">
        <Table columns={["Name","Email","Role","Status"]} emptyMessage="No admin accounts found in the backend."
          rows={(data.admins || []).map((admin) => <tr key={admin.id}><Td>{admin.full_name || "-"}</Td><Td>{admin.email}</Td>
            <Td>{ADMIN_ROLES[admin.role]?.label || titleCase(admin.role)}</Td><Td><Badge type={admin.is_active?"active":"inactive"}/></Td></tr>)}/>
      </Card>
      <Card title="Platform Integrations" actions={
        <Btn icon={Plus} variant="success" onClick={()=>setIntegrationEditor({name:"",service:"",environment:"",status:"inactive"})}>Add Integration</Btn>
      }>
        <Table columns={["Name","Service","Environment","Status","Actions"]} emptyMessage="No platform integrations configured in the backend."
          rows={(data.integrations || []).map((integration) => <tr key={integration.id}><Td><Key size={13} color={C.blue}/> {integration.name}</Td>
            <Td>{integration.service}</Td><Td>{integration.environment || "-"}</Td><Td><Badge type={integration.status}/></Td>
            <Td><div style={{display:'flex',gap:5}}>
              <Btn icon={Edit2} onClick={()=>setIntegrationEditor(integration)}>Edit</Btn>
              <Btn disabled={deleteIntegrationMutation.isPending} icon={Trash2} variant="danger" onClick={()=>removeIntegration(integration.id)}>Delete</Btn>
            </div></Td></tr>)}/>
      </Card>
      <Card title="Platform Settings" actions={
        <Btn icon={Plus} variant="success" onClick={()=>setSettingEditor({key:"",value:"{}"})}>Add Setting</Btn>
      }>
        <Table columns={["Setting","Value","Updated","Actions"]} emptyMessage="No platform settings configured in the backend."
          rows={(data.settings || []).map((setting) => <tr key={setting.key}><Td>{setting.key}</Td>
            <Td>{JSON.stringify(setting.value)}</Td><Td>{formatDate(setting.updated_at)}</Td>
            <Td><div style={{display:'flex',gap:5}}>
              <Btn icon={Edit2} onClick={()=>setSettingEditor({key:setting.key,value:JSON.stringify(setting.value,null,2)})}>Edit</Btn>
              <Btn disabled={deleteSettingMutation.isPending} icon={Trash2} variant="danger" onClick={()=>removeSetting(setting.key)}>Delete</Btn>
            </div></Td></tr>)}/>
      </Card>
      {integrationEditor && (
        <AdminModal title={integrationEditor.id?"Edit Integration":"Add Integration"} onClose={()=>setIntegrationEditor(null)}>
          <form onSubmit={saveIntegration} style={{padding:'1.2rem',display:'grid',gap:12}}>
            <Field label="Name"><input required value={integrationEditor.name} onChange={(event)=>setIntegrationEditor({...integrationEditor,name:event.target.value})} style={inputStyle}/></Field>
            <Field label="Service"><input required value={integrationEditor.service} onChange={(event)=>setIntegrationEditor({...integrationEditor,service:event.target.value})} style={inputStyle}/></Field>
            <Field label="Environment"><input value={integrationEditor.environment || ""} onChange={(event)=>setIntegrationEditor({...integrationEditor,environment:event.target.value})} style={inputStyle}/></Field>
            <Field label="Status"><select value={integrationEditor.status} onChange={(event)=>setIntegrationEditor({...integrationEditor,status:event.target.value})} style={inputStyle}>
              {["active","inactive","pending"].map((status)=><option key={status} value={status}>{titleCase(status)}</option>)}
            </select></Field>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <Btn onClick={()=>setIntegrationEditor(null)}>Cancel</Btn>
              <Btn type="submit" disabled={integrationMutation.isPending} icon={integrationMutation.isPending?Loader2:Check} iconSpin={integrationMutation.isPending}
                variant="success">{integrationMutation.isPending?"Saving...":"Save"}</Btn>
            </div>
          </form>
        </AdminModal>
      )}
      {settingEditor && (
        <AdminModal title={settingEditor.key?"Edit Platform Setting":"Add Platform Setting"} onClose={()=>setSettingEditor(null)}>
          <form onSubmit={saveSetting} style={{padding:'1.2rem',display:'grid',gap:12}}>
            <Field label="Setting Key"><input required disabled={Boolean((data.settings || []).some((setting)=>setting.key===settingEditor.key))}
              value={settingEditor.key} onChange={(event)=>setSettingEditor({...settingEditor,key:event.target.value})} style={inputStyle}/></Field>
            <Field label="JSON Value"><textarea required rows="8" value={settingEditor.value}
              onChange={(event)=>setSettingEditor({...settingEditor,value:event.target.value})} style={{...inputStyle,resize:'vertical'}}/></Field>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <Btn onClick={()=>setSettingEditor(null)}>Cancel</Btn>
              <Btn type="submit" disabled={settingMutation.isPending} icon={settingMutation.isPending?Loader2:Check} iconSpin={settingMutation.isPending}
                variant="success">{settingMutation.isPending?"Saving...":"Save"}</Btn>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

function PromoCodesModule({ deleteMutation, query, saveMutation, toast }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(adminPromoSchema),
    defaultValues: adminPromoDefaults,
    mode: "onBlur",
  });
  const promoType = useWatch({ control: form.control, name: "type" });

  const openEditor = (promo = null) => {
    form.reset(promo ? promoToForm(promo) : adminPromoDefaults);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    form.reset(adminPromoDefaults);
  };

  const submitPromo = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      code: values.code.toUpperCase(),
      value: values.type === "shipping"
        ? 0
        : values.type === "fixed"
          ? toMinor(values.value)
          : Number(values.value || 0),
      minOrderCents: toMinor(values.minOrder),
      maxUses: values.maxUses === "" ? null : Number(values.maxUses),
      startsAt: values.startsAt || null,
      expiresAt: values.expiresAt || null,
    };

    try {
      await saveMutation.mutateAsync(payload);
      await query.refetch();
      closeEditor();
      toast("Promo code saved", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  });

  const removePromo = async (code) => {
    try {
      await deleteMutation.mutateAsync(code);
      await query.refetch();
      toast("Promo code deleted", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };

  const promos = Array.isArray(query.data) ? query.data : [];
  const valueLabel = promoType === "fixed"
    ? "Fixed Amount (NGN)"
    : promoType === "shipping"
      ? "Value"
      : "Percent Off";

  return (
    <div style={{display:'grid',gap:14}}>
      <Card title="Admin Promo Codes" accent={C.purple} actions={
        <Btn icon={Plus} variant="success" onClick={()=>openEditor()}>Add Promo</Btn>
      }>
        <PanelMessage>Admin promo codes apply across the cart. Seller coupons are product-scoped and managed from the seller dashboard.</PanelMessage>
        {query.isLoading ? (
          <PanelMessage>Loading promo codes...</PanelMessage>
        ) : (
          <Table columns={["Code","Type","Value","Minimum","Usage","Status","Actions"]}
            emptyMessage="No admin promo codes configured in the backend."
            rows={promos.map((promo) => {
              const value = promo.type === "fixed"
                ? formatMoney(promo.value)
                : promo.type === "shipping"
                  ? "Free shipping"
                  : `${promo.value}%`;
              return (
                <tr key={promo.code}>
                  <Td><Ticket size={13} color={C.purple}/> <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800}}>{promo.code}</span></Td>
                  <Td>{titleCase(promo.type)}</Td>
                  <Td>{value}</Td>
                  <Td>{formatMoney(promo.min_order_cents)}</Td>
                  <Td>{promo.used_count || 0}{promo.max_uses ? `/${promo.max_uses}` : ""}</Td>
                  <Td><Badge type={promo.is_active ? "active" : "inactive"}/></Td>
                  <Td><div style={{display:'flex',gap:5}}>
                    <Btn icon={Edit2} onClick={()=>openEditor(promo)}>Edit</Btn>
                    <Btn disabled={deleteMutation.isPending} icon={Trash2} variant="danger" onClick={()=>removePromo(promo.code)}>Delete</Btn>
                  </div></Td>
                </tr>
              );
            })}/>
        )}
      </Card>
      {editorOpen && (
        <AdminModal title="Promo Code" onClose={closeEditor}>
          <form onSubmit={submitPromo} style={{padding:'1.2rem',display:'grid',gap:12}}>
            <Field label="Code">
              <input {...form.register("code")}
                onChange={(event)=>form.setValue("code", event.target.value.toUpperCase(), {shouldValidate:true, shouldDirty:true})}
                style={inputStyle}/>
              {form.formState.errors.code && <small style={{color:C.red}}>{form.formState.errors.code.message}</small>}
            </Field>
            <Field label="Label">
              <input {...form.register("label")} style={inputStyle}/>
              {form.formState.errors.label && <small style={{color:C.red}}>{form.formState.errors.label.message}</small>}
            </Field>
            <Field label="Type">
              <select {...form.register("type")} style={inputStyle}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed Amount</option>
                <option value="shipping">Free Shipping</option>
              </select>
            </Field>
            <Field label={valueLabel}>
              <input {...form.register("value")} disabled={promoType === "shipping"} min="0"
                type="number" style={inputStyle}/>
              {form.formState.errors.value && <small style={{color:C.red}}>{form.formState.errors.value.message}</small>}
            </Field>
            <Field label="Minimum Order (NGN)">
              <input {...form.register("minOrder")} min="0" step="100" type="number" style={inputStyle}/>
            </Field>
            <Field label="Max Uses">
              <input {...form.register("maxUses")} min="1" placeholder="Unlimited" type="number" style={inputStyle}/>
            </Field>
            <Field label="Starts At">
              <input {...form.register("startsAt")} type="datetime-local" style={inputStyle}/>
            </Field>
            <Field label="Expires At">
              <input {...form.register("expiresAt")} type="datetime-local" style={inputStyle}/>
            </Field>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:C.txt2}}>
              <input type="checkbox" {...form.register("isActive")}/>
              Active promo code
            </label>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <Btn onClick={closeEditor}>Cancel</Btn>
              <Btn type="submit" disabled={saveMutation.isPending} icon={saveMutation.isPending?Loader2:Check}
                iconSpin={saveMutation.isPending} variant="success">{saveMutation.isPending?"Saving...":"Save Promo"}</Btn>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

const advertDefaults = {
  title: "",
  eyebrow: "",
  subtitle: "",
  placement: "showcase_hero",
  surface: "global",
  status: "draft",
  image_url: "",
  cta_label: "Shop Now",
  cta_url: "",
  priority: 10,
  weight: 1,
  starts_at: "",
  ends_at: "",
};

const dealDefaults = {
  title: "Deal of the Day",
  eyebrow: "Today Only",
  description: "",
  status: "draft",
  priority: 10,
  accent_color: "#E8433A",
  featured_product_id: "",
  product_ids: "",
  cta_label: "View deal",
  cta_url: "/products/curations/deal-of-the-day",
  starts_at: "",
  ends_at: "",
};

const csvToIds = (value = "") =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

function CommercialModule({
  advertsQuery,
  dealsQuery,
  deleteAdvertMutation,
  deleteDealMutation,
  saveAdvertMutation,
  saveDealMutation,
  sellerAdsQuery,
  sellerAdStatusMutation,
  toast,
}) {
  const [advertEditor, setAdvertEditor] = useState(null);
  const [dealEditor, setDealEditor] = useState(null);
  const [statusNote, setStatusNote] = useState("");

  const adminAdverts = Array.isArray(advertsQuery.data) ? advertsQuery.data : [];
  const deals = Array.isArray(dealsQuery.data) ? dealsQuery.data : [];
  const sellerAds = Array.isArray(sellerAdsQuery.data) ? sellerAdsQuery.data : [];

  const openAdvertEditor = (advert = null) => {
    setAdvertEditor(advert ? {
      ...advertDefaults,
      ...advert,
      starts_at: toDateTimeLocal(advert.starts_at),
      ends_at: toDateTimeLocal(advert.ends_at),
      image_url: advert.image_url || advert.imageUrl || "",
      cta_url: advert.cta_url || advert.ctaUrl || advert.targetUrl || "",
      cta_label: advert.cta_label || advert.ctaLabel || "Shop Now",
    } : advertDefaults);
  };

  const openDealEditor = (deal = null) => {
    setDealEditor(deal ? {
      ...dealDefaults,
      ...deal,
      starts_at: toDateTimeLocal(deal.starts_at),
      ends_at: toDateTimeLocal(deal.ends_at),
      product_ids: Array.isArray(deal.product_ids) ? deal.product_ids.join(", ") : "",
    } : dealDefaults);
  };

  const saveAdvert = async (event) => {
    event.preventDefault();
    const payload = {
      title: advertEditor.title,
      eyebrow: advertEditor.eyebrow || null,
      subtitle: advertEditor.subtitle || null,
      placement: advertEditor.placement,
      surface: advertEditor.surface,
      status: advertEditor.status,
      image_url: advertEditor.image_url || null,
      cta_label: advertEditor.cta_label || null,
      cta_url: advertEditor.cta_url || null,
      target_url: advertEditor.cta_url || null,
      priority: Number(advertEditor.priority || 10),
      weight: Number(advertEditor.weight || 1),
      starts_at: advertEditor.starts_at || null,
      ends_at: advertEditor.ends_at || null,
    };

    try {
      await saveAdvertMutation.mutateAsync({ id: advertEditor.id, payload });
      await advertsQuery.refetch();
      setAdvertEditor(null);
      toast("Advert control saved", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };

  const saveDeal = async (event) => {
    event.preventDefault();
    const productIds = csvToIds(dealEditor.product_ids);
    const payload = {
      title: dealEditor.title,
      eyebrow: dealEditor.eyebrow || null,
      description: dealEditor.description || null,
      status: dealEditor.status,
      priority: Number(dealEditor.priority || 10),
      accent_color: dealEditor.accent_color || "#E8433A",
      featured_product_id: dealEditor.featured_product_id || productIds[0] || null,
      product_ids: productIds,
      cta_label: dealEditor.cta_label || null,
      cta_url: dealEditor.cta_url || null,
      starts_at: dealEditor.starts_at || null,
      ends_at: dealEditor.ends_at || null,
    };

    try {
      await saveDealMutation.mutateAsync({ id: dealEditor.id, payload });
      await dealsQuery.refetch();
      setDealEditor(null);
      toast("Deal of the Day saved", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };

  const updateSellerAd = async (ad, approvalStatus) => {
    try {
      await sellerAdStatusMutation.mutateAsync({
        id: ad.id,
        payload: {
          approvalStatus,
          adminStatusNote: statusNote,
          priority: Number(ad.priority || 10),
          weight: Number(ad.weight || 1),
          startsAt: ad.starts_at,
          endsAt: ad.ends_at,
        },
      });
      await sellerAdsQuery.refetch();
      setStatusNote("");
      toast(`Seller advertisement ${titleCase(approvalStatus)}`, C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };

  const removeAdvert = async (id) => {
    if (!window.confirm("Delete this admin advert?")) return;
    try {
      await deleteAdvertMutation.mutateAsync(id);
      await advertsQuery.refetch();
      toast("Advert deleted", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };

  const removeDeal = async (id) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await deleteDealMutation.mutateAsync(id);
      await dealsQuery.refetch();
      toast("Deal deleted", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };

  return (
    <div style={{display:'grid',gap:14}}>
      <Stats>
        <Stat icon={Sparkles} label="Admin adverts" value={adminAdverts.length} color={C.purple}/>
        <Stat icon={Ticket} label="Deal controls" value={deals.length} color={C.amber}/>
        <Stat icon={Store} label="Seller ad requests" value={sellerAds.length} color={C.cyan}/>
        <Stat icon={CheckCircle2} label="Pending review" value={sellerAds.filter((ad)=>ad.approval_status==="pending_review").length} color={C.green}/>
      </Stats>

      <Card title="Seller Paid Advertisement Requests" accent={C.cyan}>
        <PanelMessage>Seller-created paid ads stay pending until admin approves their placement, dates, priority, and package fit.</PanelMessage>
        <div style={{padding:'0 1.2rem 1rem'}}>
          <Field label="Review Note">
            <input value={statusNote} onChange={(event)=>setStatusNote(event.target.value)}
              placeholder="Optional note sent with approve/reject decisions" style={inputStyle}/>
          </Field>
        </div>
        {sellerAdsQuery.isLoading ? <PanelMessage>Loading seller advertisements...</PanelMessage> : (
          <Table columns={["Campaign","Seller","Placement","Package","Budget","Payment","Status","Actions"]}
            emptyMessage="No seller advertisement requests found."
            rows={sellerAds.map((ad) => (
              <tr key={ad.id}>
                <Td>{ad.title}<div style={{fontSize:10,color:C.txt3}}>{ad.subtitle || ad.destination_url || "-"}</div></Td>
                <Td>{ad.seller?.store_name || ad.seller?.full_name || ad.seller_id}</Td>
                <Td>{titleCase(ad.placement)}</Td>
                <Td>{titleCase(ad.package_id || ad.required_seller_plan || "standard")}</Td>
                <Td>{formatMoney(ad.budget_minor)}</Td>
                <Td><Badge type={ad.payment_status || "pending"}/></Td>
                <Td><Badge type={ad.approval_status || "draft"}/></Td>
                <Td><div style={{display:'flex',gap:5}}>
                  <Btn icon={Check} variant="success" disabled={sellerAdStatusMutation.isPending}
                    onClick={()=>updateSellerAd(ad, "approved")}>Approve</Btn>
                  <Btn icon={XCircle} variant="danger" disabled={sellerAdStatusMutation.isPending}
                    onClick={()=>updateSellerAd(ad, "rejected")}>Reject</Btn>
                  <Btn icon={Clock} disabled={sellerAdStatusMutation.isPending}
                    onClick={()=>updateSellerAd(ad, "paused")}>Pause</Btn>
                </div></Td>
              </tr>
            ))}/>
        )}
      </Card>

      <Card title="Hero, Featured, And Placement Adverts" accent={C.purple} actions={
        <Btn icon={Plus} variant="success" onClick={()=>openAdvertEditor()}>Add Advert</Btn>
      }>
        {advertsQuery.isLoading ? <PanelMessage>Loading admin adverts...</PanelMessage> : (
          <Table columns={["Title","Placement","Surface","Status","Priority","Dates","Actions"]}
            emptyMessage="No admin-controlled adverts yet."
            rows={adminAdverts.map((advert) => (
              <tr key={advert.id}>
                <Td>{advert.title}<div style={{fontSize:10,color:C.txt3}}>{advert.eyebrow || advert.subtitle || "-"}</div></Td>
                <Td>{titleCase(advert.placement)}</Td>
                <Td>{titleCase(advert.surface || "global")}</Td>
                <Td><Badge type={advert.status || "draft"}/></Td>
                <Td>{advert.priority || 10} / {advert.weight || 1}</Td>
                <Td>{formatDate(advert.starts_at)} - {formatDate(advert.ends_at)}</Td>
                <Td><div style={{display:'flex',gap:5}}>
                  <Btn icon={Edit2} onClick={()=>openAdvertEditor(advert)}>Edit</Btn>
                  <Btn icon={Trash2} variant="danger" onClick={()=>removeAdvert(advert.id)}>Delete</Btn>
                </div></Td>
              </tr>
            ))}/>
        )}
      </Card>

      <Card title="Deal Of The Day" accent={C.amber} actions={
        <Btn icon={Plus} variant="success" onClick={()=>openDealEditor()}>Add Deal</Btn>
      }>
        {dealsQuery.isLoading ? <PanelMessage>Loading deals...</PanelMessage> : (
          <Table columns={["Title","Featured Product","Products","Status","Priority","Ends","Actions"]}
            emptyMessage="No Deal of the Day rows configured."
            rows={deals.map((deal) => (
              <tr key={deal.id}>
                <Td>{deal.title}<div style={{fontSize:10,color:C.txt3}}>{deal.eyebrow || "-"}</div></Td>
                <Td>{deal.featured_product_id || "-"}</Td>
                <Td>{Array.isArray(deal.product_ids) ? deal.product_ids.length : 0}</Td>
                <Td><Badge type={deal.status || "draft"}/></Td>
                <Td>{deal.priority || 10}</Td>
                <Td>{formatDate(deal.ends_at)}</Td>
                <Td><div style={{display:'flex',gap:5}}>
                  <Btn icon={Edit2} onClick={()=>openDealEditor(deal)}>Edit</Btn>
                  <Btn icon={Trash2} variant="danger" onClick={()=>removeDeal(deal.id)}>Delete</Btn>
                </div></Td>
              </tr>
            ))}/>
        )}
      </Card>

      {advertEditor && (
        <AdminModal title={advertEditor.id ? "Edit Advert" : "Create Advert"} onClose={()=>setAdvertEditor(null)}>
          <form onSubmit={saveAdvert} style={{padding:'1.2rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
            <Field label="Title"><input required value={advertEditor.title} onChange={(event)=>setAdvertEditor({...advertEditor,title:event.target.value})} style={inputStyle}/></Field>
            <Field label="Eyebrow"><input value={advertEditor.eyebrow || ""} onChange={(event)=>setAdvertEditor({...advertEditor,eyebrow:event.target.value})} style={inputStyle}/></Field>
            <Field label="Subtitle"><input value={advertEditor.subtitle || ""} onChange={(event)=>setAdvertEditor({...advertEditor,subtitle:event.target.value})} style={inputStyle}/></Field>
            <Field label="Placement"><select value={advertEditor.placement} onChange={(event)=>setAdvertEditor({...advertEditor,placement:event.target.value})} style={inputStyle}>
              {["showcase_hero","homepage_hero","featured_banner","category_banner","curation_slot","store_spotlight"].map((placement)=><option key={placement} value={placement}>{titleCase(placement)}</option>)}
            </select></Field>
            <Field label="Surface"><input value={advertEditor.surface || "global"} onChange={(event)=>setAdvertEditor({...advertEditor,surface:event.target.value})} style={inputStyle}/></Field>
            <Field label="Status"><select value={advertEditor.status} onChange={(event)=>setAdvertEditor({...advertEditor,status:event.target.value})} style={inputStyle}>
              {["draft","active","paused","archived"].map((status)=><option key={status} value={status}>{titleCase(status)}</option>)}
            </select></Field>
            <Field label="Image URL"><input value={advertEditor.image_url || ""} onChange={(event)=>setAdvertEditor({...advertEditor,image_url:event.target.value})} style={inputStyle}/></Field>
            <Field label="CTA Label"><input value={advertEditor.cta_label || ""} onChange={(event)=>setAdvertEditor({...advertEditor,cta_label:event.target.value})} style={inputStyle}/></Field>
            <Field label="CTA URL"><input value={advertEditor.cta_url || ""} onChange={(event)=>setAdvertEditor({...advertEditor,cta_url:event.target.value})} style={inputStyle}/></Field>
            <Field label="Priority"><input min="0" type="number" value={advertEditor.priority} onChange={(event)=>setAdvertEditor({...advertEditor,priority:event.target.value})} style={inputStyle}/></Field>
            <Field label="Weight"><input min="0" type="number" value={advertEditor.weight} onChange={(event)=>setAdvertEditor({...advertEditor,weight:event.target.value})} style={inputStyle}/></Field>
            <Field label="Starts At"><input type="datetime-local" value={advertEditor.starts_at || ""} onChange={(event)=>setAdvertEditor({...advertEditor,starts_at:event.target.value})} style={inputStyle}/></Field>
            <Field label="Ends At"><input type="datetime-local" value={advertEditor.ends_at || ""} onChange={(event)=>setAdvertEditor({...advertEditor,ends_at:event.target.value})} style={inputStyle}/></Field>
            <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end',gap:8}}>
              <Btn onClick={()=>setAdvertEditor(null)}>Cancel</Btn>
              <Btn type="submit" variant="success" disabled={saveAdvertMutation.isPending} icon={saveAdvertMutation.isPending?Loader2:Check}
                iconSpin={saveAdvertMutation.isPending}>{saveAdvertMutation.isPending ? "Saving..." : "Save Advert"}</Btn>
            </div>
          </form>
        </AdminModal>
      )}

      {dealEditor && (
        <AdminModal title={dealEditor.id ? "Edit Deal Of The Day" : "Create Deal Of The Day"} onClose={()=>setDealEditor(null)}>
          <form onSubmit={saveDeal} style={{padding:'1.2rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
            <Field label="Title"><input required value={dealEditor.title} onChange={(event)=>setDealEditor({...dealEditor,title:event.target.value})} style={inputStyle}/></Field>
            <Field label="Eyebrow"><input value={dealEditor.eyebrow || ""} onChange={(event)=>setDealEditor({...dealEditor,eyebrow:event.target.value})} style={inputStyle}/></Field>
            <Field label="Description"><input value={dealEditor.description || ""} onChange={(event)=>setDealEditor({...dealEditor,description:event.target.value})} style={inputStyle}/></Field>
            <Field label="Status"><select value={dealEditor.status} onChange={(event)=>setDealEditor({...dealEditor,status:event.target.value})} style={inputStyle}>
              {["draft","active","paused","archived"].map((status)=><option key={status} value={status}>{titleCase(status)}</option>)}
            </select></Field>
            <Field label="Featured Product ID"><input value={dealEditor.featured_product_id || ""} onChange={(event)=>setDealEditor({...dealEditor,featured_product_id:event.target.value})} style={inputStyle}/></Field>
            <Field label="Product IDs"><textarea rows="3" value={dealEditor.product_ids || ""} onChange={(event)=>setDealEditor({...dealEditor,product_ids:event.target.value})} style={{...inputStyle,resize:'vertical'}}/></Field>
            <Field label="Accent Color"><input value={dealEditor.accent_color || ""} onChange={(event)=>setDealEditor({...dealEditor,accent_color:event.target.value})} style={inputStyle}/></Field>
            <Field label="CTA URL"><input value={dealEditor.cta_url || ""} onChange={(event)=>setDealEditor({...dealEditor,cta_url:event.target.value})} style={inputStyle}/></Field>
            <Field label="Priority"><input min="0" type="number" value={dealEditor.priority} onChange={(event)=>setDealEditor({...dealEditor,priority:event.target.value})} style={inputStyle}/></Field>
            <Field label="Starts At"><input type="datetime-local" value={dealEditor.starts_at || ""} onChange={(event)=>setDealEditor({...dealEditor,starts_at:event.target.value})} style={inputStyle}/></Field>
            <Field label="Ends At"><input type="datetime-local" value={dealEditor.ends_at || ""} onChange={(event)=>setDealEditor({...dealEditor,ends_at:event.target.value})} style={inputStyle}/></Field>
            <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end',gap:8}}>
              <Btn onClick={()=>setDealEditor(null)}>Cancel</Btn>
              <Btn type="submit" variant="success" disabled={saveDealMutation.isPending} icon={saveDealMutation.isPending?Loader2:Check}
                iconSpin={saveDealMutation.isPending}>{saveDealMutation.isPending ? "Saving..." : "Save Deal"}</Btn>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

function AdminPromotionModule({ configurePasscodeMutation, mutation, toast }) {
  const [promotion, setPromotion] = useState({email:"",name:"",role:"support_lead",passcode:""});
  const [passcode, setPasscode] = useState({currentPasscode:"",newPasscode:""});
  const submitPromotion = async (event) => {
    event.preventDefault();
    try {
      await mutation.mutateAsync(promotion);
      setPromotion({email:"",name:"",role:"support_lead",passcode:""});
      toast("Admin account promoted", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const configurePasscode = async (event) => {
    event.preventDefault();
    try {
      await configurePasscodeMutation.mutateAsync(passcode);
      setPasscode({currentPasscode:"",newPasscode:""});
      toast("Promotion passcode updated", C.green);
    } catch (error) {
      toast(error.message, C.red);
    }
  };
  const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 6);
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:14}}>
      <Card title="Promote Existing Account" accent={C.purple}>
        <form onSubmit={submitPromotion} style={{padding:'1.2rem',display:'grid',gap:12}}>
          <PanelMessage>Promotions require an existing Auth account, super-admin membership, and the six-digit promotion passcode.</PanelMessage>
          <Field label="Account Email"><input required type="email" value={promotion.email}
            onChange={(event)=>setPromotion({...promotion,email:event.target.value})} style={inputStyle}/></Field>
          <Field label="Display Name"><input value={promotion.name}
            onChange={(event)=>setPromotion({...promotion,name:event.target.value})} style={inputStyle}/></Field>
          <Field label="Admin Role"><select value={promotion.role}
            onChange={(event)=>setPromotion({...promotion,role:event.target.value})} style={inputStyle}>
            {Object.entries(ADMIN_ROLES).map(([id, role])=><option key={id} value={id}>{role.label}</option>)}
          </select></Field>
          <Field label="Six-Digit Passcode"><input required type="password" inputMode="numeric" autoComplete="off" maxLength="6"
            value={promotion.passcode} onChange={(event)=>setPromotion({...promotion,passcode:onlyDigits(event.target.value)})} style={inputStyle}/></Field>
          <Btn type="submit" disabled={mutation.isPending || promotion.passcode.length!==6} icon={mutation.isPending?Loader2:Shield}
            iconSpin={mutation.isPending} variant="purple">{mutation.isPending?"Promoting...":"Promote Admin"}</Btn>
        </form>
      </Card>
      <Card title="Promotion Passcode" accent={C.amber}>
        <form onSubmit={configurePasscode} style={{padding:'1.2rem',display:'grid',gap:12}}>
          <PanelMessage>Bootstrap the code once, then provide the current code for rotations. Codes are hashed server-side and failed promotion attempts lock temporarily.</PanelMessage>
          <Field label="Current Passcode"><input type="password" inputMode="numeric" autoComplete="off" maxLength="6"
            value={passcode.currentPasscode} onChange={(event)=>setPasscode({...passcode,currentPasscode:onlyDigits(event.target.value)})} style={inputStyle}/></Field>
          <Field label="New Six-Digit Passcode"><input required type="password" inputMode="numeric" autoComplete="off" maxLength="6"
            value={passcode.newPasscode} onChange={(event)=>setPasscode({...passcode,newPasscode:onlyDigits(event.target.value)})} style={inputStyle}/></Field>
          <Btn type="submit" disabled={configurePasscodeMutation.isPending || passcode.newPasscode.length!==6}
            icon={configurePasscodeMutation.isPending?Loader2:Key} iconSpin={configurePasscodeMutation.isPending}
            variant="cyan">{configurePasscodeMutation.isPending?"Updating...":"Configure Passcode"}</Btn>
        </form>
      </Card>
    </div>
  );
}

export function AdminDashboardModules({ addToast, moduleId, user }) {
  const dashboard = useAdminDashboard();
  const buyersQuery = useAdminBuyers(moduleId === "users");
  const deactivatedBuyersQuery = useAdminDeactivatedBuyers(moduleId === "users");
  const hiringQuery = useAdminHiring(moduleId === "hiring");
  const orderMutation = useSetAdminOrderStatus();
  const productMutation = useSetAdminProductActive();
  const productModerationMutation = useSetAdminProductModerationStatus();
  const sellerMutation = useSetAdminSellerStatus();
  const reviewBuyerMutation = useReviewBuyerReactivation();
  const deleteBuyerMutation = usePermanentlyDeleteBuyerAccount();
  const supportMutation = useSetAdminSupportTicketStatus();
  const hiringMutation = useMoveAdminHiringCandidate();
  const jobMutation = useCreateAdminJobOpening();
  const jobStatusMutation = useSetAdminJobOpeningStatus();
  const integrationMutation = useSaveAdminIntegration();
  const deleteIntegrationMutation = useDeleteAdminIntegration();
  const settingMutation = useSaveAdminSetting();
  const deleteSettingMutation = useDeleteAdminSetting();
  const promoCodesQuery = useAdminPromoCodes(moduleId === "promos");
  const adminAdvertsQuery = useAdminAdverts(moduleId === "commercial");
  const adminDealsQuery = useAdminDealsOfDay(moduleId === "commercial");
  const sellerAdsQuery = useAdminSellerAdvertisements(moduleId === "commercial");
  const savePromoMutation = useSaveAdminPromoCode();
  const deletePromoMutation = useDeleteAdminPromoCode();
  const saveAdminAdvertMutation = useSaveAdminAdvert();
  const deleteAdminAdvertMutation = useDeleteAdminAdvert();
  const saveAdminDealMutation = useSaveAdminDealOfDay();
  const deleteAdminDealMutation = useDeleteAdminDealOfDay();
  const sellerAdStatusMutation = useUpdateSellerAdvertisementStatus();
  const promoteAdminMutation = usePromoteAdmin();
  const configurePasscodeMutation = useConfigureAdminPromotionPasscode();
  const aiMutation = useQueueAdminAiQuery();

  if (dashboard.isLoading) return <ModuleLoader/>;
  if (dashboard.isError) return <PanelMessage>{dashboard.error.message}</PanelMessage>;

  const data = dashboard.data || {};
  const shared = { data, toast:addToast };
  const modules = {
    dashboard: <DashboardModule data={data}/>,
    orders: <OrdersModule {...shared} mutation={orderMutation}/>,
    products: <ProductsModule {...shared} moderationMutation={productModerationMutation} mutation={productMutation}/>,
    users: <UsersModule buyersQuery={buyersQuery} canManageDeactivatedAccounts={user.role.canSuspend}
      data={data} deactivatedBuyersQuery={deactivatedBuyersQuery} deleteBuyerMutation={deleteBuyerMutation}
      reviewBuyerMutation={reviewBuyerMutation} toast={addToast}/>,
    sellers: <SellersModule {...shared} mutation={sellerMutation}/>,
    analytics: <AnalyticsModule data={data}/>,
    support: <SupportModule {...shared} mutation={supportMutation}/>,
    ai: <AiModule {...shared} mutation={aiMutation}/>,
    hiring: <HiringModule {...shared} hiringQuery={hiringQuery} jobMutation={jobMutation}
      jobStatusMutation={jobStatusMutation} mutation={hiringMutation}/>,
    settings: <SettingsModule {...shared} deleteIntegrationMutation={deleteIntegrationMutation}
      deleteSettingMutation={deleteSettingMutation} integrationMutation={integrationMutation} settingMutation={settingMutation}/>,
    commercial: <CommercialModule advertsQuery={adminAdvertsQuery} dealsQuery={adminDealsQuery}
      deleteAdvertMutation={deleteAdminAdvertMutation} deleteDealMutation={deleteAdminDealMutation}
      saveAdvertMutation={saveAdminAdvertMutation} saveDealMutation={saveAdminDealMutation}
      sellerAdsQuery={sellerAdsQuery} sellerAdStatusMutation={sellerAdStatusMutation} toast={addToast}/>,
    promos: <PromoCodesModule deleteMutation={deletePromoMutation} query={promoCodesQuery}
      saveMutation={savePromoMutation} toast={addToast}/>,
    "admin-promotion": <AdminPromotionModule configurePasscodeMutation={configurePasscodeMutation}
      mutation={promoteAdminMutation} toast={addToast}/>,
  };

  if (!user.role.modules.includes(moduleId)) {
    return <AccessDenied module={ADMIN_NAV.find((item)=>item.id===moduleId)?.label || moduleId}/>;
  }

  return <div className="mod">{modules[moduleId]}</div>;
}
