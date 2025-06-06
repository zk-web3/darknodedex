import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Callout from "./components/Callout";
import WhyDarkNode from "./components/WhyDarkNode";
import Footer from "./components/Footer";
import GlowingCursor from "./components/GlowingCursor";

export default function App() {
  return (
    <div className="min-h-screen w-full font-sans bg-gradient-to-br from-[#0d0d0d] via-[#23272f] to-[#23272f] text-white relative overflow-x-hidden">
      <GlowingCursor />
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Callout />
      <WhyDarkNode />
      <Footer />
    </div>
  );
} 