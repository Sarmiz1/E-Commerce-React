import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../Context/theme/ThemeContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import DashSidebar from './components/DashSidebar';
import DashTopbar from './components/DashTopbar';
import DashOverview from './components/DashOverview';
import DashOrders from './components/DashOrders';
import DashProducts from './components/DashProducts';
import DashAnalytics from './components/DashAnalytics';
import DashCustomers from './components/DashCustomers';
import DashWallet from './components/DashWallet';
import DashMarketing from './components/DashMarketing';
import DashReviews from './components/DashReviews';
import DashSettings from './components/DashSettings';
import DashPlan from './components/DashPlan';
import SalesAssistant from './AI_Sales_Assistant/SalesAssistant';

const PAGE_MAP = {
  overview:  <DashOverview />,
  ai_sales_assistant: <SalesAssistant />,
  orders:    <DashOrders />,
  products:  <DashProducts />,
  analytics: <DashAnalytics />,
  customers: <DashCustomers />,
  wallet:    <DashWallet />,
  plan:      <DashPlan />,
  marketing: <DashMarketing />,
  reviews:   <DashReviews />,
  settings:  <DashSettings />,
};

function DashboardInner() {
  const { colors } = useTheme();
  const { activePage } = useDashboard();

  const isAI = activePage === 'ai_sales_assistant';

  return (
    <div className="flex min-h-screen mb-5" style={{ background: colors.surface.primary }}>
      <DashSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
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
              {PAGE_MAP[activePage] || <DashOverview />}
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
