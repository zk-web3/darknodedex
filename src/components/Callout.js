import React from "react";
import { motion } from "framer-motion";

export default function Callout() {
  return (
    <section className="relative z-10 max-w-2xl mx-auto px-6 py-8">
      <motion.div
        className="rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-cyan-400/20 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="flex-1 flex flex-col gap-2">
          <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold text-sm shadow shadow-cyan-500/20 mb-1">
            🚀 Powered by Sepolia Testnet
          </span>
          <span className="text-white/80 text-base">
            Claim ETH from our Faucet to begin testing.
          </span>
        </div>
        <motion.a
          href="#"
          className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-purple-400 transition"
          whileHover={{ scale: 1.05 }}
        >
          Go to Faucet
        </motion.a>
      </motion.div>
    </section>
  );
} 