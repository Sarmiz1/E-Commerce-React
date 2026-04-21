// ─── Buyer Dashboard Mock Data ─────────────────────────────────────────────────

export const BUYER_PROFILE = {
  name:   'Samuel Okafor',
  email:  'samuel@email.com',
  phone:  '+234 802 456 7890',
  avatar: null,
  joined: '2024-11-14',
  points: 2840,
};

export const BUYER_STATS = {
  totalOrders:   18,
  wishlistItems: 12,
  rewardPoints:  2840,
  savedAmount:   12400,
};

export const ORDER_STATUS_SNAPSHOT = {
  pending:   2,
  shipped:   3,
  delivered: 11,
  cancelled: 2,
};

export const BUYER_ORDERS = [
  {
    id: '#WOO-8821',
    product: 'Stealth Sneakers X1',
    image: null,
    amount: 48500,
    status: 'shipped',
    date: '2026-04-20',
    eta: 'Friday, Apr 24, 2–5PM',
    address: '14 Adeola Odeku, VI, Lagos',
    payment: 'Mastercard •••• 4521',
    items: [{ name: 'Stealth Sneakers X1', qty: 1, price: 48500, size: 'EU 42' }],
    timeline: ['ordered', 'confirmed', 'dispatched', 'in_transit'],
    currentStep: 3,
  },
  {
    id: '#WOO-8810',
    product: 'Slim Fit Chinos',
    image: null,
    amount: 15500,
    status: 'delivered',
    date: '2026-04-15',
    eta: null,
    address: '14 Adeola Odeku, VI, Lagos',
    payment: 'Paystack',
    items: [{ name: 'Slim Fit Chinos', qty: 1, price: 15500, size: '32 / 32' }],
    timeline: ['ordered', 'confirmed', 'dispatched', 'in_transit', 'delivered'],
    currentStep: 4,
  },
  {
    id: '#WOO-8790',
    product: 'Wireless Earbuds Pro',
    image: null,
    amount: 55000,
    status: 'delivered',
    date: '2026-04-01',
    eta: null,
    address: '14 Adeola Odeku, VI, Lagos',
    payment: 'Mastercard •••• 4521',
    items: [{ name: 'Wireless Earbuds Pro', qty: 1, price: 55000, size: null }],
    timeline: ['ordered', 'confirmed', 'dispatched', 'in_transit', 'delivered'],
    currentStep: 4,
  },
  {
    id: '#WOO-8775',
    product: 'Running Pro Max',
    image: null,
    amount: 62000,
    status: 'cancelled',
    date: '2026-03-25',
    eta: null,
    address: '14 Adeola Odeku, VI, Lagos',
    payment: 'Paystack',
    items: [{ name: 'Running Pro Max', qty: 1, price: 62000, size: 'EU 43' }],
    timeline: ['ordered', 'confirmed', 'cancelled'],
    currentStep: 2,
  },
  {
    id: '#WOO-8760',
    product: 'Linen Blazer Set',
    image: null,
    amount: 44000,
    status: 'pending',
    date: '2026-04-22',
    eta: 'Monday, Apr 28',
    address: '14 Adeola Odeku, VI, Lagos',
    payment: 'Paystack',
    items: [{ name: 'Linen Blazer Set', qty: 1, price: 44000, size: 'L' }],
    timeline: ['ordered', 'confirmed'],
    currentStep: 1,
  },
];

export const WISHLIST = [
  { id: 1, name: 'Leather Oxford Shoes',  price: 38000, originalPrice: 45000, stock: 8,  inStock: true,  priceAlert: true,  aiNote: 'Price likely to drop in 2 days', tag: 'Best Time Soon' },
  { id: 2, name: 'Merino Wool Pullover',  price: 22000, originalPrice: 22000, stock: 3,  inStock: true,  priceAlert: false, aiNote: 'Only 3 left! Getting low', tag: 'Low Stock' },
  { id: 3, name: 'Retro Cargo Trousers', price: 17500, originalPrice: 24000, stock: 0,  inStock: false, priceAlert: false, aiNote: 'Back in stock soon – we\'ll notify you', tag: 'Out of Stock' },
  { id: 4, name: 'Smart Watch Series 5',  price: 85000, originalPrice: 95000, stock: 12, inStock: true,  priceAlert: true,  aiNote: 'Price just dropped ₦10,000!', tag: 'Price Drop' },
  { id: 5, name: 'Puffer Jacket Warm',    price: 31000, originalPrice: 31000, stock: 20, inStock: true,  priceAlert: false, aiNote: 'Similar item available for ₦26,000', tag: 'Alt. Available' },
];

