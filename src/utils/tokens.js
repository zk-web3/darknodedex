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
  address: '0x4200000000000000000000000000000000000006',
  decimals: 18,
  logo: 'https://assets.coingecko.com/coins/images/2518/small/weth.png?1628852295',
};

export const USDC_TOKEN = {
  name: 'USD Coin',
  symbol: 'USDC',
  address: '0x65aFADD39029741B3b8f0756952C74678c9cEC93',
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