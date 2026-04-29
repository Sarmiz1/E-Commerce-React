import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatMoneyCurrency } from '../../../../Utils/formatMoneyCents';

// FIX: removed gsap.registerPlugin(ScrollTrigger) — registered once in SellerLanding.jsx

function Notification({ icon, title, sub, time, color, delay }) {
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 16,
        padding: '12px 16px',
        backdropFilter: 'blur(12px)',
        marginBottom: 10,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${color}22`, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{sub}</div>
      </div>
      <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, flexShrink: 0 }}>{time}</div>
    </motion.div>
  );
}

const NOTIFICATIONS = [
  { icon: '🛍️', title: `New Order — ${formatMoneyCurrency(2450000)}`, sub: 'Nike Air Force 1 · Chidi O.', color: '#10b981', time: '6:47 AM', delay: 0.2 },
  { icon: '⚡', title: 'AI replied to DM', sub: '"When will it ship?" answered automatically', color: '#6366f1', time: '7:12 AM', delay: 0.7 },
  { icon: '📦', title: 'Order dispatched', sub: 'Item #WS-0041 shipped to Abuja', color: '#f59e0b', time: '9:01 AM', delay: 1.2 },
  { icon: '💰', title: `Payout credited`, sub: `${formatMoneyCurrency(18240000)} sent to your account`, color: '#22d3ee', time: '12:00 PM', delay: 1.7 },
  { icon: '🔥', title: '47 visitors on your store', sub: 'Sneakers collection is trending', color: '#ec4899', time: '3:30 PM', delay: 2.2 },
  { icon: '🛍️', title: `New Order — ${formatMoneyCurrency(6700000)}`, sub: 'Premium Headset · Fatima B.', color: '#10b981', time: '6:00 PM', delay: 2.7 },
];

const icons = [
  { icon: '🤖', text: 'AI answers customer questions 24/7' },
  { icon: '📝', text: 'Auto-generates product descriptions' },
  { icon: '💸', text: 'Payouts within 48 hours, automatically' },
]

export default function Section3_Dream() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        onEnter: () => setVisible(true),
        // FIX: removed onLeaveBack: () => setVisible(false).
        //
        // When the user scrolled back up, setting visible=false unmounted all 6
        // Notification children simultaneously. AnimatePresence fired all 6 exit
        // animations at once while the parent SellerLanding reverse animation
        // was also playing — the double-reset caused the visible flash.
        //
        // Leaving notifications mounted on scroll-back is the correct UX:
        // the user has already seen them, no need to reset. If you want
        // a hard reset on re-entry, use `onEnterBack` to set visible=false
        // first and re-trigger on the next tick via setTimeout.
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center gap-16 px-6 md:px-16 py-28"
      style={{ background: 'linear-gradient(to bottom, #070712, #0a0a0a)' }}
    >
      {/* Left: Copy */}
      <div className="flex-1 max-w-lg">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          ✦ Automation
        </div>

        <h2
          className="font-black tracking-tight text-white mb-6"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}
        >
          What if your store<br />
          <span style={{ color: '#6366f1' }}>ran itself?</span>
        </h2>

        <p style={{ fontSize: 16, color: '#9ca3af', lineHeight: 1.8, marginBottom: 32 }}>
          Adaeze wakes up to new orders, auto-replied DMs, and a fresh payout — all without
          touching her phone. That's a Woosho seller's day.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {icons.map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: '#d1d5db', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Phone mockup with live notifications */}
      <div className="flex-shrink-0 relative">
        <div style={{
          position: 'absolute', inset: -40,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: 300,
          background: '#0d0d14',
          border: '8px solid #1c1c28',
          borderRadius: 44,
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Status bar */}
          <div style={{ padding: '14px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>9:41 AM</span>
            <div style={{ width: 60, height: 16, background: '#1c1c28', borderRadius: 99 }} />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>◼◼◼</span>
          </div>

          {/* Lock screen */}
          <div style={{ padding: '8px 16px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Woosho Seller
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{formatMoneyCurrency(27490000)}</div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>↑ 23% today</div>
            </div>

            <div style={{ maxHeight: 380, overflow: 'hidden' }}>
              <AnimatePresence>
                {visible && NOTIFICATIONS.map((n) => (
                  <Notification key={n.title} {...n} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 20, right: -50,
            background: '#10b981', borderRadius: 14,
            padding: '8px 14px', fontSize: 12, fontWeight: 800,
            color: '#fff', whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
          }}
        >
          +{formatMoneyCurrency(2450000)} 💰
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', bottom: 40, left: -60,
            background: '#6366f1', borderRadius: 14,
            padding: '8px 14px', fontSize: 12, fontWeight: 800,
            color: '#fff', whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}
        >
          AI replied ⚡
        </motion.div>
      </div>
    </div>
  );
}