export const RECOMMENDATIONS = [
  { id: 1, name: 'Air Mesh Sneakers',     price: 42000, reason: 'Based on Stealth Sneakers X1',      category: 'Footwear',  fit: 'EU 42', budgetFit: true },
  { id: 2, name: 'Fitted Oxford Shirt',   price: 18500, reason: 'Pairs well with Slim Fit Chinos',   category: 'Fashion',   fit: 'M', budgetFit: true },
  { id: 3, name: 'Noise Cancelling ANC',  price: 52000, reason: 'Based on Wireless Earbuds Pro',     category: 'Tech',      fit: null, budgetFit: false },
  { id: 4, name: 'Jogger Track Pants',    price: 13500, reason: 'Trending in your size',             category: 'Fashion',   fit: '32', budgetFit: true },
  { id: 5, name: 'Sport Ankle Socks 3pk', price: 4500,  reason: 'Frequently bought with sneakers',   category: 'Footwear',  fit: 'EU 42', budgetFit: true },
];

export const SMART_INSIGHTS = [
  { icon: 'refresh',   text: 'You reorder sneakers every ~3 months',  sub: 'Next reorder due soon',       color: '#0050d4' },
  { icon: 'save',      text: 'You saved ₦12,400 using smart deals',   sub: 'This month',                  color: '#059669' },
  { icon: 'package',   text: '2 deliveries arriving this week',        sub: 'Track them now',              color: '#f59e0b' },
  { icon: 'trending',  text: '3 wishlist items dropped in price',      sub: 'Grab them before they\'re gone', color: '#ec4899' },
];

export const ADDRESSES = [
  { id: 1, label: 'Home',   name: 'Samuel Okafor', line1: '14 Adeola Odeku Street', line2: 'Victoria Island, Lagos', phone: '+234 802 456 7890', isDefault: true },
  { id: 2, label: 'Office', name: 'Samuel Okafor', line1: '3 Broad Street, Floor 2', line2: 'Lagos Island, Lagos', phone: '+234 802 456 7890', isDefault: false },
];

export const PAYMENT_METHODS = [
  { id: 1, type: 'card', brand: 'Mastercard', last4: '4521', expiry: '08/27', isDefault: true },
  { id: 2, type: 'card', brand: 'Visa',       last4: '7893', expiry: '02/26', isDefault: false },
];

export const BUYER_NOTIFICATIONS = [
  { id: 1, type: 'shipping',  title: 'Your sneakers are on the way!',          sub: 'Arriving Friday between 2–5PM',          time: '2 min ago',  unread: true },
  { id: 2, type: 'deal',      title: 'Smart Watch just dropped ₦10,000',       sub: 'Saved item price alert triggered',        time: '1 hr ago',   unread: true },
  { id: 3, type: 'stock',     title: 'Low stock: Merino Wool Pullover',         sub: 'Only 3 left in your size',               time: '3 hrs ago',  unread: true },
  { id: 4, type: 'brand',     title: 'Nike dropped new 2026 arrivals',          sub: 'Based on your brand preferences',        time: '1 day ago',  unread: false },
  { id: 5, type: 'delivered', title: 'Order #WOO-8810 delivered!',             sub: 'Leave a review for Slim Fit Chinos',     time: '5 days ago', unread: false },
];

export const SPENDING_DATA = {
  categories: [
    { label: 'Footwear', pct: 42, spend: 110500 },
    { label: 'Fashion',  pct: 28, spend: 73500  },
    { label: 'Tech',     pct: 18, spend: 47000  },
    { label: 'Others',   pct: 12, spend: 31500  },
  ],
  monthly: [
    { month: 'Nov', spend: 38000 },
    { month: 'Dec', spend: 72000 },
    { month: 'Jan', spend: 25000 },
    { month: 'Feb', spend: 48000 },
    { month: 'Mar', spend: 62000 },
    { month: 'Apr', spend: 55000 },
  ],
};

export const REORDER_SUGGESTIONS = [
  { id: 1, name: 'Stealth Sneakers X1',  lastBought: '2026-01-15', price: 48500, reason: 'You buy these every ~3 months' },
  { id: 2, name: 'Sport Ankle Socks',    lastBought: '2026-03-01', price: 4500,  reason: 'Frequently restocked item' },
  { id: 3, name: 'Slim Fit Chinos',      lastBought: '2026-04-15', price: 15500, reason: 'Popular repeat purchase' },
];

export const BUYER_REVIEWS = [
  { id: 1, orderId: '#WOO-8810', product: 'Slim Fit Chinos',    submitted: true,  rating: 4, comment: 'Great fit! Runs slightly large but quality is excellent.' },
  { id: 2, orderId: '#WOO-8790', product: 'Wireless Earbuds Pro', submitted: false, rating: 0, comment: '' },
  { id: 3, orderId: '#WOO-8810', product: 'Running Pro Max',    submitted: false, rating: 0, comment: '' },
];

export const AI_CHAT_SUGGESTIONS = [
  'Black sneakers under ₦45k',
  'Best men\'s shirts for work',
  'Trendy bags for women',
  'Budget tech gadgets',
];
