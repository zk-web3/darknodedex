import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";
import Faucet from "./components/Faucet";
import TokenListDrawer from "./components/TokenListDrawer";
import SettingsModal from "./components/SettingsModal";
import Modal from "./components/Modal";
import { ethers } from "ethers";

const PAGES = ["Home", "Swap", "Liquidity", "Faucet"];

export default function App() {
  const [page, setPage] = useState("Home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawerType, setDrawerType] = useState(null);
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState();

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

  // Global wallet connect logic with error handling
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install MetaMask extension.");
      return;
    }
    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const net = await prov.getNetwork();
      if (net.chainId !== 11155111) {
        // Sepolia = 11155111
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia
          });
        } catch (e) {
          alert("User rejected the request to switch to Sepolia network.");
          return;
        }
      }
      setProvider(prov);
      setSigner(prov.getSigner());
      setAddress(await prov.getSigner().getAddress());
      setNetwork(await prov.getNetwork());
    } catch (err) {
      if (err.code === 4001) {
        alert("User rejected the connection request.");
      } else if (
        err.code === 'NETWORK_ERROR' &&
        err.message &&
        err.message.toLowerCase().includes('underlying network changed')
      ) {
        alert(
          "Network changed while connecting. Please wait, the page will reload to sync with MetaMask."
        );
        setTimeout(() => window.location.reload(), 1200);
      } else {
        alert("MetaMask connection failed: " + err.message);
      }
    }
  };

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      setAddress(accounts[0] || "");
    };
    const handleChainChanged = () => {
      window.location.reload();
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const handleLaunchApp = () => setPage("Swap");

  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] text-white relative overflow-x-hidden">
      <Navbar
        onNavClick={handleNavClick}
        onWalletClick={connectWallet}
        activePage={page}
        address={address}
        network={network}
      />
      {page === "Home" && <Hero onLaunchApp={handleLaunchApp} />}
      {page === "Swap" && (
        <Swap
          onOpenSettings={openSettings}
          onOpenTokenList={openDrawer}
          connectWallet={connectWallet}
          address={address}
          network={network}
          provider={provider}
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
    </div>
  );
} 