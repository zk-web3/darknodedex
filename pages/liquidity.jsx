import React, { useState } from 'react';
import Layout from '../src/components/Layout';
import { useAccount } from 'wagmi';

const LiquidityPage = () => {
    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'remove'

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4">
                <h1 className="text-5xl font-bold text-white mb-8 neon-text">Liquidity Pools</h1>

                {!isConnected ? (
                    <div className="text-center text-lg text-gray-400">
                        <p className="mb-4">Connect your wallet to manage liquidity.</p>
                        {/* The Navbar already has the connect button */}
                    </div>
                ) : (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full border border-purple-500 glassmorphism-bg">
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`px-6 py-2 rounded-l-lg text-lg font-semibold transition-colors duration-200 ${activeTab === 'add' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Add Liquidity
                            </button>
                            <button
                                onClick={() => setActiveTab('remove')}
                                className={`px-6 py-2 rounded-r-lg text-lg font-semibold transition-colors duration-200 ${activeTab === 'remove' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Remove Liquidity
                            </button>
                        </div>

                        {activeTab === 'add' ? (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">Add Liquidity</h2>
                                <p className="text-gray-400">This section will allow you to add liquidity to Uniswap V3 pools.</p>
                                {/* TODO: Implement token selection, amount inputs, and crucially, PRICE RANGE selection for Uniswap V3 */}
                                {/* This will involve: 
                                    - Token A & Token B selection
                                    - Input amounts for Token A & Token B
                                    - Current price display
                                    - Min/Max Price (Price Range) inputs
                                    - Approve buttons for tokens
                                    - Add Liquidity button
                                    - Interacting with Uniswap V3 NonfungiblePositionManager
                                */}
                                <div className="p-4 bg-gray-900 rounded-md border border-gray-700 text-gray-300">
                                    <p>Future development will include:</p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li>Token A & Token B selection</li>
                                        <li>Input for amounts</li>
                                        <li>Price range selection (min/max price for concentrated liquidity)</li>
                                        <li>Gas estimation for adding liquidity</li>
                                        <li>Approve and Add Liquidity transaction logic</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">Remove Liquidity</h2>
                                <p className="text-gray-400">This section will allow you to view and remove your existing Uniswap V3 liquidity positions (NFTs).</p>
                                {/* TODO: Implement displaying user's liquidity positions (NFTs) and removal options */}
                                {/* This will involve:
                                    - Fetching user's Uniswap V3 NFTs (liquidity positions)
                                    - Displaying details of each position (tokens, amounts, price range, collected fees)
                                    - Button to remove liquidity
                                    - Button to collect fees
                                    - Interacting with Uniswap V3 NonfungiblePositionManager
                                */}
                                <div className="p-4 bg-gray-900 rounded-md border border-gray-700 text-gray-300">
                                    <p>Future development will include:</p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li>Displaying your active Uniswap V3 liquidity positions</li>
                                        <li>Options to remove liquidity (partial/full)</li>
                                        <li>Option to claim accrued fees</li>
                                        <li>Gas estimation for removing liquidity</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LiquidityPage; 