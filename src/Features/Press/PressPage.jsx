import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Download,
  ArrowRight,
  Newspaper,
  Mic,
  FolderOpen,
  Mail,
  Globe,
  Users,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import ModernNavbar from "../../components/ModernNavbar";

gsap.registerPlugin(ScrollTrigger);

const FACTS = [
  { label: "Founded", value: "2026", icon: Globe },
  { label: "Headquarters", value: "Nigeria", icon: Target },
  { label: "Industry", value: "AI-Powered E-commerce", icon: FolderOpen },
  {
    label: "Categories",
    value: "Fashion, Tech, Beauty, Lifestyle",
    icon: Users,
  },
];

const PRESS_KIT_ITEMS = [
  "Woosho Logos (PNG & SVG)",
  "Founder Photos",
  "Platform UI Screenshots",
  "Brand Color Palette",
  "Company Bios (Short & Long)",
  "Typography Guidelines",
];

export default function PressPage() {
  const mainRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      // Hero Chained Animation
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-badge",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      )
        .fromTo(
          ".hero-title",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.4",
        )
        .fromTo(
          ".hero-desc",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6",
        )
        .fromTo(
          ".hero-cta",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1 },
          "-=0.6",
        );

      // Scroll Animations
      gsap.utils.toArray(".reveal-up").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });

      // Stagger Grids
      gsap.utils.toArray(".stagger-grid").forEach((grid) => {
        gsap.fromTo(
          grid.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: grid, start: "top 80%" },
          },
        );
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

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
          { label: "Press", href: "/press" },
          { label: "About", href: "/about" },
        ]}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-100 dark:from-white/5 via-white dark:via-[#0E0E10] to-white dark:to-[#0E0E10] pointer-events-none transition-colors duration-300" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-8">
            <Newspaper size={14} /> Official Media Hub
          </div>
          <h1 className="hero-title text-6xl md:text-8xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6 leading-[0.9]">
            Woosho in <br className="hidden md:block" /> the News.
          </h1>
          <p className="hero-desc text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Media mentions, official company updates, and resources for the
            press.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() =>
                document
                  .getElementById("press-kit")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="hero-cta w-full sm:w-auto px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download Press Kit
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("media-contact")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="hero-cta w-full sm:w-auto px-8 py-4 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 font-bold uppercase tracking-widest text-sm hover:border-gray-900 dark:hover:border-white transition-colors"
            >
              Media Inquiries
            </button>
          </div>
        </div>
      </section>

      {/* 2. OFFICIAL PRESS RELEASE */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="reveal-up mb-16">
          <h2 className="text-3xl font-bold uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
            Recent Announcements
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Official updates from the Woosho team.
          </p>
        </div>

        <div className="reveal-up bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 p-8 md:p-16 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">
              Press Release • For Immediate Release
            </div>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
              Woosho Launches AI-Powered Commerce Platform to Transform Online
              Shopping in Nigeria
            </h3>

            <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-400 font-medium leading-relaxed space-y-6">
              <p>
                <strong>Lagos, Nigeria</strong> — Woosho today announced the
                launch of its AI-powered commerce platform designed to simplify
                online shopping through intelligent product discovery and
                decision support.
              </p>
              <p>
                The platform introduces an AI-assisted shopping experience that
                helps users find, compare, and purchase products faster across
                categories including fashion, electronics, beauty, and lifestyle
                goods. By reducing search complexity and improving product
                relevance, Woosho aims to enhance the overall efficiency of
                digital commerce.
              </p>
              <p>
                Unlike traditional e-commerce platforms, Woosho integrates
                on-demand AI assistance that allows users to refine searches and
                make more informed purchasing decisions based on preference,
                budget, and intent.
              </p>
              <p>
                The company’s initial rollout focuses on the Nigerian market,
                where growing mobile adoption and digital commerce activity
                present significant opportunities for innovation in user
                experience and marketplace efficiency.
              </p>
              <p>
                Founder Sarmiz stated that Woosho was built to address the
                “decision overload problem” in modern e-commerce and to
                introduce a smarter, more intuitive way for people to shop
                online.
              </p>
              <p>
                Woosho plans to expand its platform capabilities over time,
                evolving into a broader AI-driven commerce infrastructure layer
                for emerging and global markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPANY & FOUNDER BIOS */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Company Bio */}
          <div className="reveal-up space-y-8">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">
                About Woosho
              </h2>
              <div className="h-1 w-12 bg-blue-600 mb-6"></div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Short Bio (100 words)
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-zinc-900/30 p-6 border border-gray-200 dark:border-white/5">
                  Woosho is an AI-powered commerce platform designed to make
                  online shopping faster, smarter, and more intuitive. The
                  platform helps users discover, compare, and purchase products
                  across multiple categories including fashion, electronics,
                  beauty, and lifestyle goods. By integrating intelligent search
                  and on-demand AI assistance, Woosho reduces decision fatigue
                  and improves shopping efficiency. Built with a mobile-first
                  approach, Woosho aims to reshape digital commerce in emerging
                  markets by combining curated product ecosystems with AI-driven
                  personalization and streamlined checkout experiences.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Long Bio
                </h4>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-zinc-900/30 p-6 border border-gray-200 dark:border-white/5 space-y-4">
                  <p>
                    Woosho is an AI-driven commerce infrastructure platform
                    built to transform how people discover and purchase products
                    online. Traditional e-commerce platforms often overwhelm
                    users with excessive options, poor discovery systems, and
                    inefficient search experiences. Woosho addresses this
                    challenge by introducing an intelligent layer that enhances
                    product discovery, comparison, and decision-making.
                  </p>
                  <p>
                    At its core, Woosho combines curated marketplace
                    architecture with on-demand AI assistance, allowing users to
                    shop across categories such as fashion, sneakers,
                    electronics, beauty, and lifestyle products with greater
                    speed and confidence. Instead of relying solely on manual
                    browsing, users can interact with AI when needed to refine
                    searches, compare products, and identify the best options
                    based on preference, budget, and intent.
                  </p>
                  <p>
                    The platform is designed for mobile-first markets and is
                    initially focused on Nigeria, where e-commerce adoption
                    continues to grow rapidly. Woosho aims to bridge the gap
                    between global shopping expectations and local market
                    realities by improving product accessibility, reducing
                    friction in transactions, and enhancing trust between buyers
                    and sellers.
                  </p>
                  <p>
                    Beyond commerce, Woosho is building foundational
                    infrastructure for AI-assisted retail experiences. Its
                    long-term vision is to evolve into a scalable commerce
                    intelligence system that can power smarter shopping
                    experiences across emerging and global markets. Woosho
                    represents a shift from traditional browsing-based
                    marketplaces to intelligent, decision-driven commerce
                    systems.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Bio */}
          <div className="reveal-up space-y-8">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">
                Founder Bio
              </h2>
              <div className="h-1 w-12 bg-blue-600 mb-6"></div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Sarmiz (100 words)
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-zinc-900/30 p-6 border border-gray-200 dark:border-white/5">
                  Sarmiz is the founder of Woosho, an AI-powered commerce
                  platform focused on redefining how users discover and purchase
                  products online. With a background spanning music, creative
                  direction, and digital product thinking, he blends cultural
                  insight with technology-driven execution. His work on Woosho
                  reflects a vision to simplify e-commerce through AI-assisted
                  decision systems, making online shopping more intuitive and
                  efficient, particularly in emerging markets. Alongside his
                  entrepreneurial journey, Sarmiz is also an independent music
                  artist exploring creative expression through sound and
                  storytelling.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Long Bio
                </h4>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-zinc-900/30 p-6 border border-gray-200 dark:border-white/5 space-y-4">
                  <p>
                    Sarmiz is a Nigerian entrepreneur and creative technologist,
                    best known as the founder of Woosho, an AI-powered commerce
                    platform designed to improve how people shop online. His
                    work sits at the intersection of technology, culture, and
                    consumer behavior, focusing on building systems that
                    simplify digital decision-making.
                  </p>
                  <p>
                    Before founding Woosho, Sarmiz developed his creative
                    identity as a music artist, using storytelling and sound as
                    a medium of expression. This creative background plays a
                    significant role in his approach to product design,
                    branding, and user experience. He combines artistic thinking
                    with system-level product design to build experiences that
                    feel intuitive and culturally relevant.
                  </p>
                  <p>
                    Through Woosho, Sarmiz is addressing a major challenge in
                    modern e-commerce: information overload and inefficient
                    product discovery. His vision is to build an AI-assisted
                    commerce layer that helps users make faster and more
                    confident purchasing decisions. The platform is initially
                    focused on emerging markets, where mobile commerce and
                    social-driven shopping behaviors dominate.
                  </p>
                  <p>
                    Sarmiz continues to develop Woosho as part of a broader
                    mission to evolve digital commerce into a more intelligent,
                    user-centered ecosystem. His long-term goal is to position
                    Woosho as a scalable infrastructure layer for AI-assisted
                    retail experiences across global markets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPANY FACTS */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="reveal-up text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
            Fast Facts
          </h2>
        </div>
        <div className="stagger-grid grid grid-cols-2 md:grid-cols-4 gap-6">
          {FACTS.map((fact, i) => (
            <div
              key={i}
              className="p-8 border border-gray-200 dark:border-white/10 flex flex-col items-center text-center"
            >
              <fact.icon
                size={24}
                className="text-gray-400 dark:text-gray-500 mb-4"
              />
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                {fact.label}
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRESS KIT SECTION */}
      <section
        id="press-kit"
        className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300"
      >
        <div className="bg-gray-900 dark:bg-zinc-900 border border-gray-800 dark:border-white/10 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 transition-colors duration-300">
          <div className="reveal-up max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6">
              Press Kit
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Everything you need to write about Woosho. High-resolution logos,
              brand guidelines, product screenshots, and founder photography.
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 mb-10">
              {PRESS_KIT_ITEMS.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-300 font-medium"
                >
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Download size={18} /> Download Asset ZIP
            </a>
          </div>
          <div className="reveal-up w-full md:w-1/3 aspect-square bg-gray-800 dark:bg-black/50 border border-gray-700 dark:border-white/10 flex items-center justify-center p-8">
            <div className="text-center">
              <FolderOpen size={64} className="text-gray-600 mx-auto mb-4" />
              <div className="text-white font-bold tracking-widest uppercase">
                Woosho_Press_Assets.zip
              </div>
              <div className="text-sm text-gray-500 mt-2">12.4 MB</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MEDIA CONTACT */}
      <section
        id="media-contact"
        className="py-32 px-6 text-center border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0E0E10] transition-colors duration-300"
      >
        <div className="reveal-up max-w-2xl mx-auto">
          <Mic size={48} className="text-gray-400 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
            Media Inquiries
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            For interviews, features, or additional information, please contact
            our press team. We aim to respond within 24–48 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:press@woosho.com"
              className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-3"
            >
              <Mail size={16} /> Email Press Team
            </a>
            <Link
              to="/contact"
              className="w-full sm:w-auto px-10 py-4 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 font-bold uppercase tracking-widest text-sm hover:border-gray-900 dark:hover:border-white transition-colors"
            >
              Partnership Inquiries
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 dark:border-white/5 transition-colors duration-300"></div>
    </div>
  );
}
