import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white/10 dark:bg-black/40 rounded-2xl shadow-2xl border border-cyan-400/20 p-8 max-w-sm w-full text-center backdrop-blur-xl relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>
            <div className="mb-4 text-left">
              <label className="block text-cyan-400/80 mb-1 font-medium">Slippage Tolerance</label>
              <div className="w-full h-10 bg-cyan-400/10 rounded-xl blur-sm" />
            </div>
            <div className="mb-4 text-left">
              <label className="block text-cyan-400/80 mb-1 font-medium">Transaction Deadline</label>
              <div className="w-full h-10 bg-cyan-400/10 rounded-xl blur-sm" />
            </div>
            <div className="mb-6 text-left">
              <label className="block text-cyan-400/80 mb-1 font-medium">UI Theme</label>
              <div className="w-full h-10 bg-cyan-400/10 rounded-xl blur-sm" />
            </div>
            <button
              className="mt-2 px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:from-cyan-400 hover:to-purple-400 transition"
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 