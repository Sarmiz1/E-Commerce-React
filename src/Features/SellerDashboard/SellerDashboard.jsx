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

const PAGE_MAP = {
  overview:  <DashOverview />,
  orders:    <DashOrders />,
  products:  <DashProducts />,
  analytics: <DashAnalytics />,
  customers: <DashCustomers />,
  wallet:    <DashWallet />,
  marketing: <DashMarketing />,
  reviews:   <DashReviews />,
  settings:  <DashSettings />,
};

function DashboardInner() {
  const { colors } = useTheme();
  const { activePage } = useDashboard();

  return (
    <div className="flex min-h-screen" style={{ background: colors.surface.primary }}>
      <DashSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DashTopbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
