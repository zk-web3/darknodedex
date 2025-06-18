import { http, createConfig } from 'wagmi';
// Monad Testnet chain config
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadScan', url: 'https://monad-testnet.socialscan.io/' },
  },
  testnet: true,
};
import { injected } from 'wagmi/connectors';
export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
  },
}); 