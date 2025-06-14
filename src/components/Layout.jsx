import Navbar from './Navbar';
import Footer from './Footer';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { baseSepolia } from 'wagmi/chains';

export default function Layout({ children }) {
    const { address, isConnected, chain } = useAccount();
    const { connect } = useConnect();
    const { switchChain } = useSwitchChain();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleConnectWallet = async () => {
        if (isConnected) {
            if (chain?.id !== baseSepolia.id) {
                try {
                    await switchChain({
                        chainId: baseSepolia.id,
                    });
                    toast.success('Switched to Base Sepolia Network!');
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        toast.error('Base Sepolia network not found. Please add it to MetaMask.');
                    } else {
                        toast.error(`Failed to switch network: ${switchError.message}`);
                    }
                }
            } else {
                toast.success('Wallet is already connected and on Base Sepolia Network!');
            }
        } else {
            try {
                await connect({
                    connector: injected(),
                });
                toast.success('Wallet Connected!');
            } catch (connectError) {
                toast.error(`Failed to connect wallet: ${connectError.message}`);
            }
        }
    };

    if (!mounted) {
        return null; // Render nothing on the server
    }

    return (
        <div className="min-h-screen flex flex-col bg-dark-background text-neon-pink font-cyberpunk relative">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900 to-black animate-gradient-shift"></div>
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-neon-blue filter blur-3xl opacity-30 animate-pulse-light"></div>
                <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-pink-900 to-black animate-gradient-shift delay-500"></div>
                <div className="absolute top-1/2 right-1/4 w-1/3 h-1/3 rounded-full bg-neon-purple filter blur-3xl opacity-30 animate-pulse-light delay-200"></div>
            </div>

            <Navbar
                isConnected={isConnected}
                address={address}
                handleConnectWallet={handleConnectWallet}
                chain={chain}
            />
            <main className="flex-grow container mx-auto p-4 z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
} 