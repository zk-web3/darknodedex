// Minimal ERC20 ABI for common functions (balanceOf, approve, transferFrom, decimals, symbol, name)
export const ERC20_ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  
  // Write Functions
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

export const tokens = [
  {
    name: 'Ether',
    symbol: 'ETH',
    address: '0x0000000000000000000000000000000000000000', // Special address for native ETH
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1696501628',
  },
  {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006', // WETH on Base Sepolia
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295',
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f954C3dc3B9D50edEe08467', // USDC on Base Sepolia
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389',
  },
  {
    name: 'DarkNode Token',
    symbol: 'DN',
    address: '0x7a232f05a5a6D0803534b7f8B47C569D9E06716a', // Placeholder - REPLACE WITH YOUR DEPLOYED DN TOKEN ADDRESS
    decimals: 18,
    logoURI: 'https://via.placeholder.com/24/purple/white?text=DN',
  },
  // Add more tokens here if they are officially deployed and have liquidity on Base Sepolia Uniswap V3
]; 