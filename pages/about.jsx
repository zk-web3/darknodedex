import React from 'react';
import Layout from '../src/components/Layout';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <Layout>
      <main className="flex-grow flex flex-col items-center p-4 min-h-[calc(100vh-80px)] font-rajdhani">
        <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-darknode-neon-purple mb-8">ABOUT DARKNODE DEX</h1>

        <section className="w-full max-w-3xl bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700 glassmorphism-bg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Protocol Overview</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            DarkNode DEX is a decentralized exchange built on the Base Sepolia Testnet, offering a secure and efficient platform for trading cryptocurrencies. Leveraging the power of Uniswap V3, DarkNode provides a cutting-edge trading experience with features like concentrated liquidity, flexible fee tiers, and capital efficiency.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Our mission is to provide a robust and user-friendly DEX that showcases the capabilities of decentralized finance on the Base network, enabling users to swap tokens, provide liquidity, and explore the ecosystem with ease.
          </p>
        </section>

        <section className="w-full max-w-3xl bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700 glassmorphism-bg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Links & Resources</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-3">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline font-medium">DarkNode Docs (Coming Soon)</a>
              <p className="text-gray-500 text-sm mt-1">Dive deeper into our technical specifications and guides.</p>
            </li>
            <li>
              <a href="https://github.com/your-github/darknode-dex" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline font-medium">GitHub Repository</a>
              <p className="text-gray-500 text-sm mt-1">Explore our codebase and contribute to the project.</p>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline font-medium">Twitter / X</a>
              <p className="text-gray-500 text-sm mt-1">Stay updated with the latest news and announcements.</p>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-darknode-neon-cyan hover:underline font-medium">Discord Community</a>
              <p className="text-gray-500 text-sm mt-1">Join our community for support and discussions.</p>
            </li>
          </ul>
        </section>

        <section className="w-full max-w-3xl bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700 glassmorphism-bg">
          <h2 className="text-2xl font-bold text-white mb-4">Our Team</h2>
          <p className="text-gray-300 leading-relaxed">
            We are a dedicated team of blockchain enthusiasts and developers passionate about building innovative decentralized applications. Our goal is to contribute to the growth of the DeFi ecosystem on Base and provide a secure and transparent trading experience for our users.
          </p>
          <p className="text-gray-400 text-sm mt-4">*Individual team member profiles coming soon!*</p>
        </section>
      </main>
    </Layout>
  );
} 