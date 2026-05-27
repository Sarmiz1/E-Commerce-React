export const mockMetrics = {
  totalRevenue: { value: '$124,500', change: '+12.5%', trend: 'up' },
  totalOrders: { value: '1,432', change: '+5.2%', trend: 'up' },
  activeUsers: { value: '8,940', change: '+18.4%', trend: 'up' },
  conversionRate: { value: '4.2%', change: '-0.4%', trend: 'down' },
  pendingOrders: { value: '45', change: '0%', trend: 'neutral' },
  supportTickets: { value: '12', change: '-15%', trend: 'up' } // Fewer tickets is 'up' trend conceptually
};

export const mockOrders = [
  { id: 'ORD-001', customer: 'Sarmiz O.', product: 'Nike Air Max 270', status: 'Delivered', payment: 'Paid', date: '2026-04-20', amount: '$150.00' },
  { id: 'ORD-002', customer: 'Burna Boy', product: 'Sony WH-1000XM5', status: 'Shipped', payment: 'Paid', date: '2026-04-21', amount: '$348.00' },
  { id: 'ORD-003', customer: 'Tems V.', product: 'Fenty Beauty Gloss', status: 'Pending', payment: 'Unpaid', date: '2026-04-21', amount: '$21.00' },
  { id: 'ORD-004', customer: 'David A.', product: 'MacBook Pro M3', status: 'Cancelled', payment: 'Refunded', date: '2026-04-19', amount: '$1,999.00' },
  { id: 'ORD-005', customer: 'Ayra S.', product: 'Yeezy Slide', status: 'Delivered', payment: 'Paid', date: '2026-04-18', amount: '$70.00' },
];

export const mockProducts = [
  { id: 'PRD-01', name: 'Nike Air Max 270', category: 'Sneakers', price: '$150.00', stock: 45, seller: 'SneakCity', status: 'Active' },
  { id: 'PRD-02', name: 'Sony WH-1000XM5', category: 'Electronics', price: '$348.00', stock: 12, seller: 'TechGadgets NG', status: 'Active' },
  { id: 'PRD-03', name: 'Fenty Beauty Gloss', category: 'Beauty', price: '$21.00', stock: 0, seller: 'GlamourLagos', status: 'Draft' },
  { id: 'PRD-04', name: 'MacBook Pro M3', category: 'Electronics', price: '$1,999.00', stock: 5, seller: 'iStore Africa', status: 'Active' },
];

export const mockSellers = [
  { id: 'SEL-01', name: 'SneakCity', status: 'Active', revenue: '$14,500', products: 120, verified: true },
  { id: 'SEL-02', name: 'TechGadgets NG', status: 'Active', revenue: '$45,200', products: 45, verified: true },
  { id: 'SEL-03', name: 'GlamourLagos', status: 'Suspended', revenue: '$1,200', products: 12, verified: false },
  { id: 'SEL-04', name: 'iStore Africa', status: 'Pending', revenue: '$0', products: 5, verified: false },
];

export const mockTickets = [
  { id: 'TK-101', user: 'Sarmiz O.', issue: 'Delivery Delayed', status: 'Open', priority: 'High', date: '2h ago' },
  { id: 'TK-102', user: 'Burna Boy', issue: 'Refund Request', status: 'Pending', priority: 'Medium', date: '5h ago' },
  { id: 'TK-103', user: 'Tems V.', issue: 'Account Access', status: 'Resolved', priority: 'Low', date: '1d ago' },
];

export const mockActivityFeed = [
  { id: 1, action: 'New order placed', target: 'ORD-005', time: '5m ago', type: 'order' },
  { id: 2, action: 'Seller uploaded product', target: 'SneakCity', time: '12m ago', type: 'seller' },
  { id: 3, action: 'Support ticket created', target: 'TK-101', time: '2h ago', type: 'support' },
  { id: 4, action: 'Refund requested', target: 'ORD-004', time: '4h ago', type: 'alert' },
];

export const mockAiInsights = {
  aiConversionRate: '32% faster',
  topSearches: ['Wireless earbuds under $50', 'Black techwear jacket', 'Matte lipsticks'],
  failedSearches: ['Vintage Rolex 1990', 'RTX 5090 Desktop', 'Custom tailored suits'],
  dropOffCategories: ['Home Furniture (45% drop-off)', 'Watches (30% drop-off)']
};
