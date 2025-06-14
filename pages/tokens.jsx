import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { tokens, ERC20_ABI } from '../src/utils/tokens';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { toast } from 'react-hot-toast';

export default function TokensPage() {
  const { address, isConnected, chain } = useAccount();
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
    for (const token of tokens) {
      try {
        if (token.symbol === "WETH") {
          // For native token (WETH placeholder for ETH)
          const balance = await publicClient.getBalance({
            address: address
          });
          newBalances[token.address] = formatUnits(balance, 18);
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
            <p className="text-gray-400">Please connect your MetaMask wallet to view your balances.</p>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-darknode-bg-light rounded-2xl p-6 shadow-neon-purple shadow-lg">
            <h2 className="text-2xl font-bold text-darknode-text-light mb-4">Token List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tokens.map((token) => (
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
                </div>
              ))}
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-darknode-neon-purple mb-4">Testnet Faucets</h2>
                <p className="text-darknode-text-medium mb-4">Get free testnet tokens for Base Sepolia to try out the DEX!</p>
                <ul className="list-disc list-inside space-y-2 text-darknode-text-light">
                    <li>
                        <a 
                            href="https://www.base.org/sepolia/docs/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-darknode-neon-cyan hover:underline"
                        >
                            Base Sepolia ETH Faucet (Official Docs)
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://faucet.quicknode.com/base/sepolia" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-darknode-neon-cyan hover:underline"
                        >
                            QuickNode Base Sepolia Faucet (for ETH)
                        </a>
                    </li>
                    <li>
                        <p className="text-gray-400">For USDC and other tokens, you might need to find specific faucets or bridge them from other Sepolia networks if available. Check community resources for Base Sepolia test tokens.</p>
                        <p className="text-gray-400 text-sm mt-1">*(Note: Specific faucets for all test tokens may vary and might not be readily available.)*</p>
                    </li>
                </ul>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 