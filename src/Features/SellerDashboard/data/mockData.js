// ─── Mock Seller Dashboard Data ──────────────────────────────────────────────

export const SELLER_STATS = {
  totalRevenue:     { value: 4_820_500, change: +12.4, label: 'Total Revenue' },
  ordersToday:      { value: 38,        change: +5.6,  label: 'Orders Today'  },
  totalOrders:      { value: 1_247,     change: +8.2,  label: 'Total Orders'  },
  activeProducts:   { value: 64,        change: -2,    label: 'Active Products'},
  conversionRate:   { value: 3.8,       change: +0.4,  label: 'Conversion Rate', suffix: '%' },
  pendingPayout:    { value: 782_000,   change: 0,     label: 'Pending Payout' },
};

export const REVENUE_CHART = {
  '7d': [
    { label: 'Mon', value: 420000 },
    { label: 'Tue', value: 680000 },
    { label: 'Wed', value: 540000 },
    { label: 'Thu', value: 810000 },
    { label: 'Fri', value: 960000 },
    { label: 'Sat', value: 1120000 },
    { label: 'Sun', value: 870000 },
  ],
  '30d': Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    value: Math.round(300000 + Math.random() * 900000),
  })),
  '90d': Array.from({ length: 12 }, (_, i) => ({
    label: `Wk ${i + 1}`,
    value: Math.round(1500000 + Math.random() * 3000000),
  })),
};

export const RECENT_ORDERS = [
  { id: '#WOO-8821', customer: 'Adebayo James',    product: 'Stealth Sneakers X1',   amount: 48500,  status: 'delivered', date: '2026-04-20' },
  { id: '#WOO-8820', customer: 'Fatima Aliyu',     product: 'Classic Oxford Shirt',  amount: 22000,  status: 'shipped',   date: '2026-04-20' },
  { id: '#WOO-8819', customer: 'Emeka Nwosu',      product: 'Slim Fit Chinos',       amount: 15500,  status: 'pending',   date: '2026-04-19' },
  { id: '#WOO-8818', customer: 'Chisom Obi',       product: 'Leather Crossbody Bag', amount: 37000,  status: 'shipped',   date: '2026-04-19' },
  { id: '#WOO-8817', customer: 'Bola Tunde',       product: 'Running Pro Max',       amount: 62000,  status: 'cancelled', date: '2026-04-18' },
  { id: '#WOO-8816', customer: 'Ngozi Eze',        product: 'Floral Summer Dress',   amount: 19500,  status: 'delivered', date: '2026-04-18' },
  { id: '#WOO-8815', customer: 'Segun Falola',     product: 'Wireless Earbuds Pro',  amount: 55000,  status: 'delivered', date: '2026-04-17' },
  { id: '#WOO-8814', customer: 'Amaka Chukwu',     product: 'Linen Blazer Set',      amount: 44000,  status: 'pending',   date: '2026-04-17' },
];

export const PRODUCTS = [
  { id: 1, image: null, name: 'Stealth Sneakers X1',   price: 48500,  stock: 24,  sales: 182, status: 'active' },
  { id: 2, image: null, name: 'Classic Oxford Shirt',  price: 22000,  stock: 0,   sales: 94,  status: 'out_of_stock' },
  { id: 3, image: null, name: 'Slim Fit Chinos',       price: 15500,  stock: 47,  sales: 210, status: 'active' },
  { id: 4, image: null, name: 'Leather Crossbody Bag', price: 37000,  stock: 8,   sales: 61,  status: 'active' },
  { id: 5, image: null, name: 'Running Pro Max',       price: 62000,  stock: 3,   sales: 44,  status: 'active' },
  { id: 6, image: null, name: 'Floral Summer Dress',   price: 19500,  stock: 0,   sales: 120, status: 'out_of_stock' },
  { id: 7, image: null, name: 'Wireless Earbuds Pro',  price: 55000,  stock: 15,  sales: 88,  status: 'active' },
  { id: 8, image: null, name: 'Linen Blazer Set',      price: 44000,  stock: 0,   sales: 0,   status: 'draft' },
];

