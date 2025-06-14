import React from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import Layout from '../src/components/Layout';
import SwapCard from '../src/components/SwapCard'; // Import SwapCard
import { tokens } from '../src/utils/tokens';
import { UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, UNISWAP_QUOTER_ADDRESS, UNISWAP_QUOTER_ABI } from '../src/utils/uniswap';
import { ERC20_ABI } from '../src/utils/tokens';


const SwapPage = () => {
    const { address, isConnected } = useAccount();
    const { data: provider } = useProvider();
    const { data: signer } = useSigner();

    const uniswapRouter = { address: UNISWAP_ROUTER_ADDRESS, abi: UNISWAP_ROUTER_ABI };
    const uniswapQuoter = { address: UNISWAP_QUOTER_ADDRESS, abi: UNISWAP_QUOTER_ABI };


    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4">
                <h1 className="text-5xl font-bold text-white mb-8 neon-text">Swap Tokens</h1>
                <SwapCard
                    walletConnected={isConnected}
                    address={address}
                    provider={provider}
                    signer={signer}
                    tokens={tokens}
                    uniswapRouter={uniswapRouter}
                    uniswapQuoter={uniswapQuoter}
                    uniswapRouterAbi={UNISWAP_ROUTER_ABI}
                    erc20Abi={ERC20_ABI}
                />
            </div>
        </Layout>
    );
};

export default SwapPage;