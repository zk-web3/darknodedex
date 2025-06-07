import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";
import Faucet from "./components/Faucet";
import TokenListDrawer from "./components/TokenListDrawer";
import SettingsModal from "./components/SettingsModal";
import Modal from "./components/Modal";

const PAGES = ["Home", "Swap", "Liquidity", "Faucet"];

export default function App() {
  const [page, setPage] = useState("Home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null);
  const [devModalOpen, setDevModalOpen] = useState(false);

  const openDrawer = (type) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);
  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);

  const handleNavClick = (name) => {
    if (name === "Docs") {
      window.open("https://docs.darknode.xyz", "_blank");
      return;
    }
    setPage(name);
  };

  const handleConnectWallet = () => setDevModalOpen(true);
  const closeDevModal = () => setDevModalOpen(false);

  const handleLaunchApp = () => setPage("Swap");

  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] text-white relative overflow-x-hidden">
      <Navbar onNavClick={handleNavClick} onWalletClick={handleConnectWallet} activePage={page} />
      {page === "Home" && <Hero onLaunchApp={handleLaunchApp} />}
      {page === "Swap" && (
        <Swap
          onOpenSettings={openSettings}
          onOpenTokenList={openDrawer}
          onConnectWallet={handleConnectWallet}
        />
      )}
      {page === "Liquidity" && (
        <Liquidity
          onOpenTokenList={openDrawer}
        />
      )}
      {page === "Faucet" && <Faucet />}
      {(page === "Swap" || page === "Liquidity") && (
        <>
          <TokenListDrawer open={drawerOpen} onClose={closeDrawer} />
          <SettingsModal open={settingsOpen} onClose={closeSettings} />
        </>
      )}
      <Modal open={devModalOpen} onClose={closeDevModal}>
        <h2 className="text-2xl font-bold mb-2">App is under development</h2>
        <p className="text-white/80">Wallet connection will be available soon.</p>
      </Modal>
    </div>
  );
} 