import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { TOKENS, ERC20_ABI } from '../src/utils/tokens';
import { useAccount, usePublicClient, useNetwork } from 'wagmi';
import { formatUnits, parseEther } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { toast } from 'react-hot-toast';

export default function TokensPage() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const [tokenBalances, setTokenBalances] = useState({});
  const [loadingBalances, setLoadingBalances] = useState(true);

  const isBaseSepolia = chain?.id === baseSepolia.id;

  const fetchAllBalances = useCallback(async () => {
    if (!isConnected || !address || !publicClient || !isBaseSepolia) {
      setLoadingBalances(false);
      return;
    }
    setLoadingBalances(true);
    const newBalances = {};
    for (const token of TOKENS) {
      try {
        if (token.symbol === "WETH") {
          // For native token (WETH placeholder for ETH)
          const balance = await publicClient.getBalance({
            address: address
          });
          newBalances[token.address] = formatEther(balance);
        } else {
          const data = await publicClient.readContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
          });
          newBalances[token.address] = formatUnits(data, token.decimals);
        }
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error);
        newBalances[token.address] = "0.0000";
      }
    }
    setTokenBalances(newBalances);
    setLoadingBalances(false);
  }, [address, isConnected, publicClient, isBaseSepolia]);

  useEffect(() => {
    fetchAllBalances();
    const interval = setInterval(fetchAllBalances, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, [fetchAllBalances]);

  const addTokenToMetaMask = async (token) => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed.");
      return;
    }
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
          },
        },
      });

      if (wasAdded) {
        toast.success(`${token.symbol} has been added to MetaMask!`);
      } else {
        toast.error(`Failed to add ${token.symbol} to MetaMask.`);
      }
    } catch (error) {
      console.error("Error adding token to MetaMask:", error);
      toast.error("Failed to add token to MetaMask.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-darknode-bg-dark text-darknode-text-light font-exo">
      <Navbar />
      <main className="flex-grow flex flex-col items-center p-4">
        <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-darknode-neon-purple mb-8">AVAILABLE TOKENS</h1>

        {!isConnected || !isBaseSepolia ? (
          <div className="text-center text-lg text-darknode-text-medium mb-8">
            <p className="mb-4">Connect your wallet to see your token balances and add tokens.</p>
            <ConnectButton label="Connect Wallet" chainStatus="icon" showBalance={{ smallScreen: false, largeScreen: true }} />
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-darknode-bg-light rounded-2xl p-6 shadow-neon-purple shadow-lg">
            <h2 className="text-2xl font-bold text-darknode-text-light mb-4">Token List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOKENS.map((token) => (
                <div key={token.address} className="bg-darknode-bg-dark p-4 rounded-xl border border-darknode-bg-medium">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-darknode-neon-cyan">{token.symbol}</h3>
                    {token.symbol !== "WETH" && (
                      <button
                        onClick={() => addTokenToMetaMask(token)}
                        className="text-darknode-text-medium hover:text-darknode-neon-purple text-sm transition-colors"
                      >
                        Add to MetaMask
                      </button>
                    )}
                  </div>
                  <p className="text-darknode-text-medium text-sm mb-2">{token.name}</p>
                  <p className="text-darknode-text-light text-sm truncate">Address: {token.address}</p>
                  <p className="text-darknode-text-light text-sm">Decimals: {token.decimals}</p>
                  <p className="text-darknode-text-light text-md font-bold mt-2">
                    Balance: {loadingBalances ? "Loading..." : tokenBalances[token.address] ? Number(tokenBalances[token.address]).toFixed(4) : "0.0000"}
                  </p>
                  {/* Placeholder for Faucet Link */}
                  {token.symbol === "WETH" && (
                    <a
                      href="https://www.base.org/sepolia/docs/" // Official Base Sepolia Faucet documentation
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-darknode-neon-purple hover:text-darknode-neon-cyan text-sm mt-2 inline-block"
                    >
                      Get Sepolia ETH
                    </a>
                  )}
                  {token.symbol !== "WETH" && (
                    <p className="text-darknode-text-medium text-xs mt-2">Faucet link for this token (if available) would go here.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 