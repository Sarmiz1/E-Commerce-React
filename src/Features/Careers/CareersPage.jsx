import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Zap,
  Layers,
  Globe2,
  Code,
  ShieldCheck,
  UserPlus,
  FileText,
} from "lucide-react";
import ModernNavbar from "../../Components/ModernNavbar";
import { ModernFooter } from "../Marketting/ModernLanding/SharedComponents/ModernFooter";

gsap.registerPlugin(ScrollTrigger);

const CULTURE_PILLARS = [
  {
    icon: Brain,
    title: "Think Systemically",
    desc: "We build structured solutions, not quick hacks.",
  },
  {
    icon: Zap,
    title: "Move With Speed",
    desc: "Execution > endless planning.",
  },
  {
    icon: ShieldCheck,
    title: "Ownership Mentality",
    desc: "If you see it, you own it.",
  },
  {
    icon: Globe2,
    title: "Build for Scale",
    desc: "Nigeria first. Global always.",
  },
];

const OPEN_ROLES = [
  {
    title: "Frontend Engineer (React)",
    dept: "Engineering",
    location: "Remote / Lagos",
    type: "Full-time",
  },
  {
    title: "Product Designer (UI/UX)",
    dept: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Backend Engineer (Node.js)",
    dept: "Engineering",
    location: "Remote / Lagos",
    type: "Full-time",
  },
  {
    title: "AI/ML Engineer",
    dept: "Data & AI",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Growth & Marketing Lead",
    dept: "Marketing",
    location: "Lagos / Hybrid",
    type: "Full-time",
  },
  {
    title: "Operations Manager",
    dept: "Operations",
    location: "Lagos",
    type: "Full-time",
  },
];

const BENEFITS = [
  { title: "Competitive pay", desc: "Rewarding top talent appropriately." },
  { title: "Equity Options", desc: "Own a piece of what you build." },
  { title: "Flexible Working", desc: "Async-first, remote-friendly culture." },
  {
    title: "Learning Support",
    desc: "Budgets for courses, books, and growth.",
  },
  { title: "Real Impact", desc: "Your code ships to real users fast." },
  { title: "Health Coverage", desc: "Comprehensive medical insurance." },
];

