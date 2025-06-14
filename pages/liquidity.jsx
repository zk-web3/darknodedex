import React from 'react';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { useAccount, useNetwork } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function LiquidityPage() {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const isBaseSepolia = chain?.id === baseSepolia.id;

  return (
    <div className="min-h-screen flex flex-col bg-darknode-bg-dark text-darknode-text-light font-exo">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-darknode-neon-purple mb-8">LIQUIDITY</h1>

        {!isConnected ? (
          <div className="text-center text-lg text-darknode-text-medium mb-8">
            <p className="mb-4">Please connect your wallet to manage liquidity.</p>
            <ConnectButton label="Connect Wallet" chainStatus="icon" showBalance={{ smallScreen: false, largeScreen: true }} />
          </div>
        ) : !isBaseSepolia ? (
          <div className="text-center text-lg text-darknode-text-medium mb-8">
            <p className="mb-4">Please switch to Base Sepolia Testnet to manage liquidity.</p>
            <ConnectButton label="Switch Network" chainStatus="icon" showBalance={{ smallScreen: false, largeScreen: true }} />
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto text-center">
            <p className="text-lg text-darknode-text-medium">Liquidity Pool management coming soon!</p>
            {/* LiquidityPoolCard component will go here */}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 