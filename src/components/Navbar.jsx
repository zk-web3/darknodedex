import Link from 'next/link';
import { FiSettings, FiExternalLink, FiCopy } from 'react-icons/fi';
import { useDisconnect } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Helper function for conditional class joining
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ isConnected, address, handleConnectWallet, chain }) {
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet';
  const explorerUrl = chain?.blockExplorers?.default?.url;

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!');
    }
  };

  if (!mounted) {
    return null; // Render nothing on the server
  }

  return (
    <nav className="bg-dark-secondary bg-opacity-80 backdrop-filter backdrop-blur-lg shadow-lg py-4 px-8 flex items-center justify-between z-20 sticky top-0 h-20 border-b border-neon-purple/50">
      <div className="flex items-center">
        <Link href="/">
          <div className="text-3xl font-bold text-neon-pink cursor-pointer transition-colors duration-300 hover:text-neon-blue mr-8">
            DN
          </div>
        </Link>
        <div className="flex space-x-6 text-lg">
          <Link href="/swap" className="text-neon-pink hover:text-neon-blue transition-colors duration-300 px-3 py-2 rounded-md">
            Swap
          </Link>
          <Link href="/liquidity" className="text-neon-pink hover:text-neon-blue transition-colors duration-300 px-3 py-2 rounded-md">
            Liquidity
          </Link>
          <Link href="/tokens" className="text-neon-pink hover:text-neon-blue transition-colors duration-300 px-3 py-2 rounded-md">
            Tokens
          </Link>
          <Link href="/about" className="text-neon-pink hover:text-neon-blue transition-colors duration-300 px-3 py-2 rounded-md">
            About
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="bg-dark-accent text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          Base Sepolia
        </div>
        <div className="relative">
          <button
            onClick={() => { if (!isConnected) handleConnectWallet(); else setIsDropdownOpen(!isDropdownOpen); }}
            className="bg-neon-pink hover:bg-neon-blue text-dark-background font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg neon-glow-pink"
          >
            {displayAddress}
          </button>
          {isConnected && isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-dark-secondary rounded-lg shadow-xl py-2 z-30 border border-neon-purple/50">
              <button
                onClick={handleCopyAddress}
                className="flex items-center w-full px-4 py-2 text-sm text-neon-pink hover:bg-dark-background/50"
              >
                <FiCopy className="mr-2" /> Copy Address
              </button>
              {explorerUrl && (
                <a
                  href={`${explorerUrl}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full px-4 py-2 text-sm text-neon-pink hover:bg-dark-background/50"
                >
                  <FiExternalLink className="mr-2" /> View on Explorer
                </a>
              )}
              <button
                onClick={() => { disconnect(); toast.success('Wallet Disconnected!'); setIsDropdownOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-dark-background/50 border-t border-neon-purple/50 mt-1 pt-2"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
        <button className="text-neon-pink hover:text-neon-blue transition-colors duration-300">
          <FiSettings size={24} />
        </button>
      </div>
    </nav>
  );
} 