export default function CareersPage() {
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const [expandedRole, setExpandedRole] = useState(null);

  useEffect(() => {
    // Remove forced dark mode styles to allow native tailwind light/dark
    const ctx = gsap.context(() => {
      // Fade up reveals
      gsap.utils.toArray(".reveal-up").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });

      // Stagger items
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

    return () => {
      ctx.revert();
    };
  }, []);

  const toggleRole = (index) => {
    setExpandedRole(expandedRole === index ? null : index);
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
          { label: "About", href: "/about" },
        ]}
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/50 dark:from-blue-900/10 via-white dark:via-[#0E0E10] to-white dark:to-[#0E0E10] pointer-events-none transition-colors duration-300" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-8 leading-[0.9]"
          >
            Build the Future <br className="hidden md:block" /> of Intelligent{" "}
            <br className="hidden md:block" /> Commerce.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            At Woosho, we're building AI-powered systems that make shopping
            smarter, faster, and more human.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => {
                const el = document.getElementById("open-roles");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors cursor-pointer border border-transparent"
            >
              View Open Roles
            </button>
            <Link
              to="/careers/apply"
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 font-bold uppercase tracking-widest text-sm hover:border-gray-900 dark:hover:border-white transition-colors"
            >
              Join Our Talent Pool
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. WHY WOOSHO EXISTS */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="reveal-up bg-blue-600 text-white p-12 md:p-24 flex flex-col items-center text-center relative overflow-hidden shadow-xl shadow-blue-900/10 dark:shadow-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
          <h2 className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-4 relative z-10">
            Why We're Building Woosho
          </h2>
          <h3 className="relative z-10 text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none max-w-4xl">
            We're not just building a marketplace. We're building decision
            systems.
          </h3>
          <p className="relative z-10 text-xl md:text-2xl text-blue-100 max-w-3xl font-medium">
            Online commerce is noisy and inefficient. We're building
            infrastructure that reduces friction between people and the products
            they need.
          </p>
        </div>
      </section>

      {/* 3. CULTURE SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="reveal-up text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
            How We Work
          </h2>
        </div>
        <div className="stagger-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CULTURE_PILLARS.map((pillar, i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 p-10 flex flex-col items-center text-center hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <pillar.icon size={40} className="text-gray-500 mb-6" />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {pillar.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHAT IT'S LIKE TO WORK HERE */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-up">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-8">
              Small Team. <br /> Big Impact.
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "High Ownership",
                  text: "You lead your domain without micromanagement.",
                },
                {
                  title: "Fast Feedback Loops",
                  text: "We iterate quickly based on real user data.",
                },
                {
                  title: "Real Product Influence",
                  text: "Your ideas shape the core of our AI and platform.",
                },
                {
                  title: "No Bureaucracy",
                  text: "Flat structure designed to ship high-quality code fast.",
                },
                {
                  title: "Remote-Friendly",
                  text: "Work where you are most productive.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xl text-gray-900 dark:text-white font-bold">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-up bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/5 aspect-square relative flex items-center justify-center p-8 overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-20 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-[#0E0E10] to-transparent" />
            <Code
              size={120}
              className="text-gray-300 dark:text-white/20 relative z-10"
            />
          </div>
        </div>
      </section>

      {/* 5. OPEN ROLES SECTION */}
      <section
        id="open-roles"
        className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300"
      >
        <div className="reveal-up text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
            Open Positions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
            Join our founding team and help shape the future of commerce.
          </p>
        </div>

        <div className="space-y-4">
          {OPEN_ROLES.map((role, i) => (
            <div
              key={i}
              className="reveal-up bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleRole(i)}
                className="w-full flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {role.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-transparent">
                      {role.dept}
                    </span>
                    <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-transparent">
                      {role.location}
                    </span>
                    <span className="bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-transparent">
                      {role.type}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <ArrowRight
                    className={`transform transition-transform duration-300 ${expandedRole === i ? "rotate-90 text-blue-600 dark:text-blue-500" : "text-gray-400 dark:text-gray-500"}`}
                  />
                </div>
              </button>

              {expandedRole === i && (
                <div className="p-6 md:p-8 border-t border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-zinc-900/30">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        What you'll do:
                      </h4>
                      <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 marker:text-blue-600 dark:marker:text-blue-500">
                        <li>
                          Own critical parts of the Woosho infrastructure.
                        </li>
                        <li>
                          Work closely with product and AI teams to deliver
                          seamless experiences.
                        </li>
                        <li>
                          Maintain a high bar for code quality and user
                          experience.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        What we're looking for:
                      </h4>
                      <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 marker:text-blue-600 dark:marker:text-blue-500">
                        <li>
                          Proven experience shipping production-ready systems.
                        </li>
                        <li>
                          Strong system-thinking and problem-solving skills.
                        </li>
                        <li>
                          High agency: ability to identify problems and solve
                          them independently.
                        </li>
                      </ul>
                    </div>
                    <div className="pt-4">
                      <Link
                        to={`/careers/apply?role=${encodeURIComponent(role.title)}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Apply for this role <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. BENEFITS SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="reveal-up text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
            What You Get
          </h2>
        </div>
        <div className="stagger-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 p-8 flex flex-col hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {benefit.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. TALENT POOL */}
      <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto border-t border-gray-200 dark:border-white/5 text-center transition-colors duration-300">
        <div className="reveal-up flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
            <UserPlus size={32} className="text-blue-600 dark:text-blue-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
            Don't See Your Role?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            We're always looking for ambitious builders. Send your portfolio or
            resume and tell us how you'd improve Woosho.
          </p>
          <Link
            to="/careers/apply?role=General%20Application"
            className="px-8 py-4 bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-white/20 font-bold uppercase tracking-widest text-sm hover:border-gray-900 dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Join Talent Network
          </Link>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-32 px-6 text-center bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
        <div className="reveal-up max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-10">
            Ready to Build With Us?
          </h2>
          <Link
            to="/careers/apply"
            className="inline-block px-12 py-5 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>

      <div className="border-t border-gray-200 dark:border-white/5 transition-colors duration-300"></div>
      <ModernFooter />
    </div>
  );
}
