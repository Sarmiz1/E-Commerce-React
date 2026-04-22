import React, { useRef, useEffect } from 'react';
import { ArrowRight, Store, Zap, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { icon: Store, label: 'Create your store', sub: '2 minutes to set up', color: '#6366f1' },
  { icon: Zap, label: 'AI lists your products', sub: 'Upload a photo — done', color: '#f59e0b' },
  { icon: CreditCard, label: 'Get paid in 48 hours', sub: 'Automatic payouts', color: '#10b981' },
];

export default function Section9_Cta() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-step',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-28 relative overflow-hidden" style={{ background: '#060612' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Animated ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.06)', pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.04)', pointerEvents: 'none' }}
      />

      <div className="relative z-10 w-full max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
            🚀 Get Started
          </div>

          <h2 className="font-black tracking-tight text-white mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05 }}>
            60,000 buyers are<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              looking for you.
            </span>
          </h2>

          <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 48px' }}>
            Right now, buyers are scrolling the Woosho feed. Some are looking for exactly what you sell. They just can't find you yet.
          </p>
        </motion.div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {STEPS.map(({ icon: Icon, label, sub, color }, i) => (
            <div key={i} className="cta-step" style={{ padding: '20px', borderRadius: 20, background: `${color}08`, border: `1px solid ${color}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f9fafb' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(99,102,241,0.5)' }}
            whileTap={{ scale: 0.96 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 40px', borderRadius: 99, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 30px rgba(99,102,241,0.35)' }}
          >
            Create My Store — It's Free <ArrowRight size={20} />
          </motion.button>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['No credit card needed', 'Cancel anytime', 'Payout in 48hrs'].map((text, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#10b981' }}>✓</span> {text}
              </span>
            ))}
          </div>
        </div>

        {/* Social proof strip */}
        <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex' }}>
            {['https://i.pravatar.cc/32?img=1','https://i.pravatar.cc/32?img=5','https://i.pravatar.cc/32?img=9','https://i.pravatar.cc/32?img=15','https://i.pravatar.cc/32?img=20'].map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #060612', marginLeft: i === 0 ? 0 : -10, objectFit: 'cover' }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>
            Join <span style={{ color: '#fff', fontWeight: 800 }}>60,000+</span> sellers already growing with Woosho
          </span>
        </div>
      </div>
    </div>
  );
}
