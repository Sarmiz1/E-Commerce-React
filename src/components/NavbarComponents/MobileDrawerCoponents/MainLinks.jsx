import { motion } from "framer-motion";


const MainLinks = ({
  ALL_NAV_LINKS,
  location,
  navigate,
  setMobileOpen,
  UserIcon,
  HeartIcon,
  BagIcon,
  ArrowRight
}) => {

  const category = [
    { label: "Women's", emoji: "👗", color: "from-rose-400 to-pink-500" },
    { label: "Men's", emoji: "👔", color: "from-sky-400 to-blue-500" },
    { label: "Bags", emoji: "👜", color: "from-amber-400 to-orange-500" },
    { label: "Watches", emoji: "⌚", color: "from-emerald-400 to-teal-500" },
    { label: "Shoes", emoji: "👠", color: "from-violet-400 to-purple-500" },
    { label: "Beauty", emoji: "🧴", color: "from-pink-400 to-rose-500" },
  ]

  const offers = [
    { label: "🔥 Flash Sale", desc: "Up to 70% off today only", color: "bg-orange-50 border-orange-100", textColor: "text-orange-600" },
    { label: "✨ New Arrivals", desc: "68 new items this week", color: "bg-indigo-50 border-indigo-100", textColor: "text-indigo-600" },
    { label: "🎁 Gift Sets", desc: "Perfect presents from $29", color: "bg-rose-50 border-rose-100", textColor: "text-rose-600" },
  ]

  const icons = [
    { icon: <UserIcon className="w-4 h-4" />, label: "My Account" },
    { icon: <HeartIcon className="w-4 h-4" />, label: "Wishlist" },
    { icon: <BagIcon className="w-4 h-4" />, label: "My Orders" },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Menu</p>
        {ALL_NAV_LINKS.map((link, i) => {
          const isActive = location.pathname === link.href;
          return (
            <motion.button key={link.label}
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => { navigate(link.href); setMobileOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left font-semibold text-sm transition-all duration-180 mb-1 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                } ${link.accent ? "!text-orange-500 font-black" : ""}`}
            >
              <span>{link.accent && "🔥 "}{link.label}</span>
              {isActive && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
            </motion.button>
          );
        })}
      </div>

      {/* Mega content — compact mobile version */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-3">Shop by Category</p>
        <div className="grid grid-cols-2 gap-2">
          {category.map((cat, i) => (
            <motion.button key={cat.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => { navigate("/products"); setMobileOpen(false); }}
              className={`bg-gradient-to-br ${cat.color} text-white p-4 rounded-2xl text-left flex flex-col gap-1`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="font-bold text-sm">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Special offers */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-3">Offers</p>
        <div className="space-y-2">
          {offers.map((offer, i) => (
            <motion.button key={offer.label}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
              onClick={() => { navigate("/products"); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all hover:scale-[1.01] ${offer.color}`}
            >
              <div className="flex-1">
                <p className={`font-bold text-sm ${offer.textColor}`}>{offer.label}</p>
                <p className="text-gray-500 text-xs">{offer.desc}</p>
              </div>
              <ArrowRight className={`w-4 h-4 ${offer.textColor} opacity-60`} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Account links */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Account</p>
        {icons.map((item, i) => (
          <motion.button key={item.label}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 + i * 0.05 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all mb-1 text-sm font-semibold text-left"
          >
            <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">{item.icon}</span>
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default MainLinks
