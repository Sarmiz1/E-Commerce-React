import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"
import { formatLink } from "../../../../../Utils/formatLink";
export default function TrendingTags() {
  const navigate = useNavigate();

  const tags = [
    '#SummerDrop', '#LuxuryBags', '#StreetStyle', '#WatchOfTheYear',
    '#NewArrival', '#SaleFinds', '#TopRated', '#MemberExclusive',
    '#SustainableFashion', '#DesignerPicks', '#WeekendVibes', '#PowerDressing',
  ];

  return (
    <section className="py-10 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Trending Now</p>
      </div>
      <div className="flex whitespace-nowrap hp-scroll-x gap-4 px-6">
        {[...tags, ...tags].map((tag, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap"
            onClick={() => navigate(`/products/${formatLink(tag)}`)}
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
