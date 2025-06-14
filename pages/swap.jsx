import React from 'react';
import Layout from '../src/components/Layout';
import dynamic from 'next/dynamic';
import { UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, UNISWAP_QUOTER_ADDRESS, UNISWAP_QUOTER_ABI, BASE_SEPOLIA_EXPLORER_URL } from '../src/utils/uniswap';
import { ERC20_ABI } from '../src/utils/tokens';

const DynamicSwapCard = dynamic(() => import('../src/components/SwapCard'), { ssr: false });

const SwapPage = ({ isConnected, address, chain, handleConnectWallet }) => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4">
                <h1 className="text-5xl font-bold text-white mb-8 neon-text">Trade</h1>
                <DynamicSwapCard
                    isConnected={isConnected}
                    address={address}
                    handleConnectWallet={handleConnectWallet}
                    chain={chain}
                />
            </div>
        </Layout>
    );
};

export default SwapPage;