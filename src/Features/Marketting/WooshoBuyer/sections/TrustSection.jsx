import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, CreditCard, Truck, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  { icon: Shield, text: "Secure Payments", sub: "Paystack & Stripe encrypted", color: "#6366f1" },
  { icon: CreditCard, text: "₦ & $ Pricing", sub: "Naira and Dollar checkout", color: "#10b981" },
  { icon: Truck, text: "Fast Delivery", sub: "Same-day Lagos · 48h nationwide", color: "#f59e0b" },
  { icon: MessageCircle, text: "24/7 Support", sub: "WhatsApp & live chat", color: "#ec4899" },
];

const TrustSection = () => {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(itemsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 88%" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
          {ITEMS.map(({ icon: Icon, text, sub, color }, i) => (
            <div key={i} ref={el => itemsRef.current[i] = el} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f9fafb" }}>{text}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
