import React from 'react';
import { 
  mockMetrics, mockOrders, mockProducts, mockSellers, mockTickets, mockActivityFeed, mockAiInsights 
} from '../components/data/mockAdminData'
import { MetricCard, DataTable, StatusBadge } from '../components/AdminComponents';
import { Sparkles, ArrowRight, Download, Filter } from 'lucide-react';

// -------------------------------------------------------------
// 1. OVERVIEW VIEW
// -------------------------------------------------------------
export function OverviewView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Overview</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total Revenue" value={mockMetrics.totalRevenue.value} change={mockMetrics.totalRevenue.change} trend={mockMetrics.totalRevenue.trend} />
        <MetricCard title="Total Orders" value={mockMetrics.totalOrders.value} change={mockMetrics.totalOrders.change} trend={mockMetrics.totalOrders.trend} />
        <MetricCard title="Active Users" value={mockMetrics.activeUsers.value} change={mockMetrics.activeUsers.change} trend={mockMetrics.activeUsers.trend} />
        <MetricCard title="Conversion Rate" value={mockMetrics.conversionRate.value} change={mockMetrics.conversionRate.change} trend={mockMetrics.conversionRate.trend} />
        <MetricCard title="Pending Orders" value={mockMetrics.pendingOrders.value} change={mockMetrics.pendingOrders.change} trend={mockMetrics.pendingOrders.trend} />
        <MetricCard title="Support Tickets" value={mockMetrics.supportTickets.value} change={mockMetrics.supportTickets.change} trend={mockMetrics.supportTickets.trend} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Fake Sales Graph Area */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
           <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
           <div className="h-64 flex items-end gap-2">
             {/* Simple CSS bars for mock graph */}
             {[40, 60, 45, 80, 50, 90, 70, 100, 85, 110, 95, 120].map((h, i) => (
               <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-600 transition-colors rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                   ${h}k
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Live Activity</h3>
          <div className="space-y-6">
            {mockActivityFeed.map(feed => (
              <div key={feed.id} className="flex items-start gap-4">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                  feed.type === 'order' ? 'bg-green-500' : 
                  feed.type === 'support' ? 'bg-blue-500' : 
                  feed.type === 'alert' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{feed.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{feed.target} • {feed.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. ORDERS VIEW
// -------------------------------------------------------------
export function OrdersView() {
  const columns = [
    { header: 'Order ID', accessor: 'id', cell: row => <span className="font-bold">{row.id}</span> },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Product', accessor: 'product' },
    { header: 'Date', accessor: 'date' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Payment', accessor: 'payment', cell: row => <StatusBadge status={row.payment} /> },
    { header: 'Status', accessor: 'status', cell: row => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Orders</h2>
        <div className="flex gap-2">
          <button className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"><Filter size={18} /></button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <DataTable columns={columns} data={mockOrders} />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. AI INSIGHTS VIEW (The Crown Jewel)
// -------------------------------------------------------------
export function AiInsightsView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-purple-600" /> AI Infrastructure Insights
          </h2>
          <p className="text-gray-500 mt-1">Intelligence layer performance and search metrics.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Insight Card 1 */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-8">
          <div className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4">Conversion Alpha</div>
          <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            {mockAiInsights.aiConversionRate}
          </h3>
          <p className="text-gray-700 font-medium leading-relaxed">
            Users who interact with the Woosho AI Assistant convert significantly faster than users relying on standard manual search and category browsing.
          </p>
        </div>

        {/* Insight Card 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Failed Search Intents (Opportunity)</div>
          <p className="text-gray-500 mb-6">Products users asked AI for, but yielded 0 marketplace results. Prioritize onboarding sellers for these items.</p>
          <ul className="space-y-3">
            {mockAiInsights.failedSearches.map((item, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg text-sm font-medium text-gray-800">
                {item}
                <button className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  Source Sellers <ArrowRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
         {/* Top Searches */}
         <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top AI Queries (7 Days)</h3>
            <div className="space-y-4">
              {mockAiInsights.topSearches.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">#{i+1}</div>
                  <div className="font-medium text-gray-900">{item}</div>
                </div>
              ))}
            </div>
         </div>
         {/* Drop off */}
         <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">High Drop-off Categories</h3>
            <div className="space-y-4">
              {mockAiInsights.dropOffCategories.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <div className="font-medium text-gray-900">{item}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-6">Action: Review pricing competitiveness and image quality in these categories.</p>
         </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. SELLERS VIEW (Marketplace Control)
// -------------------------------------------------------------
export function SellersView() {
  const columns = [
    { header: 'Seller', accessor: 'name', cell: row => <span className="font-bold">{row.name}</span> },
    { header: 'Revenue', accessor: 'revenue' },
    { header: 'Products', accessor: 'products' },
    { header: 'Status', accessor: 'status', cell: row => <StatusBadge status={row.status} /> },
    { header: 'Verification', accessor: 'verified', cell: row => (
      row.verified ? <span className="text-green-600 font-medium">Verified</span> : <span className="text-yellow-600 font-medium">Pending Review</span>
    )},
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sellers</h2>
          <p className="text-gray-500 mt-1">Manage marketplace vendors and approvals.</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
          Onboard Seller
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <DataTable columns={columns} data={mockSellers} />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. PRODUCTS VIEW
// -------------------------------------------------------------
export function ProductsView() {
  const columns = [
    { header: 'Product', accessor: 'name', cell: row => <span className="font-bold">{row.name}</span> },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'price' },
    { header: 'Stock', accessor: 'stock', cell: row => (
       <span className={`${row.stock === 0 ? 'text-red-500 font-bold' : 'text-gray-900'}`}>{row.stock}</span>
    )},
    { header: 'Seller', accessor: 'seller' },
    { header: 'Status', accessor: 'status', cell: row => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Products Inventory</h2>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <DataTable columns={columns} data={mockProducts} />
      </div>
    </div>
  );
}

// Placeholder view for other modules
export function PlaceholderView({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-200 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-black text-gray-300 uppercase tracking-widest">{title} Module</h2>
      <p className="text-gray-400 mt-2 font-medium">This module is currently under construction.</p>
    </div>
  );
}
