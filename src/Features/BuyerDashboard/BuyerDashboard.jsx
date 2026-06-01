import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from "../../Store/useThemeStore";
import { BuyerProvider, useBuyer } from './context/BuyerContext';
import PageErrorFallback from '../../Components/PageErrorFallback';
import BuyerDashboardFallback from './Components/BuyerDashboardFallback';
import BuyerSidebar from './Components/BuyerSidebar';
import BuyerTopbar from './Components/BuyerTopbar';
const BuyerOverview = lazy(() => import('./Components/BuyerOverview'));
const BuyerAI = lazy(() => import('./Components/BuyerAI'));
const BuyerOrders = lazy(() => import('./Components/BuyerOrders'));
const BuyerWishlist = lazy(() => import('./Components/BuyerWishlist'));
const BuyerWallet = lazy(() => import('./Components/BuyerWallet'));
const BuyerCredits = lazy(() => import('./Components/BuyerCredits'));
const BuyerAnalytics = lazy(() => import('./Components/BuyerAnalytics'));
const BuyerSettings = lazy(() => import('./Components/BuyerSettings'));
const BuyerAddresses = lazy(() => import('./Components/BuyerAddressPayment')
  .then((module) => ({ default: module.BuyerAddresses })));
const BuyerPayments = lazy(() => import('./Components/BuyerAddressPayment')
  .then((module) => ({ default: module.BuyerPayments })));
const BuyerReviews = lazy(() => import('./Components/BuyerReviewsNotifs')
  .then((module) => ({ default: module.BuyerReviews })));
const BuyerNotifications = lazy(() => import('./Components/BuyerReviewsNotifs')
  .then((module) => ({ default: module.BuyerNotifications })));

// ─── Render functions (not static JSX) so each page mounts cleanly ─────────────
const PAGES = {
  overview:  () => <BuyerOverview />,
  ai:        () => <BuyerAI />,
  orders:    () => <BuyerOrders />,
  wishlist:  () => <BuyerWishlist />,
  wallet:    () => <BuyerWallet />,
  credits:   () => <BuyerCredits />,
  analytics: () => <BuyerAnalytics />,
  addresses: () => <BuyerAddresses />,
  payments:  () => <BuyerPayments />,
  reviews:   () => <BuyerReviews />,
  notifs:    () => <BuyerNotifications />,
  settings:  () => <BuyerSettings />,
};

// ─── Floating AI Button ────────────────────────────────────────────────────────
function FloatingAI() {
  const { page, setPage } = useBuyer();
  const [tooltip, setTooltip] = useState(false);

  // Don't show the button when the AI page is already active
  if (page === 'ai') return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.6 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
            }}>
            ✦ Ask my AI anything
            {/* Arrow */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45"
              style={{ background: '#764ba2' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onClick={() => setPage('ai')}
        onHoverStart={() => setTooltip(true)}
        onHoverEnd={() => setTooltip(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>

        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
        />

        {/* Sparkle icon */}
        <span className="relative z-10 text-xl select-none">✦</span>
      </motion.button>
    </motion.div>
  );
}

function BuyerSectionFallback(props) {
  return (
    <PageErrorFallback
      {...props}
      compact
      showHome={false}
      title="This dashboard section could not load"
      message="The rest of your dashboard is still available. Try this section again or choose another one from the menu."
    />
  );
}

function BuyerSectionLoading() {
  const { colors } = useTheme();

  return (
    <div
      className="rounded-2xl p-6 text-sm font-semibold"
      style={{ background: colors.surface.elevated, color: colors.text.tertiary }}
    >
      Loading dashboard section...
    </div>
  );
}

// ─── Inner shell ──────────────────────────────────────────────────────────────
function BuyerDashboardInner() {
  const { colors } = useTheme();
  const { page, sidebarOpen, setSidebarOpen, loadError, refresh, refreshing } = useBuyer();
  const renderPage = PAGES[page] ?? PAGES.overview;

  return (
    <div className="flex min-h-screen" style={{ background: colors.surface.primary }}>
      <BuyerSidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <BuyerTopbar />

        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          {loadError && (
            <div
              className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              role="status"
            >
              <p className="text-sm font-semibold text-amber-900">
                Some dashboard data could not be loaded. You can keep browsing or retry the sync.
              </p>
              <button
                type="button"
                onClick={() => refresh()}
                disabled={refreshing}
                className="self-start rounded-xl bg-amber-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-amber-800 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
              >
                {refreshing ? 'Retrying...' : 'Retry sync'}
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}>
              <ErrorBoundary
                FallbackComponent={BuyerSectionFallback}
                resetKeys={[page]}
              >
                <Suspense fallback={<BuyerSectionLoading />}>
                  {renderPage()}
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile Sidebar (Moved here for better z-index isolation) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[210] w-[280px] lg:hidden overflow-hidden shadow-2xl bg-white"
          >
            <BuyerSidebar mobileMode={true} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating AI assistant button */}
      <AnimatePresence>
        <FloatingAI key="floatingAI" />
      </AnimatePresence>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function BuyerDashboard() {
  return (
    <ErrorBoundary
      FallbackComponent={BuyerDashboardFallback}
      onReset={() => window.location.reload()}
    >
      <BuyerProvider>
        <BuyerDashboardInner />
      </BuyerProvider>
    </ErrorBoundary>
  );
}
