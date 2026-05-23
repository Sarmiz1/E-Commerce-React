// src/Features/Orders/Tracking/TrackingPage.jsx
//
// ── REDESIGN: "Precision Dispatch" editorial dark theme ──────────────────────
//  Fonts: Bricolage Grotesque (display) + JetBrains Mono (data) + DM Sans (body)
//  Palette: Deep navy #060B14 · Amber #F5A623 · Cyan #00C2FF · Warm white #E8E4DA
//
// ── ORCHESTRATOR ─────────────────────────────────────────────────────────────

import { AnimatePresence, motion } from 'framer-motion';
import { Ic } from './Components/TrackingIcons';
import { ScanningState, NotFound, HowItWorks } from './Components/TrackingMolecules';
import { TrackingHero } from './Components/TrackingHero';
import { TrackingResult } from './Components/TrackingResult';
import { TRACKING_STYLES } from './Components/TrackingStyles';

// Hooks
import { useTrackingSearch } from './hooks/useTrackingSearch';
import { useOrderTracking } from './hooks/useOrderTracking';

export default function TrackingPage() {
  const {
    inputVal, setInputVal,
    trackedId, isSearching,
    doSearch, doClear, inputRef,
  } = useTrackingSearch();

  const {
    orders, ordersLoading,
    trackedOrder, isQueryLoading,
    updatedAt, refresh,
  } = useOrderTracking(trackedId);

  const isBusy = isSearching || isQueryLoading;
  const isNotFound = trackedId && !isBusy && !trackedOrder;
  const showResult = trackedOrder && !isBusy;
  const showHowItWorks = !trackedOrder && !isBusy;

  return (
    <div className="pd-root pt-10">
      <style>{TRACKING_STYLES}</style>

      {/* Hero Section */}
      <TrackingHero
        inputVal={inputVal}
        setInputVal={setInputVal}
        doSearch={doSearch}
        doClear={doClear}
        isSearching={isSearching}
        isQueryLoading={isQueryLoading}
        orders={orders}
        ordersLoading={ordersLoading}
        trackedId={trackedId}
        trackedOrder={trackedOrder}
        inputRef={inputRef}
      />

      {/* Scanning State */}
      <AnimatePresence>
        {isBusy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScanningState />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not Found */}
      <AnimatePresence>
        {isNotFound && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NotFound trackedId={trackedId} onClear={doClear} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracking Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TrackingResult
              trackedOrder={trackedOrder}
              updatedAt={updatedAt}
              refresh={refresh}
              doClear={doClear}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State (How It Works) */}
      {showHowItWorks && <HowItWorks />}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        <Ic.Signal style={{ width: 14, height: 14, color: 'var(--text-3)' }} />
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-3)',
          letterSpacing: '0.12em', textTransform: 'uppercase'
        }}>
          WooSho Precision Logistics · Real-time tracking powered by AI
        </span>
      </div>
    </div>
  );
}