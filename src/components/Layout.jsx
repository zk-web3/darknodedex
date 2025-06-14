import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, isConnected, address, chain, handleConnectWallet }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-900 font-inter text-white">
            <Navbar isConnected={isConnected} address={address} chain={chain} handleConnectWallet={handleConnectWallet} />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout; 