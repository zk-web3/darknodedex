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

export const WETH_TOKEN = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH address
  decimals: 18,
  logo: 'https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295',
};

export const USDC_TOKEN = {
  name: 'USD Coin',
  symbol: 'USDC',
  address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC address
  decimals: 6,
  logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389',
};

export const WBTC_TOKEN = {
  name: 'Wrapped Bitcoin',
  symbol: 'WBTC',
  address: '0xA0a5Ad2296b38Bd3E3Eb59AeE5A6f97C5B0B1C1c',
  decimals: 8,
  logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
};

export const TOKENS = [
  WETH_TOKEN,
  USDC_TOKEN,
  WBTC_TOKEN,
];

export const TOKENS_BY_ADDRESS = TOKENS.reduce((acc, token) => {
  acc[token.address.toLowerCase()] = token;
  return acc;
}, {});