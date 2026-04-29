import {
  AlertTriangle,
  ArrowDownUp,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from "lucide-react";

const iconProps = (className, strokeWidth = 2) => ({ className, strokeWidth });

export const Icons = {
  Search: ({ c = "w-5 h-5" }) => <Search {...iconProps(c)} />,
  Sort: ({ c = "w-4 h-4" }) => <ArrowDownUp {...iconProps(c)} />,
  Close: ({ c = "w-4 h-4" }) => <X {...iconProps(c, 2.5)} />,
  Truck: ({ c = "w-4 h-4" }) => <Truck {...iconProps(c, 1.8)} />,
  Package: ({ c = "w-4 h-4" }) => <Package {...iconProps(c, 1.8)} />,
  Bag: ({ c = "w-4 h-4" }) => <ShoppingBag {...iconProps(c, 1.8)} />,
  Refresh: ({ c = "w-4 h-4" }) => <RefreshCw {...iconProps(c, 1.8)} />,
  Alert: ({ c = "w-4 h-4" }) => <AlertTriangle {...iconProps(c, 1.8)} />,
  Check: ({ c = "w-4 h-4" }) => <Check {...iconProps(c, 2.2)} />,
  CheckCircle: ({ c = "w-4 h-4" }) => <CheckCircle2 {...iconProps(c, 1.8)} />,
  XCircle: ({ c = "w-4 h-4" }) => <XCircle {...iconProps(c, 1.8)} />,
  CreditCard: ({ c = "w-4 h-4" }) => <CreditCard {...iconProps(c, 1.8)} />,
  Chev: ({ dir = "right", c = "w-4 h-4" }) => {
    if (dir === "down") return <ChevronDown {...iconProps(c, 2.5)} />;
    if (dir === "left") return <ChevronLeft {...iconProps(c, 2.5)} />;
    return <ChevronRight {...iconProps(c, 2.5)} />;
  },
};
