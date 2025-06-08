import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronDown, FiCopy, FiExternalLink, FiLogOut } from "react-icons/fi";

const links = [
  { name: "Home", href: "#" },
  { name: "Swap", href: "#" },
  { name: "Liquidity", href: "#" },
  { name: "Faucet", href: "#" },
  { name: "Docs", href: "https://docs.darknode.xyz", external: true },
];

export default function Navbar({ onNavClick, onWalletClick, activePage, address, onDisconnect }) {
  const [open, setOpen] = useState(false);
  const [walletMenu, setWalletMenu] = useState(false);
  const walletRef = React.useRef();

  // Close wallet menu on outside click
  React.useEffect(() => {
    function handleClick(e) {
      if (walletRef.current && !walletRef.current.contains(e.target)) {
        setWalletMenu(false);
      }
    }
    if (walletMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [walletMenu]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
  };

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
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    activePage === link.name
                      ? "text-cyan-400"
                      : "hover:text-cyan-400 transition"
                  }
                >
                  {link.name}
                </a>
              ) : (
                <button
                  className="relative px-2 py-1 focus:outline-none"
                  onClick={() => onNavClick(link.name)}
                >
                  <span
                    className={
                      activePage === link.name
                        ? "text-cyan-400"
                        : "hover:text-cyan-400 transition"
                    }
                  >
                    {link.name}
                  </span>
                  {activePage === link.name && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-0 right-0 -bottom-1 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
        {address ? (
          <div className="relative" ref={walletRef}>
            <button
              className="ml-4 px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-purple-400 transition backdrop-blur border border-cyan-400/30 flex items-center gap-2"
              onClick={() => setWalletMenu((v) => !v)}
            >
              {`0x${address.slice(2, 8)}...${address.slice(-4)}`}
              <FiChevronDown />
            </button>
            {walletMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-black/90 border border-cyan-400/20 rounded-xl shadow-lg z-50 py-2">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-cyan-300 hover:bg-cyan-400/10 transition text-left"
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, "_blank")}
                >
                  <FiExternalLink /> View on Explorer
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-cyan-300 hover:bg-cyan-400/10 transition text-left"
                  onClick={handleCopy}
                >
                  <FiCopy /> Copy Address
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 transition text-left"
                  onClick={() => { setWalletMenu(false); onDisconnect(); }}
                >
                  <FiLogOut /> Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="ml-4 px-5 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-purple-400 transition backdrop-blur border border-cyan-400/30" onClick={onWalletClick}>
            Connect Wallet
          </button>
        )}
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
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    activePage === link.name
                      ? "text-cyan-400"
                      : "text-white/90 hover:text-cyan-400"
                  }
                  onClick={() => setOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <button
                  className={
                    "w-full text-left py-2 px-2 text-lg " +
                    (activePage === link.name ? "text-cyan-400" : "text-white/90 hover:text-cyan-400")
                  }
                  onClick={() => {
                    onNavClick(link.name);
                    setOpen(false);
                  }}
                >
                  {link.name}
                </button>
              )}
            </li>
          ))}
        </motion.ul>
      )}
    </header>
  );
} 