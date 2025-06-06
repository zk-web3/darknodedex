import React from "react";
import { motion } from "framer-motion";

function Animated3DText() {
  // Animate X, Y, Z, and skew in a loop
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none"
      initial={{ rotateX: 0, rotateY: 0, rotateZ: 0, skewY: 0 }}
      animate={{
        rotateX: [0, 20, 0, -20, 0],
        rotateY: [0, 0, 30, 0, -30, 0],
        rotateZ: [0, 0, 0, 15, 0, -15, 0],
        skewY: [0, 10, 0, -10, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 12,
        ease: "easeInOut",
      }}
      style={{
        fontSize: "8vw",
        fontWeight: 900,
        color: "#38bdf8",
        textShadow:
          "0 0 64px #38bdf8, 0 0 32px #8b5cf6, 0 0 2px #fff, 0 0 128px #38bdf8",
        opacity: 0.08,
        letterSpacing: "0.1em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      DarkNode
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full pt-24 pb-20 bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] overflow-hidden flex items-center justify-center min-h-[70vh]">
      {/* 3D Animated DarkNode Text */}
      <Animated3DText />
      {/* Animated Background Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-purple-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        />
      </div>
      <div className="relative z-10 w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12 px-6">
        {/* Left: Text */}
        <motion.div
          className="flex-1 flex flex-col items-start md:items-start text-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-glow mb-4">
            Smarter Swaps.<br /> Built on Sepolia.
          </h1>
          <p className="text-lg md:text-2xl text-white/80 max-w-xl mb-8">
            DarkNode is a next-gen DEX focused on blazing speed, liquidity, and user-first design — exclusively on Ethereum's Sepolia Testnet.
          </p>
          <div className="flex gap-4 mb-6">
            <motion.a
              href="#"
              className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-purple-400 transition"
              whileHover={{ scale: 1.05 }}
            >
              Launch App
            </motion.a>
            <motion.a
              href="#"
              className="px-8 py-3 rounded-xl font-bold text-lg bg-white/10 text-cyan-400 border border-cyan-400 shadow hover:bg-cyan-400/10 hover:text-white transition"
              whileHover={{ scale: 1.05 }}
            >
              Read Docs
            </motion.a>
          </div>
        </motion.div>
        {/* Right: Animated 3D Token Visuals (Placeholder) */}
        <motion.div
          className="flex-1 flex items-center justify-center w-full h-80 md:h-[28rem]"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          >
            {/* Glowing Card 1 */}
            <motion.div
              className="absolute left-0 top-0 w-40 h-40 bg-gradient-to-br from-cyan-400/40 to-purple-500/30 rounded-2xl shadow-2xl blur-xl"
              animate={{ y: [0, 20, -20, 0], x: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            />
            {/* Glowing Card 2 */}
            <motion.div
              className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-br from-purple-400/40 to-cyan-500/30 rounded-2xl shadow-2xl blur-xl"
              animate={{ y: [0, -20, 20, 0], x: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />
            {/* Center Token Placeholder */}
            <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20">
              <span className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-glow select-none">
                🟣
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 