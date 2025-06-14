import React from 'react';
import Link from 'next/link';
import Layout from '../src/components/Layout';

export default function Home() {
  return (
    <Layout>
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center min-h-[calc(100vh-80px)]">
        <h1 className="text-5xl md:text-7xl font-bold font-orbitron text-darknode-neon-purple mb-6 animate-pulse-light">
          Welcome to DarkNode DEX
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8 text-darknode-text-medium leading-relaxed">
          Your gateway to seamless, secure, and decentralized trading on the Base Sepolia Testnet.
          Experience the future of finance with unparalleled speed and efficiency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl mt-12">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 glassmorphism-bg transform transition-all duration-300 hover:scale-105 hover:border-purple-500">
            <h3 className="text-2xl font-bold text-white mb-4 neon-text">Key Features</h3>
            <ul className="text-gray-300 text-left space-y-2">
              <li>Fast & Secure Swaps</li>
              <li>Liquidity Provision</li>
              <li>Real-time Data</li>
              <li>MetaMask Integration</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 glassmorphism-bg transform transition-all duration-300 hover:scale-105 hover:border-purple-500">
            <h3 className="text-2xl font-bold text-white mb-4 neon-text">Supported Networks</h3>
            <p className="text-gray-300 text-left">Base Sepolia Testnet</p>
            <p className="text-gray-400 text-sm mt-2">(More networks coming soon!)</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 glassmorphism-bg transform transition-all duration-300 hover:scale-105 hover:border-purple-500">
            <h3 className="text-2xl font-bold text-white mb-4 neon-text">About Us</h3>
            <p className="text-gray-300 text-left">DarkNode DEX aims to provide a robust and user-friendly decentralized exchange experience.</p>
            <Link href="/about" className="text-darknode-neon-cyan hover:underline mt-2 inline-block">Learn More</Link>
          </div>
        </div>

        <Link href="/swap" className="bg-darknode-neon-purple text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-darknode-neon-purple/50 mt-12">
            Launch App
        </Link>
      </main>
    </Layout>
  );
} 