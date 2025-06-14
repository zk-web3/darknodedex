import '../src/styles/globals.css';
import { WagmiProvider, useAccount, useConnect, useSwitchChain } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../src/utils/wallet';
import { Toaster, toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { injected } from 'wagmi/connectors';

const queryClient = new QueryClient();

// Dynamically import Layout with ssr: false
const DynamicLayout = dynamic(() => import('../src/components/Layout'), { ssr: false });

const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia Chain ID

function MyApp({ Component, pageProps }) {
  // Define Wagmi hooks and handleConnectWallet here at the root
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

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DynamicLayout
          isConnected={isConnected}
          address={address}
          chain={chain}
          handleConnectWallet={handleConnectWallet}
        >
          <Component {...pageProps} />
        </DynamicLayout>
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp; 