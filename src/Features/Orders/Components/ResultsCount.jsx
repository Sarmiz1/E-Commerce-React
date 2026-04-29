import { motion } from "framer-motion";

export default function ResultsCount({ count, search, statusFilter }) {
  if (!search && statusFilter === "all") return null;

  return (
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400 mb-5">
      Showing <span className="font-black text-gray-700">{count}</span> result
      {count !== 1 ? "s" : ""}
      {statusFilter !== "all" ? (
        <>
          {" "}
          for <span className="font-bold text-indigo-600">{statusFilter}</span>
        </>
      ) : null}
      {search ? (
        <>
          {" "}
          matching <span className="font-bold text-indigo-600">"{search}"</span>
        </>
      ) : null}
    </motion.p>
  );
}
