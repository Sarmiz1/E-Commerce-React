import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Headset,
  Store,
  Newspaper,
  Handshake,
  TrendingUp,
  MessageSquare,
  Mail,
  MessageCircle,
  ShieldCheck,
  Clock,
  Lock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import ModernNavbar from "../../Components/ModernNavbar";
import { ModernFooter } from "../Marketting/ModernLanding/SharedComponents/ModernFooter";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  {
    id: "support",
    icon: Headset,
    title: "Support",
    desc: "For order issues, refunds, or account help.",
    cta: "Contact Support",
  },
  {
    id: "sellers",
    icon: Store,
    title: "Sellers",
    desc: "For onboarding your store on Woosho.",
    cta: "Become a Seller",
  },
  {
    id: "press",
    icon: Newspaper,
    title: "Press & Media",
    desc: "For interviews, press features, or media inquiries.",
    cta: "Press Contact",
  },
  {
    id: "partners",
    icon: Handshake,
    title: "Partnerships",
    desc: "For brands, logistics, and business collaborations.",
    cta: "Partner With Us",
  },
  {
    id: "investors",
    icon: TrendingUp,
    title: "Investors",
    desc: "For funding, pitch requests, and investor relations.",
    cta: "Investor Contact",
  },
  {
    id: "general",
    icon: MessageSquare,
    title: "General Inquiry",
    desc: "For anything else.",
    cta: "Send Message",
  },
];

