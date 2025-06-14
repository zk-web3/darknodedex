import React from 'react';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-darknode-bg-dark text-darknode-text-light font-exo">
      <Navbar />
      <main className="flex-grow flex flex-col items-center p-4">
        <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-darknode-neon-purple mb-8">ABOUT DARKNODE DEX</h1>

        <section className="w-full max-w-3xl bg-darknode-bg-light rounded-2xl p-6 shadow-neon-purple shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-darknode-text-light mb-4">Protocol Overview</h2>
          <p className="text-darknode-text-medium leading-relaxed mb-4">
            DarkNode DEX is a decentralized exchange built on the Base Sepolia Testnet, offering a secure and efficient platform for trading cryptocurrencies. Leveraging the power of Uniswap V3, DarkNode provides a cutting-edge trading experience with features like concentrated liquidity, flexible fee tiers, and capital efficiency.
          </p>
          <p className="text-darknode-text-medium leading-relaxed">
            Our mission is to provide a robust and user-friendly DEX that showcases the capabilities of decentralized finance on the Base network, enabling users to swap tokens, provide liquidity, and explore the ecosystem with ease.
          </p>
        </section>

        <section className="w-full max-w-3xl bg-darknode-bg-light rounded-2xl p-6 shadow-neon-purple shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-darknode-text-light mb-4">Links & Resources</h2>
          <ul className="list-disc list-inside text-darknode-text-medium space-y-2">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline">DarkNode Docs (Coming Soon)</a>
            </li>
            <li>
              <a href="https://github.com/your-github/darknode-dex" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline">GitHub Repository</a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline">Twitter / X</a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline">Discord Community</a>
            </li>
          </ul>
        </section>

        <section className="w-full max-w-3xl bg-darknode-bg-light rounded-2xl p-6 shadow-neon-purple shadow-lg">
          <h2 className="text-2xl font-bold text-darknode-text-light mb-4">Our Team</h2>
          <p className="text-darknode-text-medium leading-relaxed">
            We are a dedicated team of blockchain enthusiasts and developers passionate about building innovative decentralized applications. Our goal is to contribute to the growth of the DeFi ecosystem on Base and provide a secure and transparent trading experience for our users.
          </p>
          {/* You can add team member names/roles here if desired */}
        </section>
      </main>
      <Footer />
    </div>
  );
} 