import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Callout from "./components/Callout";
import WhyDarkNode from "./components/WhyDarkNode";
import Footer from "./components/Footer";
import GlowingCursor from "./components/GlowingCursor";
import Modal from "./components/Modal";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const showModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] text-white relative overflow-x-hidden">
      <GlowingCursor />
      <Navbar onNavClick={showModal} onWalletClick={showModal} />
      <div onClick={showModal}>
        <Hero />
        <Features />
        <Stats />
        <Callout />
        <WhyDarkNode />
      </div>
      <Footer onFooterLinkClick={showModal} />
      <Modal open={modalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-2">App is under progress</h2>
        <p className="text-white/80">This feature will be available soon.</p>
      </Modal>
    </div>
  );
} 