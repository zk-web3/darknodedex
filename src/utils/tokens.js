import { ethers } from "ethers";

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

export const TOKENS = [
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006", // Base Sepolia WETH
    decimals: 18,
  },
  {
    name: "Uniswap",
    symbol: "UNI",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // Base Sepolia UNI (example, may need real deployment)
    decimals: 18,
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    address: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // Base Sepolia LINK (example, may need real deployment)
    decimals: 18,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0x0341Fb015f4BA5DcA7F2917d00d78c1266F6f273", // Base Sepolia USDC (example, may need real deployment)
    decimals: 6,
  },
  {
    name: "DarkNode Token",
    symbol: "DN",
    address: "0xYourDNTokenAddressHere", // Placeholder for custom deployed DNToken
    decimals: 18, // Adjust as per your token's decimals
  },
]; 