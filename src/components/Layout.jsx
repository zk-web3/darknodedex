import Navbar from './Navbar';
import Footer from './Footer';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { toast } from 'react-hot-toast';
import { injected } from 'wagmi/connectors';
import React, { useState, useEffect } from 'react';

const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia Chain ID

const Layout = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const { address, isConnected, chain } = useAccount();
    const { connect } = useConnect();
    const { switchChain } = useSwitchChain();

    const handleConnectWallet = () => {
        if (isConnected) {
            if (chain?.id === BASE_SEPOLIA_CHAIN_ID) {
                toast.success("You Are Already On Base Sepolia");
            } else {
                toast.error("Please connect to Base Sepolia Network.");
                if (switchChain) {
                    switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
                }
            }
        } else {
            connect({ connector: injected() });
        }
    };

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