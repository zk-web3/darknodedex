import React, { useState } from 'react';
import Layout from '../src/components/Layout';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const LiquidityPage = () => {
    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'remove'

    return (
        <Layout>
            <div className="flex flex-col items-center justify-start min-h-[calc(100vh-80px)] py-8 px-4 font-rajdhani">
                <h1 className="text-5xl font-bold text-white mb-8 neon-text">Positions</h1>

                {!isConnected ? (
                    <div className="bg-gray-900 p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-gray-700 glassmorphism-bg">
                        <p className="text-lg text-gray-300 mb-4">Connect your wallet to manage your liquidity positions.</p>
                        <p className="text-sm text-gray-500">Your active liquidity positions will appear here.</p>
                    </div>
                ) : (
                    <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-2xl w-full border border-gray-700 glassmorphism-bg">
                        <div className="flex justify-center mb-6 border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 focus:outline-none
                                    ${activeTab === 'add' ? 'text-darknode-neon-cyan border-b-2 border-darknode-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                            >
                                Add Liquidity
                            </button>
                            <button
                                onClick={() => setActiveTab('remove')}
                                className={`px-6 py-3 text-lg font-semibold transition-colors duration-200 focus:outline-none
                                    ${activeTab === 'remove' ? 'text-darknode-neon-cyan border-b-2 border-darknode-neon-cyan' : 'text-gray-400 hover:text-white'}`}
                            >
                                Remove Liquidity
                            </button>
                        </div>

                        {activeTab === 'add' ? (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-3">Add New Position</h2>
                                <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
                                    <p className="text-gray-300">Select a token pair and define your price range to add liquidity.</p>
                                    <ul className="text-gray-400 text-sm list-disc list-inside ml-4 space-y-1">
                                        <li>Token A & Token B selection (e.g., WETH/USDC)</li>
                                        <li>Amount inputs for each token</li>
                                        <li>**Concentrated Liquidity Price Range Selection**</li>
                                        <li>Approve and Add Liquidity transaction flow</li>
                                        <li>Estimated gas fees for your transaction</li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-4">*Note: Full liquidity management functionality is under development.*</p>
                                </div>
                                {/* Add placeholder for token selection and input fields with SushiSwap-like styling */}
                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-semibold text-white mb-2">Pool Selection (Coming Soon)</h3>
                                    <div className="bg-gray-700 p-3 rounded-md text-gray-400">
                                        <p>Search for a pool or select from popular pairs.</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-semibold text-white mb-2">Your Amount (Coming Soon)</h3>
                                    <input
                                        type="text"
                                        placeholder="Enter amount for Token A"
                                        className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        disabled
                                    />
                                    <input
                                        type="text"
                                        placeholder="Enter amount for Token B"
                                        className="w-full p-3 mt-3 bg-gray-700 rounded-md border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                        disabled
                                    />
                                </div>

                                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 rounded-lg text-lg opacity-50 cursor-not-allowed">
                                    Add Liquidity (Dev)
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-3">Your Active Positions</h2>
                                <div className="p-5 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
                                    <p className="text-gray-300">View and manage your Uniswap V3 liquidity positions (NFTs).</p>
                                    <ul className="text-gray-400 text-sm list-disc list-inside ml-4 space-y-1">
                                        <li>Detailed view of each position (tokens, amounts, price range)</li>
                                        <li>Claim accrued fees from your positions</li>
                                        <li>Option to remove liquidity (partial or full)</li>
                                        <li>Estimated gas fees for position management</li>
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-4">*Note: Full liquidity management functionality is under development.*</p>
                                </div>

                                {/* Placeholder for existing positions list */}
                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-semibold text-white mb-2">No Active Positions Found</h3>
                                    <p className="text-gray-400 text-sm">Once you add liquidity, your positions will appear here.</p>
                                    <Link href="#" className="text-darknode-neon-cyan hover:underline mt-2 inline-block text-sm">
                                        Learn about providing liquidity
                                    </Link>
                                </div>

                                <button className="w-full bg-gray-600 text-white font-bold py-3 rounded-lg text-lg opacity-50 cursor-not-allowed">
                                    Manage Positions (Dev)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LiquidityPage; 