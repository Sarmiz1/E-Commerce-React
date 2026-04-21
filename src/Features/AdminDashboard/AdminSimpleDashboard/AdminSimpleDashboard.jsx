import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Box, Users, Store, BarChart3, 
  LifeBuoy, Sparkles, Briefcase, Settings, LogOut, Hexagon
} from 'lucide-react';
import { AdminTopbar } from './components/AdminComponents';
import { 
  OverviewView, OrdersView, ProductsView, SellersView, AiInsightsView, PlaceholderView 
} from './views/AdminViews';

const SIDEBAR_NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: Box },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sellers', label: 'Sellers', icon: Store },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'support', label: 'Support', icon: LifeBuoy },
  { id: 'ai', label: 'AI Insights', icon: Sparkles },
  { id: 'hiring', label: 'Hiring', icon: Briefcase },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminSimpleDashboard() {
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    // Scroll to top on view change
    window.scrollTo(0, 0);
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <OverviewView />;
      case 'orders': return <OrdersView />;
      case 'products': return <ProductsView />;
      case 'sellers': return <SellersView />;
      case 'ai': return <AiInsightsView />;
      case 'users': return <PlaceholderView title="Users" />;
      case 'analytics': return <PlaceholderView title="Analytics" />;
      case 'support': return <PlaceholderView title="Support Ticketing" />;
      case 'hiring': return <PlaceholderView title="Hiring Pipeline" />;
      case 'settings': return <PlaceholderView title="Settings & Config" />;
      default: return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans text-gray-900 selection:bg-blue-600/30">
      
      {/* 🧭 LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0E0E10] text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 font-black text-xl uppercase tracking-tighter">
            <Hexagon className="text-blue-500 fill-blue-500/20" size={24} />
            Woosho <span className="text-gray-500">OS</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {SIDEBAR_NAV.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                {item.label}
                {item.id === 'support' && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* 🧭 MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <AdminTopbar />
        
        <div className="p-8 pb-24 max-w-[1600px] w-full mx-auto flex-1">
           {renderView()}
        </div>
      </main>

    </div>
  );
}
