import React, { useState } from "react";
import { motion } from "framer-motion";

const links = [
  { name: "Home", href: "#" },
  { name: "Swap", href: "#" },
  { name: "Liquidity", href: "#" },
  { name: "Faucet", href: "#" },
  { name: "Docs", href: "#" },
];

export default function Navbar() {
  const [active, setActive] = useState("Home");
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/10 dark:bg-black/40 border-b border-white/10 shadow-lg">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-widest text-cyan-400 drop-shadow-glow select-none">
            DarkNode
          </span>
        </div>
        <ul className="hidden md:flex items-center gap-8 text-white/90 font-medium">
          {links.map((link) => (
            <li key={link.name}>
              <button
                className="relative px-2 py-1 focus:outline-none"
                onClick={() => setActive(link.name)}
              >
                <span
                  className={
                    active === link.name
                      ? "text-cyan-400"
                      : "hover:text-cyan-400 transition"
                  }
                >
                  {link.name}
                </span>
                {active === link.name && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
        <button className="ml-4 px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-purple-400 transition backdrop-blur border border-cyan-400/30">
          Connect Wallet
        </button>
        {/* Mobile menu button */}
        <button
          className="md:hidden ml-2 text-cyan-400 text-2xl focus:outline-none"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Open Menu</span>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>
      {/* Mobile menu */}
      {open && (
        <motion.ul
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden flex flex-col gap-2 px-6 pb-4 bg-black/80 backdrop-blur-xl border-b border-white/10"
        >
          {links.map((link) => (
            <li key={link.name}>
              <button
                className={
                  "w-full text-left py-2 px-2 text-lg " +
                  (active === link.name ? "text-cyan-400" : "text-white/90 hover:text-cyan-400")
                }
                onClick={() => {
                  setActive(link.name);
                  setOpen(false);
                }}
              >
                {link.name}
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </header>
  );
} 