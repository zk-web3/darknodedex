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

export const MON_TOKEN = {
  name: 'Monad',
  symbol: 'MON',
  address: '0x0000000000000000000000000000000000000000', // Native
  decimals: 18,
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

export const WMON_TOKEN = {
  name: 'Wrapped Monad',
  symbol: 'WMON',
  address: '0x4200000000000000000000000000000000000006',
  decimals: 18,
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
};

export const USDC_TOKEN = {
  name: 'USD Coin',
  symbol: 'USDC',
  address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  decimals: 6,
  logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389',
};

export const WBTC_TOKEN = {
  name: 'Wrapped Bitcoin',
  symbol: 'WBTC',
  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  decimals: 8,
  logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
};

export const TOKENS = [
  MON_TOKEN,
  WMON_TOKEN,
  USDC_TOKEN,
  WBTC_TOKEN,
];

export const TOKENS_BY_ADDRESS = TOKENS.reduce((acc, token) => {
  acc[token.address.toLowerCase()] = token;
  return acc;
}, {}); 