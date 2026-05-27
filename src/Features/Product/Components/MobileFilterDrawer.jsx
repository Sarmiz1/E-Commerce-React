import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClose } from "../../../Components/Icons/IconClose";
import FilterSidebar from "./FilterSidebar";

export default function MobileFilterDrawer({ 
  isOpen, 
  onClose, 
  colors, 
  filters, 
  setFilters, 
  maxBudget, 
  selectedCategory, 
  setSelectedCategory, 
  matchingCount 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              mass: 0.8,
            }}
            className="fixed bottom-0 left-0 right-0 z-[2001] rounded-t-[32px] p-8 lg:hidden max-h-[90vh] overflow-y-auto shadow-[0_-20px_40px_rgba(0,0,0,0.2)]"
            style={{ background: colors.surface.primary }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2
                className="text-2xl font-serif font-bold"
                style={{ color: colors.text.primary }}
              >
                Filters
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: colors.surface.tertiary,
                  color: colors.text.primary,
                }}
              >
                <IconClose />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              maxBudget={maxBudget}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              matchingCount={matchingCount}
            />
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold mt-8"
              style={{
                background: colors.cta.primary,
                color: colors.cta.primaryText,
              }}
            >
              Show {matchingCount} Results
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
