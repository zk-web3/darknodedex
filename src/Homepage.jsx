import React from "react";
import { motion } from "framer-motion";

// ====== ICONS (PLACEHOLDER SVGs) ======
const SwapIcon = () => (
  <svg width="32" height="32" fill="none" className="text-cyan-400">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
    <path d="M10 16h12M16 10l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const SpeedIcon = () => (
  <svg width="32" height="32" fill="none" className="text-purple-400">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
    <path d="M16 8v8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const SecureIcon = () => (
  <svg width="32" height="32" fill="none" className="text-cyan-400">
    <rect x="6" y="12" width="20" height="12" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const LiquidityIcon = () => (
  <svg width="32" height="32" fill="none" className="text-purple-400">
    <ellipse cx="16" cy="20" rx="10" ry="4" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="16" cy="12" rx="6" ry="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// ====== NAVBAR ======
const Navbar = () => (
  <header className="sticky top-0 z-30 w-full backdrop-blur bg-black/40 border-b border-white/10">
    <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold tracking-widest text-cyan-400 drop-shadow-glow">DarkNode</span>
      </div>
      <ul className="hidden md:flex items-center gap-8 text-white/90 font-medium">
        <li><a href="#" className="hover:text-cyan-400 transition">Home</a></li>
        <li><a href="#" className="hover:text-cyan-400 transition">Swap</a></li>
        <li><a href="#" className="hover:text-cyan-400 transition">Liquidity</a></li>
        <li><a href="#" className="hover:text-cyan-400 transition">Faucet</a></li>
        <li><a href="#" className="hover:text-cyan-400 transition">Docs</a></li>
      </ul>
      <button className="ml-4 px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-purple-400 transition backdrop-blur">
        Connect Wallet
      </button>
    </nav>
  </header>
);

// ====== HERO SECTION ======
const Hero = () => (
  <section className="relative w-full pt-20 pb-16 md:pb-32 bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] overflow-hidden">
    {/* Animated Background Particles */}
    <div className="absolute inset-0 z-0 pointer-events-none">
      <motion.div
        className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      />
    </div>
    <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6">
      {/* Left: Text */}
      <div className="flex-1 flex flex-col items-start gap-6">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-glow"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Smarter Swaps.<br className="hidden md:block" /> Built for Sepolia.
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl text-white/80 max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Experience next-gen DeFi trading with blazing fast swaps, deep liquidity, and a seamless UI. Powered by Sepolia Testnet.
        </motion.p>
        <div className="flex gap-4 mt-4">
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
            Docs
          </motion.a>
        </div>
        {/* Testnet Badge */}
        <div className="mt-6">
          <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold text-sm shadow shadow-cyan-500/20">
            Powered by Sepolia Testnet
          </span>
        </div>
      </div>
      {/* Right: Animated Visual */}
      <div className="flex-1 flex items-center justify-center mt-12 md:mt-0">
        <motion.div
          className="w-80 h-80 md:w-96 md:h-96 rounded-3xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 shadow-2xl shadow-cyan-500/20 flex items-center justify-center relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Placeholder for animated tokens/cards */}
          <motion.div
            className="w-40 h-40 rounded-full bg-cyan-400/30 blur-2xl absolute top-10 left-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          />
          <motion.div
            className="w-32 h-32 rounded-full bg-purple-400/30 blur-2xl absolute bottom-10 right-10"
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
    {/* Animated Sliding Line */}
    <motion.div
      className="mx-auto mt-16 w-56 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg shadow-cyan-500/20"
      initial={{ width: 0 }}
      animate={{ width: "14rem" }}
      transition={{ duration: 1.2, delay: 0.5, type: "spring" }}
    />
  </section>
);

// ====== FEATURES SECTION ======
const features = [
  {
    icon: <SwapIcon />,
    title: "Blazing Fast Swaps",
    desc: "Instant trades with minimal slippage and deep liquidity pools.",
  },
  {
    icon: <SpeedIcon />,
    title: "Lightning Execution",
    desc: "Optimized routing and AI-powered pathfinding for best prices.",
  },
  {
    icon: <SecureIcon />,
    title: "Secure & Trustless",
    desc: "Non-custodial, audited smart contracts. Your keys, your coins.",
  },
  {
    icon: <LiquidityIcon />,
    title: "Earn with Liquidity",
    desc: "Provide liquidity and earn rewards on every trade.",
  },
];

const Features = () => (
  <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          className="group bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl border border-cyan-400/10 hover:border-cyan-400/40 transition-all duration-300 relative overflow-hidden"
          whileHover={{ scale: 1.04, boxShadow: "0 0 32px #00e0ff88" }}
        >
          <div className="mb-4">{f.icon}</div>
          <h3 className="text-xl font-bold text-white mb-2 drop-shadow-glow">{f.title}</h3>
          <p className="text-white/80 text-base">{f.desc}</p>
          <div className="absolute inset-0 pointer-events-none group-hover:shadow-[0_0_32px_8px_#00e0ff88] transition" />
        </motion.div>
      ))}
    </div>
  </section>
);

