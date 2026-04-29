export const OR_STYLES = `
  @keyframes or-orb{0%,100%{transform:translate(0,0)scale(1)}33%{transform:translate(22px,-26px)scale(1.04)}66%{transform:translate(-16px,18px)scale(0.97)}}
  .or-orb{animation:or-orb linear infinite}

  @keyframes or-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .or-shimmer{
    background:linear-gradient(90deg,#fff 0%,#a5b4fc 30%,#fff 60%,#818cf8 90%);
    background-size:200% auto;-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;animation:or-shimmer 4s linear infinite;
  }

  @keyframes or-glow-blue{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.45)}60%{box-shadow:0 0 0 7px rgba(59,130,246,0)}}
  @keyframes or-glow-amber{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.45)}60%{box-shadow:0 0 0 7px rgba(245,158,11,0)}}
  @keyframes or-glow-green{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.45)}60%{box-shadow:0 0 0 7px rgba(16,185,129,0)}}
  @keyframes or-glow-red{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.35)}60%{box-shadow:0 0 0 7px rgba(239,68,68,0)}}
  .or-glow-processing{animation:or-glow-amber 2.2s ease-out infinite}
  .or-glow-shipped{animation:or-glow-blue 2.2s ease-out infinite}
  .or-glow-delivered{animation:or-glow-green 2.6s ease-out infinite}
  .or-glow-cancelled{animation:or-glow-red 3s ease-out infinite}

  @keyframes or-spin{to{transform:rotate(360deg)}}
  .or-spin{animation:or-spin .75s linear infinite}

  @keyframes or-count-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .or-count-in{animation:or-count-in .45s ease-out forwards}

  .or-scroll::-webkit-scrollbar{width:4px}
  .or-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:99px}
`;

export const STATUS_CONFIG = {
  processing: {
    label: "Processing",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    glow: "or-glow-processing",
    ring: "border-amber-300",
    cardStripe: "from-amber-400 to-orange-500",
    track: [
      { label: "Order Placed", done: true, time: "Just now" },
      { label: "Payment Confirmed", done: true, time: "Just now" },
      { label: "Processing", done: true, time: "In progress" },
      { label: "Dispatched", done: false, time: "Within 24h" },
      { label: "Delivered", done: false, time: "2-5 business days" },
    ],
  },
  shipped: {
    label: "Shipped",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    glow: "or-glow-shipped",
    ring: "border-blue-300",
    cardStripe: "from-blue-400 to-indigo-500",
    track: [
      { label: "Order Placed", done: true, time: "Confirmed" },
      { label: "Payment Confirmed", done: true, time: "Confirmed" },
      { label: "Dispatched", done: true, time: "On its way" },
      { label: "Out for Delivery", done: true, time: "Today" },
      { label: "Delivered", done: false, time: "Expected today" },
    ],
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    glow: "or-glow-delivered",
    ring: "border-emerald-300",
    cardStripe: "from-emerald-400 to-teal-500",
    track: [
      { label: "Order Placed", done: true, time: "Completed" },
      { label: "Payment Confirmed", done: true, time: "Completed" },
      { label: "Dispatched", done: true, time: "Completed" },
      { label: "Delivered", done: true, time: "Delivered" },
    ],
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-400",
    glow: "or-glow-cancelled",
    ring: "border-red-200",
    cardStripe: "from-red-400 to-rose-500",
    track: [
      { label: "Order Placed", done: true, time: "Placed" },
      { label: "Cancelled", done: true, time: "Cancelled" },
    ],
  },
};

export const FILTER_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest", label: "Highest Value" },
  { value: "lowest", label: "Lowest Value" },
];

export const EMPTY_STATE_CONFIG = {
  all: {
    icon: "package",
    title: "No orders yet",
    sub: "When you place your first order it'll appear here.",
  },
  processing: {
    icon: "refresh",
    title: "Nothing processing",
    sub: "You have no orders currently being processed.",
  },
  shipped: {
    icon: "truck",
    title: "No orders in transit",
    sub: "Orders on their way to you will show here.",
  },
  delivered: {
    icon: "check",
    title: "No deliveries yet",
    sub: "Completed orders will appear here.",
  },
  cancelled: {
    icon: "x",
    title: "No cancelled orders",
    sub: "Any cancelled orders would appear here.",
  },
  search: {
    icon: "search",
    sub: "Try a different search term or clear the filter.",
  },
};
