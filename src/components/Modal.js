import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, onClose, children }) {
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
            className="bg-white/10 dark:bg-black/40 rounded-2xl shadow-2xl border border-cyan-400/20 p-8 max-w-sm w-full text-center backdrop-blur-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {children}
            <button
              className="mt-6 px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:from-cyan-400 hover:to-purple-400 transition"
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