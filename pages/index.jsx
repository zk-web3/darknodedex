import React from 'react';
import Link from 'next/link';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-darknode-bg-dark text-darknode-text-light font-exo">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold font-orbitron text-darknode-neon-purple mb-6 animate-pulse-light">
          DARKNODE DEX
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8 text-darknode-text-medium">
          Your gateway to seamless, secure, and decentralized trading on the Base Sepolia Testnet.
          Experience the future of finance with unparalleled speed and efficiency.
        </p>
        <Link href="/swap" className="bg-darknode-neon-purple text-white font-bold py-3 px-8 rounded-xl text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-darknode-neon-purple/50">
            Launch App
        </Link>
      </main>
      <Footer />
    </div>
  );
} 