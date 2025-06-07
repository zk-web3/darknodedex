import React, { useState } from "react";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";
import TokenListDrawer from "./components/TokenListDrawer";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const [page, setPage] = useState("swap");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null);

  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] text-white relative overflow-x-hidden">
      <nav className="flex justify-center gap-6 py-8">
        <button
          className={`px-6 py-2 rounded-2xl font-bold text-lg transition bg-black/30 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 ${page === "swap" ? "bg-cyan-500/80 text-white" : ""}`}
          onClick={() => setPage("swap")}
        >
          Swap
        </button>
        <button
          className={`px-6 py-2 rounded-2xl font-bold text-lg transition bg-black/30 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 ${page === "liquidity" ? "bg-purple-600/80 text-white" : ""}`}
          onClick={() => setPage("liquidity")}
        >
          Liquidity
        </button>
      </nav>
      {page === "swap" && (
        <Swap
          onOpenSettings={openSettings}
          onOpenTokenList={openDrawer}
          onConnectWallet={() => {}}
        />
      )}
      {page === "liquidity" && (
        <Liquidity
          onOpenTokenList={openDrawer}
        />
      )}
      <TokenListDrawer open={drawerOpen} onClose={closeDrawer} />
      <SettingsModal open={settingsOpen} onClose={closeSettings} />
    </div>
  );
} 