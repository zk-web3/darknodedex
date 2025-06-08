import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { FiZap, FiLayers, FiShield, FiTrendingUp } from "react-icons/fi";

function MysteriousRevealText() {
  // Animate a circular mask (clip-path) to reveal the 3D rotating text in a mysterious way
  // Inspired by the video: https://youtu.be/EADzOa5o_dg?si=M4AiB5k7h6jEdxav
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
      style={{
        WebkitMaskImage: undefined, // fallback for Safari
        maskImage: undefined,
      }}
    >
      <motion.div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
        initial={false}
        animate={{}}
      >
        <motion.div
          initial={{
            rotateY: 0,
            rotateX: 0,
            rotateZ: 0,
            opacity: 0,
            WebkitMaskImage: "circle(0% at 50% 50%)",
            maskImage: "circle(0% at 50% 50%)",
          }}
          animate={{
            rotateY: [0, 360],
            rotateX: [0, 30, -30, 0],
            rotateZ: [0, 20, -20, 0],
            opacity: [0, 0.7, 0.7, 0.7, 0],
            WebkitMaskImage: [
              "circle(0% at 50% 50%)",
              "circle(60% at 50% 50%)",
              "circle(80% at 60% 40%)",
              "circle(60% at 40% 60%)",
              "circle(70% at 50% 50%)",
              "circle(0% at 50% 50%)",
            ],
            maskImage: [
              "circle(0% at 50% 50%)",
              "circle(60% at 50% 50%)",
              "circle(80% at 60% 40%)",
              "circle(60% at 40% 60%)",
              "circle(70% at 50% 50%)",
              "circle(0% at 50% 50%)",
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 32,
            ease: "easeInOut",
          }}
          style={{
            fontSize: "13vw",
            fontWeight: 900,
            background: "linear-gradient(120deg, #0fffc3 0%, #00e0ff 40%, #a259ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.08em",
            lineHeight: 1,
            userSelect: "none",
            opacity: 0.65,
            textShadow:
              "0 0 128px #00e0ff, 0 0 32px #a259ff, 0 0 2px #fff, 0 0 200px #0fffc3",
            transition: "opacity 1.5s cubic-bezier(0.4,0,0.2,1)",
            mixBlendMode: "lighten",
            WebkitMaskImage: undefined, // fallback for Safari
            maskImage: undefined,
          }}
        >
          DarkNode
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ForegroundHeroText() {
  return (
    <motion.div
      className="w-full flex items-center justify-center select-none mb-8 z-10"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <span
        className="text-[8vw] md:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-white to-purple-500 bg-clip-text text-transparent drop-shadow-glow tracking-widest"
        style={{ letterSpacing: "0.08em", lineHeight: 1 }}
      >
      DarkNode
      </span>
    </motion.div>
  );
}

export default function Hero({ onLaunchApp }) {
  return (
    <section className="relative w-full pt-24 pb-20 bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] overflow-hidden flex flex-col items-center min-h-[80vh] px-4">
      {/* Mysterious 3D Reveal Background Text */}
      <MysteriousRevealText />
      {/* Foreground Animated Text */}
      <ForegroundHeroText />
      {/* Headline & Subtitle */}
        <motion.div
        className="max-w-2xl w-full flex flex-col items-center text-center mx-auto z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-glow mb-4">
          The Next-Gen Modular DEX
          </h1>
        <p className="text-lg md:text-2xl text-white/80 mb-8">
          Experience blazing fast swaps, modular liquidity, and a futuristic DeFi UI. Built for the Ethereum Sepolia testnet.
          </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full justify-center">
          <motion.button
              className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-purple-400 transition"
              whileHover={{ scale: 1.05 }}
            onClick={onLaunchApp}
            >
              Launch App
          </motion.button>
            <motion.a
            href="https://docs.darknode.xyz"
            target="_blank"
            rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl font-bold text-lg bg-white/10 text-cyan-400 border border-cyan-400 shadow hover:bg-cyan-400/10 hover:text-white transition"
              whileHover={{ scale: 1.05 }}
            >
              Read Docs
            </motion.a>
          </div>
        </motion.div>
      {/* Glassmorphic Feature Panel */}
        <motion.div
        className="relative z-10 mt-2 max-w-4xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 bg-white/10 dark:bg-black/30 backdrop-blur-2xl rounded-3xl border border-cyan-400/20 shadow-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        >
        <div className="flex flex-col items-center text-center gap-2">
          <FiZap className="text-3xl text-cyan-400 drop-shadow-glow mb-2" />
          <span className="text-lg font-semibold text-white">Lightning Swaps</span>
          <span className="text-white/70 text-sm">Instant trades with ultra-low gas on Sepolia.</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <FiLayers className="text-3xl text-purple-400 drop-shadow-glow mb-2" />
          <span className="text-lg font-semibold text-white">Modular Liquidity</span>
          <span className="text-white/70 text-sm">Add, remove, or extend pools with ease.</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <FiShield className="text-3xl text-cyan-400 drop-shadow-glow mb-2" />
          <span className="text-lg font-semibold text-white">Secure & Reliable</span>
          <span className="text-white/70 text-sm">Audited contracts, built for safety and speed.</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <FiTrendingUp className="text-3xl text-purple-400 drop-shadow-glow mb-2" />
          <span className="text-lg font-semibold text-white">Future-Ready</span>
          <span className="text-white/70 text-sm">Designed for rapid upgrades and new features.</span>
            </div>
          </motion.div>
    </section>
  );
} 