import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, SearchX, MousePointerClick, 
  Brain, Zap, ShieldCheck, Globe2, Layers, CheckCircle2, ShoppingBag, Unlink   
} from 'lucide-react';
import ModernNavbar from '../Marketting/ModernLanding/SharedComponents/ModernNavbar';
import { ModernFooter } from '../Marketting/ModernLanding/SharedComponents/ModernFooter';
import { useTheme } from '../../Context/theme/ThemeContext';
// Reusing generic lucide icons for missing ones
import { Package, Search } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PROBLEMS = [
  { icon: SearchX, title: 'Irrelevant Discovery', desc: 'Too many irrelevant products cluttering the shopping experience.' },
  { icon: MousePointerClick, title: 'Decision Fatigue', desc: 'Endless scrolling leads to overwhelming choices and cart abandonment.' },
  { icon: Unlink , title: 'Poor Connection', desc: 'A fragmented ecosystem between genuine buyers and the right products.' }
];

const DIFFERENCES = [
  { icon: Brain, title: 'AI-Assisted Shopping', desc: 'On-demand intelligence that understands your search intent.' },
  { icon: Zap, title: 'Smart Comparison', desc: 'Instantly evaluate products based on specs, price, and reviews.' },
  { icon: ShoppingBag, title: 'Curated Ecosystem', desc: 'A vetted network of premium brands and trusted sellers.' },
  { icon: Layers, title: 'Fast Checkout', desc: 'Frictionless, one-click purchase flows designed for conversion.' },
  { icon: Globe2, title: 'Built for Scale', desc: 'Designed mobile-first for Africa, engineered for global commerce.' }
];

const TRUST_PILLARS = [
  { title: 'Secure Payments', desc: 'Bank-grade encryption powered by Paystack.', icon: ShieldCheck },
  { title: 'Verified Sellers', desc: 'Every merchant undergoes strict KYC vetting.', icon: CheckCircle2 },
  { title: 'Structured Logistics', desc: 'Reliable, trackable nationwide delivery network.', icon: Package },
  { title: 'Transparent Transactions', desc: 'No hidden fees. Full escrow protection.', icon: Search }
];



export default function AboutPage() {
  const mainRef = useRef(null);
  const { isDark } = useTheme();

  const bg = isDark ? '#050505' : '#ffffff';
  const textPrimary = isDark ? '#fff' : '#0f172a';
  const textMuted = isDark ? '#9ca3af' : '#64748b';
  const cardBg = isDark ? 'rgba(39,39,42,0.5)' : 'rgba(248,250,252,0.9)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  const sectionBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal-up').forEach(el => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
        );
      });
      gsap.utils.toArray('.stagger-grid').forEach(grid => {
        gsap.fromTo(grid.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: grid, start: 'top 80%' } }
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen selection:bg-blue-600/30" style={{ fontFamily: "'Inter', sans-serif", background: bg, color: textPrimary }}>
      <ModernNavbar navLinks={[
        { label: 'Shop',       href: '/products' },
        { label: 'Brands',     href: '/brands' },
        { label: 'Support',    href: '/support' },
        { label: 'About',      href: '/about' },
      ]} />

      {/* 1. HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]"
          >
            Redefining <br className="hidden md:block"/> How People <br className="hidden md:block"/> Shop Online.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-400 font-medium mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Woosho is an AI-powered commerce platform that helps people discover, compare, and buy products faster and smarter.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/products" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white transition-colors">
              Start Shopping
            </Link>
            <Link to="/seller" className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-white/20 font-bold uppercase tracking-widest text-sm hover:border-white transition-colors">
              Start Selling
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-white/5">
        <div className="reveal-up text-center mb-16">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">The Status Quo</h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Online Shopping Is Too Slow<br/>And Overwhelming.</h3>
        </div>
        <div className="stagger-grid grid md:grid-cols-3 gap-8">
          {PROBLEMS.map((prob, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/5 p-10 flex flex-col items-center text-center hover:bg-zinc-900 transition-colors">
              <prob.icon size={40} className="text-gray-500 mb-6" />
              <h4 className="text-2xl font-bold text-white mb-4">{prob.title}</h4>
              <p className="text-gray-400 leading-relaxed">{prob.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="reveal-up bg-blue-600 text-white p-12 md:p-24 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
          <h2 className="relative z-10 text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none max-w-4xl">
            Woosho Makes Commerce Intelligent.
          </h2>
          <p className="relative z-10 text-xl md:text-2xl text-blue-100 max-w-3xl mb-12 font-medium">
            We use AI to understand what you're looking for, improve product discovery, and help you compare and decide faster.
          </p>
          <div className="relative z-10 inline-block border-2 border-white/20 px-8 py-4 font-black uppercase tracking-widest text-lg bg-black/10 backdrop-blur-sm">
            Less searching. More buying confidence.
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (SIMPLIFIED) */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-up">
            <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4">How It Works</h2>
            <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-8">Intelligence On Demand.</h3>
            <div className="space-y-8">
              {[
                { step: '01', text: 'Users search or browse products across our curated marketplace.' },
                { step: '02', text: 'The AI helps filter and compare options based on exact specifications.' },
                { step: '03', text: 'Users make faster, better decisions with total confidence.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="font-black text-3xl text-gray-700 leading-none">{item.step}</div>
                  <p className="text-xl text-gray-300 font-medium pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-up bg-zinc-900 border border-white/5 aspect-square relative flex items-center justify-center p-8 overflow-hidden group">
             <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
             <Brain size={120} className="text-white/20 relative z-10" />
          </div>
        </div>
      </section>

      {/* 5. WHAT MAKES WOOSHO DIFFERENT */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-white/5">
        <div className="reveal-up text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white max-w-3xl mx-auto leading-none">
            Not a Marketplace.<br/><span className="text-gray-500">A Decision System.</span>
          </h2>
        </div>
        <div className="stagger-grid grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {DIFFERENCES.map((diff, i) => (
            <div key={i} className="bg-zinc-900/30 border border-white/5 p-8 flex flex-col hover:bg-zinc-900 transition-colors">
              <diff.icon size={24} className="text-white mb-6" />
              <h4 className="text-lg font-bold text-white mb-2">{diff.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{diff.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. VISION SECTION */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="reveal-up relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-8 leading-none">
            Built in Nigeria. <br/> Designed for Global Commerce.
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed">
            Woosho starts by solving shopping complexity in Africa, with a long-term vision of becoming a global AI commerce infrastructure layer powering smarter retail experiences everywhere.
          </p>
        </div>
      </section>

      {/* 7. TRUST / CREDIBILITY */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-white/5">
        <div className="stagger-grid grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {TRUST_PILLARS.map((pillar, i) => (
            <div key={i} className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <pillar.icon size={24} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{pillar.title}</h4>
              <p className="text-sm text-gray-500 max-w-[200px] mx-auto">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CALL TO ACTION */}
      <section className="py-32 px-6 text-center border-t border-white/5 bg-zinc-900/20">
        <div className="reveal-up max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-10">Join The Future.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products" className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white transition-colors">
              Start Shopping Smarter
            </Link>
            <Link to="/seller" className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border border-white/20 font-bold uppercase tracking-widest text-sm hover:border-white transition-colors">
              Become a Seller
            </Link>
          </div>
          <div className="mt-8">
            <Link to="/analytics" className="text-sm font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              Explore Platform Infrastructure <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
}
