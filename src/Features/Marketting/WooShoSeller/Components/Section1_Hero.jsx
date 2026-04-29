import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Bell,
  DollarSign,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatMoneyCurrency } from "../../../../Utils/formatMoneyCents";

const notifications = [
  "AI optimized pricing for Urban Kicks: +3 sales",
  "Smart Listing generated for Stealth Trainers",
  "High demand detected in Lagos region",
  "Social Feed sync complete: 2.4k reach",
];

export default function Section1_Hero() {
  const navigate = useNavigate();
  const [currentNotif, setCurrentNotif] = useState(0);
  const [revenue, setRevenue] = useState(1450000);

  useEffect(() => {
    const notifInterval = setInterval(() => {
      setCurrentNotif((prev) => (prev + 1) % notifications.length);
    }, 4000);

    const revenueInterval = setInterval(() => {
      setRevenue((prev) => prev + Math.floor(Math.random() * 5000));
    }, 2000);

    return () => {
      clearInterval(notifInterval);
      clearInterval(revenueInterval);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A] pt-24 pb-12 perspective-[2000px] mt-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] absolute translate-x-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Content */}
        <div className="text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/20 text-blue-400 text-sm font-bold"
          >
            <Sparkles size={14} /> WooSho Operating System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent leading-[1.05]"
          >
            Run an Empire, <br /> Not an Errand.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-lg leading-relaxed font-medium"
          >
            The world’s first AI-native commerce platform. Your autonomous
            assistant handles inquiries, writes listings, and optimizes pricing
            24/7.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button
              className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 active:scale-95 transition-all text-lg flex items-center justify-center gap-3"
              onClick={() => navigate("/auth")}
            >
              Launch Your Store <ArrowRight size={20} />
            </button>
            <button
              className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-lg"
              onClick={() => navigate("/docs")}
            >
              View Documentation
            </button>
          </motion.div>
        </div>

        {/* Right: Isometric Command Center Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 100, rotateX: 15, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateX: 10, rotateY: -15 }}
          whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
          className="relative w-full h-[600px] preserve-3d"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Main Dashboard Panel */}
          <div className="absolute inset-0 bg-[#111111] rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.15)] p-6 overflow-hidden flex flex-col gap-6">
            {/* Top Bar */}
            <div className="flex justify-between items-center pb-6 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-md flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                AI Active
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2 font-medium">
                  <DollarSign size={16} /> Total Revenue
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {formatMoneyCurrency(revenue * 100)}
                </div>
                <div className="text-xs text-green-400 mt-2 font-bold flex items-center gap-1">
                  <TrendingUp size={12} /> +12.5% vs yesterday
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2 font-medium">
                  <Activity size={16} /> Active Buyers
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  1,284
                </div>
                <div className="mt-2 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: ["40%", "70%", "50%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* AI Notification Feed */}
            <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-5 relative overflow-hidden flex flex-col justify-end">
              <div className="absolute top-5 left-5 text-gray-400 text-sm font-medium flex items-center gap-2">
                <Bell size={16} /> Operations Log
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentNotif}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 flex items-center gap-3 shadow-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <p className="text-sm font-medium text-gray-200">
                    {notifications[currentNotif]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Floating UI Elements for Depth */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -right-12 top-1/4 w-48 bg-[#1A1A1A] p-4 rounded-xl border border-white/10 shadow-2xl z-20 hidden lg:block"
            style={{ transform: "translateZ(50px)" }}
          >
            <div className="text-xs font-bold text-gray-400 mb-2">
              Demand Forecast
            </div>
            <div className="flex items-end gap-1 h-12">
              {[40, 70, 45, 90, 65, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-full bg-blue-500/50 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
