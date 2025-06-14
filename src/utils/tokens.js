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

export const WETH_ABI = ERC20_ABI;
export const USDC_ABI = ERC20_ABI;
export const DN_ABI = ERC20_ABI;

export const WETH_TOKEN = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  address: '0x4200000000000000000000000000000000000006', // WETH on Base Sepolia
  decimals: 18,
  logo: 'https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295',
};

export const USDC_TOKEN = {
  name: 'USD Coin',
  symbol: 'USDC',
  address: '0x833589fCD6eDb6E08f954C3dc3B9D50edEe08467', // USDC on Base Sepolia
  decimals: 6,
  logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389',
};

export const DN_TOKEN = {
  name: 'DarkNode Token',
  symbol: 'DN',
  address: '0x7a232f05a5a6D0803534b7f8B47C569D9E06716a', // Placeholder - REPLACE WITH YOUR DEPLOYED DN TOKEN ADDRESS
  decimals: 18,
  logo: 'https://via.placeholder.com/24/purple/white?text=DN',
};

export const TOKENS = [
  WETH_TOKEN,
  USDC_TOKEN,
  DN_TOKEN,
];

export const TOKENS_BY_ADDRESS = TOKENS.reduce((acc, token) => {
  acc[token.address.toLowerCase()] = token;
  return acc;
}, {}); 