import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter } from "react-icons/fi";

export default function TokenListDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md h-full bg-white/10 dark:bg-black/40 shadow-2xl border-l border-cyan-400/20 p-8 flex flex-col backdrop-blur-2xl rounded-l-3xl relative"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center mb-6 gap-3">
              <FiSearch className="text-cyan-400 text-xl" />
              <input
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 px-2 text-lg"
                placeholder="Search token..."
                disabled
              />
              <button className="p-2 rounded-full hover:bg-cyan-500/20 transition" aria-label="Filter">
                <FiFilter className="text-cyan-400 text-xl" />
              </button>
            </div>
            {/* Categories */}
            <div className="flex gap-3 mb-4">
              <button className="px-4 py-1 rounded-xl font-semibold text-sm bg-cyan-400/10 text-cyan-300 blur-sm select-none">All</button>
              <button className="px-4 py-1 rounded-xl font-semibold text-sm bg-cyan-400/10 text-cyan-300 blur-sm select-none">Popular</button>
              <button className="px-4 py-1 rounded-xl font-semibold text-sm bg-cyan-400/10 text-cyan-300 blur-sm select-none">Stablecoins</button>
            </div>
            {/* Token List (empty/blurred) */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
              <div className="w-full h-12 bg-cyan-400/10 rounded-xl blur-sm" />
              <div className="w-full h-12 bg-cyan-400/10 rounded-xl blur-sm" />
              <div className="w-full h-12 bg-cyan-400/10 rounded-xl blur-sm" />
            </div>
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-cyan-400/10 hover:bg-cyan-400/20 transition text-cyan-300"
              onClick={onClose}
              aria-label="Close Drawer"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 