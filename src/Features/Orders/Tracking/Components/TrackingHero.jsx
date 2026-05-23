// src/Features/Orders/Tracking/Components/TrackingHero.jsx
// ─── Hero section: headline, search bar, recent-order pills, ticker ───────────

import { motion } from 'framer-motion';
import { Ic, Spinner } from './TrackingIcons';
import { Ticker } from './TrackingMolecules';

export function TrackingHero({
  inputVal, setInputVal, doSearch, doClear,
  isSearching, isQueryLoading,
  orders, ordersLoading,
  trackedId, trackedOrder,
  inputRef,
}) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, var(--bg-2) 0%, var(--bg) 100%)',
      borderBottom: '1px solid var(--border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025,
        backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }} />
      {/* Amber glow — clipped inside hero, no overflow bleed */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-5%',
        width: 'min(500px, 80vw)', height: 'min(500px, 80vw)', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="pd-hero-pad" style={{ maxWidth: 700, margin: '0 auto', padding: '72px 24px 56px', position: 'relative', zIndex: 1 }}>

        {/* Eyebrow */}
        <div className="pd-animate-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ height: 1, width: 32, background: 'var(--amber)', opacity: 0.5 }} />
          <span style={{ fontFamily: 'var(--font-m)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase' }}>
            Precision Logistics
          </span>
          <div style={{ height: 1, width: 32, background: 'var(--amber)', opacity: 0.5 }} />
        </div>

        {/* Headlines */}
        <h1 className="pd-animate-up pd-hero-title" style={{
          fontFamily: 'var(--font-d)', fontSize: 'clamp(64px, 10vw, 96px)',
          fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 0.95,
          color: 'var(--text)', textAlign: 'center', marginBottom: 8, animationDelay: '0.05s',
        }}>
          Track Your
        </h1>
        <h1 className="pd-animate-up pd-hero-title" style={{
          fontFamily: 'var(--font-d)', fontSize: 'clamp(64px, 10vw, 96px)',
          fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 0.95,
          color: 'var(--amber)', textAlign: 'center', marginBottom: 36, animationDelay: '0.12s',
        }}>
          Delivery
          <span style={{ animation: 'pd-blink 1.1s step-end infinite', color: 'var(--text-3)' }}>_</span>
        </h1>

        {/* Search bar */}
        <div className="pd-animate-up" style={{ animationDelay: '0.2s' }}>
          <div className="pd-search-row" style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div className="pd-input-wrap" style={{ flex: 1, position: 'relative' }}>
              <Ic.Search style={{ width: 16, height: 16, position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder="Paste order ID — e.g. SE-20481234"
              />
              {inputVal && (
                <button onClick={doClear} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4,
                  display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                }}>
                  <Ic.X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>
            <button
              className="pd-btn-primary"
              onClick={() => doSearch()}
              disabled={!inputVal.trim() || isSearching || isQueryLoading}
            >
              {(isSearching || isQueryLoading) ? <Spinner size={14} /> : <Ic.Search style={{ width: 14, height: 14 }} />}
              <span>{(isSearching || isQueryLoading) ? 'Scanning…' : 'Track'}</span>
            </button>
          </div>

          {/* Recent-order pills */}
          {!ordersLoading && orders.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <p className="pd-label" style={{ marginBottom: 10 }}>Recent Orders</p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="pd-scroll">
                {orders.slice(0, 8).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setInputVal(o.id); doSearch(o.id); }}
                    style={{
                      flexShrink: 0, padding: '7px 14px', borderRadius: 99,
                      fontFamily: 'var(--font-m)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                      cursor: 'pointer', transition: 'all 0.15s',
                      background: trackedId === o.id ? 'rgba(245,166,35,0.12)' : 'var(--bg-2)',
                      color:      trackedId === o.id ? 'var(--amber)' : 'var(--text-3)',
                      border: `1px solid ${trackedId === o.id ? 'rgba(245,166,35,0.3)' : 'var(--border-2)'}`,
                    }}
                  >
                    #{o.id.slice(0, 8).toUpperCase()}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Live ticker — only when an order is loaded */}
      {trackedOrder && <Ticker order={trackedOrder} />}
    </div>
  );
}
