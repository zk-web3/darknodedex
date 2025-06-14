import '../src/styles/globals.css';
import { WagmiProvider, useAccount, useConnect, useSwitchChain } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../src/utils/wallet'; // We will create this file next
import { Toaster, toast } from 'react-hot-toast';
import Layout from '../src/components/Layout'; // Import Layout
import { injected } from 'wagmi/connectors';

const queryClient = new QueryClient();

const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia Chain ID

function MyApp({ Component, pageProps }) {
  // Removed Wagmi hooks and handleConnectWallet from _app.jsx
  // const { address, isConnected, chain } = useAccount();
  // const { connect } = useConnect();
  // const { switchChain } = useSwitchChain(); // Renamed from useSwitchNetwork

  // const handleConnectWallet = () => {
  //     if (isConnected) {
  //         if (chain?.id === BASE_SEPOLIA_CHAIN_ID) {
  //             toast.success("You Are Already On Base Sepolia");
  //         } else {
  //             toast.error("Please connect to Base Sepolia Network.");
  //             if (switchChain) {
  //                 switchChain(BASE_SEPOLIA_CHAIN_ID);
  //             }
  //         }
  //     } else {
  //         connect({ connector: injected() });
  //     }
  // };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Pass no wallet-related props here; Layout will handle them */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp; 