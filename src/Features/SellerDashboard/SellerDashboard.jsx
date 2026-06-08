import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from "../../Store/useThemeStore";
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import DashSidebar from './Components/DashSidebar';
import DashTopbar from './Components/DashTopbar';
import DashOverview from './Components/DashOverview';
import DashOrders from './Components/DashOrders';
import DashProducts from './Components/DashProducts';
import DashAnalytics from './Components/DashAnalytics';
import DashCustomers from './Components/DashCustomers';
import DashWallet from './Components/DashWallet';
import DashAds from './Components/DashAds';
import DashMarketing from './Components/DashMarketing';
import DashReviews from './Components/DashReviews';
import DashSettings from './Components/DashSettings';
import DashPlan from './Components/DashPlan';
import SalesAssistant from './AI_Sales_Assistant/SalesAssistant';

const SH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  
  .sh-root { font-family: 'Space Grotesk', sans-serif; }
  .sh-mono  { font-family: 'JetBrains Mono', monospace; }

  @keyframes sh-up { from { transform: translateY(3px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .sh-trend { animation: sh-up 0.3s ease-out forwards; }

  @keyframes sh-dot { 0%,100%{ box-shadow: 0 0 0 0 rgba(255,80,80,0.5); } 55%{ box-shadow: 0 0 0 6px rgba(255,80,80,0); } }
  .sh-dot { animation: sh-dot 2s ease-out infinite; }

  @keyframes sh-draw { from { stroke-dashoffset: var(--len); } to { stroke-dashoffset: 0; } }
  .sh-spark { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: sh-draw 1s ease-out 0.6s forwards; }
  
  .sh-tr { transition: background 0.12s; }
  .sh-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
`;

const PAGE_MAP = {
  overview:  () => <DashOverview />,
  ai_sales_assistant: () => <SalesAssistant />,
  orders:    () => <DashOrders />,
  products:  () => <DashProducts />,
  analytics: () => <DashAnalytics />,
  customers: () => <DashCustomers />,
  wallet:    () => <DashWallet />,
  plan:      () => <DashPlan />,
  ads:       () => <DashAds />,
  marketing: () => <DashMarketing />,
  reviews:   () => <DashReviews />,
  settings:  () => <DashSettings />,
};

function DashboardInner() {
  const { colors } = useTheme();
  const { activePage } = useDashboard();

  const isAI = activePage === 'ai_sales_assistant';

  const ELECTRIC = colors?.brand?.electricBlue || "#0050d4";
  const NEON     = colors?.brand?.neonGreen     || "#00FF94";

  return (
    <div className="sh-root flex min-h-screen mb-5 relative" style={{ background: colors.surface.primary, color: colors.text.primary }}>
      <style>{SH_STYLES}</style>
      
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-64 -right-64 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `${ELECTRIC}08` }} />
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `${NEON}06` }} />
      </div>

      <DashSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
        <DashTopbar />
        <main
          className={`flex-1 ${isAI ? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'}`}
          style={{ minHeight: 0 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={isAI ? 'h-full' : ''}
            >
              {PAGE_MAP[activePage] ? PAGE_MAP[activePage]() : <DashOverview />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
}