export default function ContactPage() {
  const mainRef = useRef(null);
  const formRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("support");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    // Support
    orderId: "",
    issueType: "Payment",
    // Sellers
    businessName: "",
    monthlyVolume: "",
    websiteLinks: "",
    // Press
    mediaOutlet: "",
    inquiryTopic: "",
    // Investors
    firmName: "",
    investmentRange: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // Premium chained animation for hero and cards
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-text",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.1 },
      ).fromTo(
        ".category-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out" },
        "-=0.5",
      );

      // Scroll animations for lower sections
      gsap.utils.toArray(".reveal-up").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    if (formRef.current) {
      const yOffset = -100;
      const y =
        formRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        message: "",
        orderId: "",
        issueType: "Payment",
        businessName: "",
        monthlyVolume: "",
        websiteLinks: "",
        mediaOutlet: "",
        inquiryTopic: "",
        firmName: "",
        investmentRange: "",
      });
    }, 5000);
  };

  return (
    <div
      ref={mainRef}
      className="bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white min-h-screen selection:bg-blue-600/30 transition-colors duration-300"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <ModernNavbar
        navLinks={[
          { label: "Shop", href: "/products" },
          { label: "Brands", href: "/brands" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-48 pb-24 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/50 dark:from-blue-900/10 via-white dark:via-[#0E0E10] to-white dark:to-[#0E0E10] pointer-events-none transition-colors duration-300" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="hero-text text-6xl md:text-8xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6 leading-[0.9]">
            Get In Touch
          </h1>
          <p className="hero-text text-xl text-gray-600 dark:text-gray-400 font-medium max-w-xl mx-auto">
            Choose the right department so we can respond faster.
          </p>
        </div>
      </section>

      {/* 2. CONTACT ROUTING CARDS */}
      <section className="py-12 px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`category-card text-left p-8 border transition-all duration-300 group flex flex-col h-full
                ${
                  selectedCategory === cat.id
                    ? "bg-blue-50 dark:bg-zinc-800 border-blue-600 dark:border-blue-500 shadow-lg shadow-blue-900/5"
                    : "bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-white/10"
                }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
                ${selectedCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-white/5 text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"}
              `}
              >
                <cat.icon size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {cat.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 flex-grow leading-relaxed">
                {cat.desc}
              </p>

              <div
                className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 mt-auto
                ${selectedCategory === cat.id ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}
              `}
              >
                {cat.cta} <span className="text-lg leading-none">&rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. DYNAMIC FORM SECTION */}
      <section
        ref={formRef}
        className="py-24 px-6 md:px-12 max-w-[800px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300"
      >
        <div className="reveal-up">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.title} Inquiry
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please fill out the details below. We typically respond within
              24–48 hours.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 p-8 md:p-12 transition-colors duration-300">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <CheckCircle2 size={64} className="text-green-500 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Message Sent Successfully
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our{" "}
                  {CATEGORIES.find(
                    (c) => c.id === selectedCategory,
                  )?.title.toLowerCase()}{" "}
                  team will get back to you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* COMMON FIELDS */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* DYNAMIC FIELDS */}
                    {selectedCategory === "support" && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Order ID (Optional)
                          </label>
                          <input
                            type="text"
                            name="orderId"
                            value={formData.orderId}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                            placeholder="#WOO-12345"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Issue Type *
                          </label>
                          <select
                            name="issueType"
                            value={formData.issueType}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none transition-colors text-gray-900 dark:text-white"
                          >
                            <option value="Payment">Payment</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Refund">Refund</option>
                            <option value="Account">Account Help</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedCategory === "sellers" && (
                      <>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Business Name *
                            </label>
                            <input
                              required
                              type="text"
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleChange}
                              className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Estimated Monthly Volume *
                            </label>
                            <select
                              required
                              name="monthlyVolume"
                              value={formData.monthlyVolume}
                              onChange={handleChange}
                              className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none transition-colors text-gray-900 dark:text-white"
                            >
                              <option value="" disabled>
                                Select volume...
                              </option>
                              <option value="Just starting">
                                Just starting
                              </option>
                              <option value="10-50 orders/mo">
                                10 - 50 orders / mo
                              </option>
                              <option value="50-200 orders/mo">
                                50 - 200 orders / mo
                              </option>
                              <option value="200+ orders/mo">
                                200+ orders / mo
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Website or Social Links *
                          </label>
                          <input
                            required
                            type="text"
                            name="websiteLinks"
                            value={formData.websiteLinks}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                            placeholder="Instagram, Twitter, or your website..."
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "press" && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Media Outlet *
                          </label>
                          <input
                            required
                            type="text"
                            name="mediaOutlet"
                            value={formData.mediaOutlet}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Topic of Inquiry *
                          </label>
                          <input
                            required
                            type="text"
                            name="inquiryTopic"
                            value={formData.inquiryTopic}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {selectedCategory === "investors" && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Firm Name / Angel *
                          </label>
                          <input
                            required
                            type="text"
                            name="firmName"
                            value={formData.firmName}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Investment Range *
                          </label>
                          <select
                            required
                            name="investmentRange"
                            value={formData.investmentRange}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none transition-colors text-gray-900 dark:text-white"
                          >
                            <option value="" disabled>
                              Select range...
                            </option>
                            <option value="$10k - $50k">$10k - $50k</option>
                            <option value="$50k - $250k">$50k - $250k</option>
                            <option value="$250k+">$250k+</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* COMMON MESSAGE FIELD */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Message *
                      </label>
                      <textarea
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white resize-y"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 4. DIRECT CONTACT OPTIONS & TRUST BLOCK */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="reveal-up space-y-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                Direct Channels
              </h3>
              <div className="space-y-6">
                <a
                  href="mailto:support@woosho.com"
                  className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      General & Support
                    </div>
                    <div className="text-sm">support@woosho.com</div>
                  </div>
                </a>
                <a
                  href="mailto:press@woosho.com"
                  className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Newspaper size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      Press Inquiries
                    </div>
                    <div className="text-sm">press@woosho.com</div>
                  </div>
                </a>
                <a
                  href="mailto:partners@woosho.com"
                  className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Handshake size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      Partnerships
                    </div>
                    <div className="text-sm">partners@woosho.com</div>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                Urgent Support?
              </h3>
              <a
                href="#"
                className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors font-bold uppercase tracking-widest text-sm"
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
              <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <Clock size={14} /> Average response time: 24–48 hours
              </p>
            </div>
          </div>

          <div className="reveal-up bg-gray-50 dark:bg-zinc-900/30 p-8 border border-gray-200 dark:border-white/5 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-tight">
              Our Commitment
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Lock className="text-gray-400 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Secure Communication
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    All messages are encrypted and handled confidentially.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck
                  className="text-gray-400 shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Verified Contacts
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You are communicating directly with official Woosho teams.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldAlert
                  className="text-gray-400 shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Data Privacy Respect
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    We do not sell or share your contact details with
                    unauthorized third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 dark:border-white/5 transition-colors duration-300"></div>
      <ModernFooter />
    </div>
  );
}
