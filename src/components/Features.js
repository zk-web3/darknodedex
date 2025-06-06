import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡️",
    title: "Swap With 0% Gas",
    desc: "Trade instantly with zero gas fees on Sepolia.",
  },
  {
    icon: "💧",
    title: "Liquidity Mining",
    desc: "Earn rewards by providing liquidity pools.",
  },
  {
    icon: "🛡️",
    title: "Built on Sepolia",
    desc: "Secure, fast, and reliable on Ethereum testnet.",
  },
  {
    icon: "👨‍💻",
    title: "Developer Friendly",
    desc: "Open APIs and docs for easy integration.",
  },
];

export default function Features() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="group bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center text-center shadow-xl border border-cyan-400/10 hover:border-cyan-400/40 transition-all duration-300 relative overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.04, boxShadow: "0 0 32px #00e0ff88" }}
          >
            <div className="mb-4 text-4xl drop-shadow-glow">{f.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-glow">{f.title}</h3>
            <p className="text-white/80 text-base">{f.desc}</p>
            <div className="absolute inset-0 pointer-events-none group-hover:shadow-[0_0_32px_8px_#00e0ff88] transition" />
          </motion.div>
        ))}
      </div>
    </section>
  );
} 