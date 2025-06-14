import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../src/components/Layout';
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
    <Layout>
      <main className="flex-grow flex flex-col items-center p-4 min-h-[calc(100vh-80px)] font-rajdhani">
        <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-darknode-neon-purple mb-8">Tokens Overview</h1>

        {/* Tokens List Section */}
        <div className="w-full max-w-4xl mb-12 bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700 glassmorphism-bg">
            <h2 className="text-2xl font-bold text-white mb-6">Supported Tokens</h2>

            {!isConnected || !isBaseSepolia ? (
                <div className="text-center text-lg text-gray-300">
                    <p className="mb-4">Connect your wallet to see your token balances and add tokens.</p>
                    <p className="text-sm text-gray-500">Please connect your MetaMask wallet and switch to Base Sepolia to view your balances.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokens.map((token) => (
                    <div key={token.address} className="bg-gray-800 p-5 rounded-lg border border-gray-700 glassmorphism-card-sm transition-transform duration-200 hover:scale-[1.02] relative group">
                        <div className="flex items-center mb-3">
                            <img src={token.logoURI} alt={token.symbol} className="w-10 h-10 mr-3 rounded-full border border-gray-600" />
                            <h3 className="text-xl font-semibold text-white">{token.symbol}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{token.name}</p>
                        <p className="text-gray-500 text-xs truncate mb-1">Address: {token.address}</p>
                        <p className="text-gray-500 text-xs">Decimals: {token.decimals}</p>
                        <p className="text-white text-md font-bold mt-3">
                            Balance: {loadingBalances ? "Loading..." : tokenBalances[token.address] ? Number(tokenBalances[token.address]).toFixed(4) : "0.0000"}
                        </p>
                        {token.symbol !== "WETH" && (
                            <button
                                onClick={() => addTokenToMetaMask(token)}
                                className="absolute top-4 right-4 bg-purple-600/20 text-darknode-neon-purple px-3 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                title="Add to MetaMask"
                            >
                                Add to Metamask
                            </button>
                        )}
                    </div>
                ))}
                </div>
            )}
        </div>

        {/* Staking Section (Placeholder) */}
        <div className="w-full max-w-4xl bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700 glassmorphism-bg mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Stake Your Tokens</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
                Participate in DarkNode DEX's future by staking your tokens to earn rewards and contribute to network security.
                This feature will allow you to lock up your assets for a period to receive governance tokens or other incentives.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 glassmorphism-card-sm">
                    <h3 className="text-xl font-semibold text-white mb-2">Earn Rewards</h3>
                    <p className="text-gray-400 text-sm">Stake various tokens to earn protocol fees and rewards.</p>
                    <ul className="text-gray-500 text-xs mt-2 list-disc list-inside">
                        <li>Coming Soon: APR display</li>
                        <li>Coming Soon: Supported staking pools</li>
                    </ul>
                </div>
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 glassmorphism-card-sm">
                    <h3 className="text-xl font-semibold text-white mb-2">Governance & Voting</h3>
                    <p className="text-gray-400 text-sm">Stake governance tokens to participate in DEX proposals and voting.</p>
                    <ul className="text-gray-500 text-xs mt-2 list-disc list-inside">
                        <li>Coming Soon: Decentralized Governance</li>
                        <li>Coming Soon: DAO integration</li>
                    </ul>
                </div>
            </div>
            <button className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 rounded-lg text-lg opacity-50 cursor-not-allowed">
                Explore Staking (Coming Soon)
            </button>
        </div>

        {/* Testnet Faucets Section */}
        <div className="w-full max-w-4xl bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700 glassmorphism-bg">
            <h2 className="text-2xl font-bold text-white mb-4">Testnet Faucets</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">Get free testnet tokens for Base Sepolia to try out the DEX! Remember, testnet tokens have no real-world value.</p>
            <ul className="list-disc list-inside space-y-3 text-gray-300">
                <li>
                    <a
                        href="https://www.base.org/sepolia/docs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-darknode-neon-cyan hover:underline font-medium"
                    >
                        Base Sepolia ETH Faucet (Official Docs)
                    </a>
                    <p className="text-gray-500 text-sm">Official Base documentation with links to ETH faucets.</p>
                </li>
                <li>
                    <a
                        href="https://faucet.quicknode.com/base/sepolia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-darknode-neon-cyan hover:underline font-medium"
                    >
                        QuickNode Base Sepolia Faucet (for ETH)
                    </a>
                    <p className="text-gray-500 text-sm">A reliable faucet for obtaining Base Sepolia ETH.</p>
                </li>
                <li>
                    <p className="text-gray-400">For other tokens (e.g., USDC, DAI), specific faucets may be limited. You may need to bridge them from other Sepolia networks or explore community-driven faucets. Always exercise caution with third-party faucets.</p>
                </li>
            </ul>
        </div>

      </main>
    </Layout>
  );
} 