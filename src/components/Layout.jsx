import Navbar from './Navbar';
import Footer from './Footer';
// Removed Wagmi imports from here as they are now in _app.jsx
// import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { toast } from 'react-hot-toast';
// import { injected } from 'wagmi/connectors'; // Not needed here anymore
import React, { useState, useEffect } from 'react';

// const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia Chain ID - now handled by handleConnectWallet prop

const Layout = ({ children, isConnected, address, chain, handleConnectWallet }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Wagmi hooks are now passed as props from _app.jsx
    // const { address, isConnected, chain } = useAccount();
    // const { connect } = useConnect();
    // const { switchChain } = useSwitchChain();

    // handleConnectWallet is now passed as a prop from _app.jsx
    // const handleConnectWallet = () => {
    //     if (isConnected) {
    //         if (chain?.id === BASE_SEPOLIA_CHAIN_ID) {
    //             toast.success("You Are Already On Base Sepolia");
    //         } else {
    //             toast.error("Please connect to Base Sepolia Network.");
    //             if (switchChain) {
    //                 switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
    //             }
    //         }
    //     } else {
    //         connect({ connector: injected() });
    //     }
    // };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 font-inter text-white">
            <Navbar isConnected={isConnected} address={address} chain={chain} handleConnectWallet={handleConnectWallet} />
            <main className="flex-grow container mx-auto px-4 py-8">
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            isConnected,
                            address,
                            chain,
                            handleConnectWallet,
                        });
                    }
                    return child;
                })}
            </main>
            <Footer />
        </div>
    );
};

export default Layout; 