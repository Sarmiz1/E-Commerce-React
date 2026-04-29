import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { Icons } from "./OrderIcons";
import { getOrderStats } from "../Utils/ordersUtils";

export default function StatsBar({ orders }) {
  const statsData = getOrderStats(orders);
  const stats = [
    {
      label: "Total Orders",
      value: statsData.totalOrders,
      icon: <Icons.Package c="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-indigo-500/20",
    },
    {
      label: "Total Spent",
      value: statsData.totalSpentCents / 100,
      prefix: "$",
      decimals: 2,
      icon: <Icons.Bag c="w-5 h-5" />,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
    },
    {
      label: "Delivered",
      value: statsData.delivered,
      icon: <Icons.Truck c="w-5 h-5" />,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
    },
    {
      label: "In Progress",
      value: statsData.inProgress,
      icon: <Icons.Refresh c="w-5 h-5" />,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          whileHover={{ y: -4, scale: 1.02 }}
          className={`relative bg-white rounded-3xl p-5 shadow-lg ${stat.shadow} border border-gray-100 overflow-hidden group`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
          />
          <div className="relative z-10">
            <div
              className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}
            >
              {stat.icon}
            </div>
            <p className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.prefix}
              <AnimatedCounter end={stat.value} decimals={stat.decimals || 0} />
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-widest mt-1 font-semibold">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