export const CUSTOMERS = [
  { id: 1, name: 'Adebayo James',  orders: 12, spent: 582000, last: '2026-04-20', tag: 'vip',    email: 'adebayo@email.com' },
  { id: 2, name: 'Fatima Aliyu',   orders: 7,  spent: 154000, last: '2026-04-20', tag: 'repeat',  email: 'fatima@email.com' },
  { id: 3, name: 'Emeka Nwosu',    orders: 3,  spent: 46500,  last: '2026-04-19', tag: 'new',     email: 'emeka@email.com' },
  { id: 4, name: 'Chisom Obi',     orders: 9,  spent: 333000, last: '2026-04-19', tag: 'repeat',  email: 'chisom@email.com' },
  { id: 5, name: 'Bola Tunde',     orders: 1,  spent: 62000,  last: '2026-04-18', tag: 'new',     email: 'bola@email.com' },
  { id: 6, name: 'Ngozi Eze',      orders: 18, spent: 351000, last: '2026-04-18', tag: 'vip',     email: 'ngozi@email.com' },
];

export const REVIEWS = [
  { id: 1, product: 'Stealth Sneakers X1',   customer: 'Adebayo James', rating: 5, comment: 'Incredible quality! Ships super fast and fits perfectly. Will definitely order again.', date: '2026-04-19', status: 'pending' },
  { id: 2, product: 'Classic Oxford Shirt',  customer: 'Fatima Aliyu',  rating: 4, comment: 'Good quality shirt. The material is soft and comfortable. Sizing runs slightly large.', date: '2026-04-18', status: 'approved' },
  { id: 3, product: 'Running Pro Max',       customer: 'Emeka Nwosu',   rating: 3, comment: 'Average for the price. Expected better cushioning on the soles.', date: '2026-04-17', status: 'pending' },
  { id: 4, product: 'Leather Crossbody Bag', customer: 'Ngozi Eze',     rating: 5, comment: 'Absolutely stunning bag. The leather quality is exceptional. Gets so many compliments!', date: '2026-04-15', status: 'approved' },
];

export const TRANSACTIONS = [
  { id: 'TXN-001', ref: '#WOO-8810', amount: 48500,  fee: 1455, net: 47045, status: 'settled',  date: '2026-04-19' },
  { id: 'TXN-002', ref: '#WOO-8808', amount: 22000,  fee: 660,  net: 21340, status: 'settled',  date: '2026-04-18' },
  { id: 'TXN-003', ref: '#WOO-8805', amount: 62000,  fee: 1860, net: 60140, status: 'pending',  date: '2026-04-17' },
  { id: 'TXN-004', ref: '#WOO-8800', amount: 37000,  fee: 1110, net: 35890, status: 'settled',  date: '2026-04-15' },
  { id: 'TXN-005', ref: '#WOO-8795', amount: 55000,  fee: 1650, net: 53350, status: 'settled',  date: '2026-04-12' },
  { id: 'TXN-006', ref: 'WITHDRAWAL', amount: -200000, fee: 0, net: -200000, status: 'paid',    date: '2026-04-10' },
];

export const ANALYTICS = {
  categoryRevenue: [
    { label: 'Footwear',   value: 1820000, pct: 38 },
    { label: 'Fashion',    value: 1200000, pct: 25 },
    { label: 'Bags',       value: 840000,  pct: 17 },
    { label: 'Electronics',value: 600000,  pct: 12 },
    { label: 'Others',     value: 360000,  pct: 8  },
  ],
  trafficSources: [
    { label: 'Organic',    pct: 42 },
    { label: 'Social',     pct: 28 },
    { label: 'Direct',     pct: 18 },
    { label: 'Referral',   pct: 12 },
  ],
  peakHours: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    value: h >= 12 && h <= 21 ? Math.round(40 + Math.random() * 60) : Math.round(5 + Math.random() * 25),
  })),
};
