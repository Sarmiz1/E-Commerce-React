// src/Features/Orders/Tracking/Components/TrackingResult.jsx
// ─── The main tracking result grid: sidebar + details + support ──────────────

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ic } from './TrackingIcons';
import { CopyBadge } from './TrackingAtoms';
import { StatusPanel } from './StatusPanel';
import { FlightTimeline, ItemList, SupportForm } from './TrackingMolecules';
import { computeETA, statusColor } from '../Utils/trackingUtils';
import { formatMoneyMinor } from "../../../../utils/FormatMoneyMinor";

export function TrackingResult({ trackedOrder, updatedAt, refresh, doClear }) {
  const navigate = useNavigate();

  return (
    <div className="pd-result-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 64px' }}>
      
      {/* ── Top bar: ID + controls ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pd-topbar"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <span className="pd-label" style={{ display: 'block', marginBottom: 4 }}>Tracking ID</span>
            <span style={{ fontFamily: 'var(--font-m)', fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>
              #{trackedOrder.order_number || trackedOrder.id.toUpperCase()}
            </span>
          </div>
          <CopyBadge text={trackedOrder.order_number || trackedOrder.id} />
        </div>
        <div className="pd-topbar-btns" style={{ display: 'flex', gap: 8 }}>
          <button className="pd-btn-ghost" onClick={refresh}>
            <Ic.Refresh style={{ width: 12, height: 12 }} /> Refresh
          </button>
          <button className="pd-btn-ghost" onClick={() => navigate('/orders')}>
            <Ic.Bag style={{ width: 12, height: 12 }} /> My Orders
          </button>
          <button className="pd-btn-ghost" onClick={doClear}>
            <Ic.X style={{ width: 12, height: 12 }} /> Clear
          </button>
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="pd-result-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* LEFT: Status sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <StatusPanel order={trackedOrder} updatedAt={updatedAt} onRefresh={refresh} />
        </motion.div>

        {/* RIGHT: Detail scroll */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* ── Flight Timeline ── */}
          <motion.div className="pd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <Ic.Truck style={{ width: 15, height: 15, color: 'var(--amber)', flexShrink: 0 }} />
              <span className="pd-label">Delivery Milestones</span>
            </div>
            <FlightTimeline status={trackedOrder.status} />

            {/* Sub-detail row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 16, marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)',
            }}>
              {[
                ['Status', (trackedOrder.status || '').charAt(0).toUpperCase() + (trackedOrder.status || '').slice(1), statusColor(trackedOrder.status)],
                ['ETA', computeETA(trackedOrder.status, trackedOrder.created_at), null],
                ['Ordered', new Date(trackedOrder.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), null],
                ['Courier', 'WooSho Express', null],
              ].map(([k, v, accent]) => (
                <div key={k}>
                  <p className="pd-label" style={{ marginBottom: 5 }}>{k}</p>
                  <p style={{ fontFamily: 'var(--font-b)', fontWeight: 500, fontSize: 14, color: accent || 'var(--text)' }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Items + Delivery Address in 2-col ── */}
          <div className="pd-inner-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            
            {/* Items */}
            <motion.div className="pd-card pd-card-pad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: '22px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ic.Box style={{ width: 14, height: 14, color: 'var(--cyan)', flexShrink: 0 }} />
                  <span className="pd-label">Items ({trackedOrder.order_items?.length ?? 0})</span>
                </div>
                <span style={{ fontFamily: 'var(--font-m)', fontWeight: 700, fontSize: 13, color: 'var(--amber)' }}>
                  {formatMoneyMinor(trackedOrder.total_minor ?? 0)}
                </span>
              </div>
              <ItemList items={trackedOrder.order_items} />
            </motion.div>

            {/* Delivery address + CTAs */}
            <motion.div className="pd-card pd-card-pad" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ padding: '22px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Ic.Map style={{ width: 14, height: 14, color: '#10B981', flexShrink: 0 }} />
                  <span className="pd-label">Delivery Address</span>
                </div>
                {trackedOrder.shipping ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <p style={{ fontFamily: 'var(--font-b)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                      {trackedOrder.shipping.name}
                    </p>
                    {['address', 'city', 'country'].map((k) => trackedOrder.shipping[k] && (
                      <p key={k} style={{ fontFamily: 'var(--font-b)', fontSize: 13, color: 'var(--text-3)' }}>
                        {k === 'city'
                          ? `${trackedOrder.shipping.city}${trackedOrder.shipping.state ? `, ${trackedOrder.shipping.state}` : ''} ${trackedOrder.shipping.zip || ''}`
                          : trackedOrder.shipping[k]}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: 'var(--font-b)', fontSize: 13, color: 'var(--text-3)' }}>Address not on record</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                {[
                  { label: 'All Orders', icon: <Ic.Bag style={{ width: 13, height: 13 }} />, path: '/orders' },
                  { label: 'Keep Shopping', icon: <Ic.Arrow style={{ width: 13, height: 13 }} />, path: '/products', primary: true },
                ].map((b) => (
                  <button
                    key={b.label}
                    className={b.primary ? 'pd-btn-primary' : 'pd-btn-ghost'}
                    onClick={() => navigate(b.path)}
                    style={{ justifyContent: b.primary ? 'center' : 'flex-start', width: '100%' }}
                  >
                    {b.icon} {b.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Support ── */}
          <motion.div className="pd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <Ic.Chat style={{ width: 14, height: 14, color: 'var(--cyan)', flexShrink: 0 }} />
                  <span className="pd-label">Contact Support</span>
                </div>
                <p style={{ fontFamily: 'var(--font-b)', fontSize: 13, color: 'var(--text-3)' }}>
                  Issue with this delivery? We respond in under 2 hours, 24/7.
                </p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 99, padding: '5px 12px',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pd-pulse 2s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: '#10B981', fontWeight: 600, letterSpacing: '0.1em' }}>ONLINE</span>
              </div>
            </div>
            <SupportForm orderId={trackedOrder.id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
