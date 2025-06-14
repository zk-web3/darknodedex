import '../src/styles/globals.css';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../src/utils/wallet';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const queryClient = new QueryClient();

// Dynamically import Layout with ssr: false
const DynamicLayout = dynamic(() => import('../src/components/Layout'), { ssr: false });

function MyApp({ Component, pageProps }) {
  // All Wagmi hooks and handleConnectWallet are now handled within DynamicLayout
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DynamicLayout>
          <Component {...pageProps} />
        </DynamicLayout>
        <Toaster />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp; 