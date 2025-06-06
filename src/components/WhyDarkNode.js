import React from "react";
import { motion } from "framer-motion";

const bullets = [
  "⚡ Fast Execution",
  "🧊 Easy, Intuitive UI",
  "🛡️ Secure & Audited",
  "🧑‍💻 Open Source & Developer Friendly",
  "🌐 100% Non-Custodial",
];

export default function WhyDarkNode() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
      {/* Left: Bullets */}
      <motion.div
        className="flex-1 flex flex-col gap-4"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">Why DarkNode?</h2>
        <ul className="flex flex-col gap-3 text-lg text-white/90">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="text-cyan-400 text-xl">•</span> {b}
            </li>
          ))}
        </ul>
      </motion.div>
      {/* Right: Glowing Card Placeholder */}
      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div className="w-80 h-56 md:w-96 md:h-64 bg-gradient-to-br from-cyan-400/30 to-purple-500/30 rounded-2xl shadow-2xl blur-[1px] border-4 border-white/10 flex items-center justify-center">
          <span className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-glow select-none opacity-60">
            🟣
          </span>
        </div>
      </motion.div>
    </section>
  );
} 