// ====== STATISTICS SECTION ======
const stats = [
  { label: "Total Users", value: 12890 },
  { label: "Total Volume", value: "$12.4M" },
  { label: "Liquidity Pairs", value: 42 },
  { label: "Trades in 24h", value: 1870 },
];

const Statistics = () => (
  <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl p-8 flex flex-col items-center shadow-lg border border-cyan-400/10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.7 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="text-3xl md:text-4xl font-extrabold text-cyan-400 drop-shadow-glow"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
          >
            {typeof s.value === "number" ? (
              <CountUp end={s.value} />
            ) : (
              s.value
            )}
          </motion.span>
          <span className="text-white/80 text-base mt-2">{s.label}</span>
        </motion.div>
      ))}
    </div>
  </section>
);

// ====== COUNTUP COMPONENT ======
function CountUp({ end }) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      setVal(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setVal(end);
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [end]);
  return <>{val.toLocaleString()}</>;
}

// ====== FOOTER ======
const Footer = () => (
  <footer className="w-full bg-black/80 border-t border-white/10 py-8 mt-16">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold text-cyan-400">DarkNode</span>
        <span className="text-white/50 text-sm">©2025</span>
      </div>
      <ul className="flex items-center gap-6 text-white/80 text-sm">
        <li><a href="#" className="hover:text-cyan-400 transition">About</a></li>
        <li><a href="#" className="hover:text-cyan-400 transition">GitHub</a></li>
        <li><a href="#" className="hover:text-cyan-400 transition">Terms</a></li>
        <li><a href="#" className="hover:text-cyan-400 transition">Privacy</a></li>
      </ul>
      <div className="flex items-center gap-4">
        {/* Placeholder social icons */}
        <a href="#" className="text-cyan-400 hover:text-white transition">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M22 5.924c-.793.352-1.645.59-2.54.698a4.48 4.48 0 0 0 1.963-2.47 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 11.03 9.03a12.72 12.72 0 0 1-9.24-4.684s-1.64 2.94 2.07 4.29a4.48 4.48 0 0 1-2.03-.56c0 2.13 1.51 3.9 3.72 4.32a4.48 4.48 0 0 1-2.02.08c.57 1.78 2.23 3.08 4.2 3.12A8.98 8.98 0 0 1 2 19.07a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.19-.01-.38-.02-.57A9.1 9.1 0 0 0 24 4.59a8.98 8.98 0 0 1-2.6.71z" fill="currentColor"/></svg>
        </a>
        <a href="#" className="text-cyan-400 hover:text-white transition">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </a>
      </div>
    </div>
  </footer>
);

// ====== MAIN HOMEPAGE COMPONENT ======
export default function Homepage() {
  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] text-white relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Statistics />
      <Footer />
    </div>
  );
} 