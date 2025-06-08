export const UNISWAP_ROUTER = {
  address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // Uniswap V3 router on Sepolia
  abi: [
    // --- UniswapV2Router02 ABI (truncated for brevity, use full ABI in production) ---
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "swapExactTokensForTokens",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "swapExactTokensForETH",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "swapExactETHForTokens",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" }
      ],
      "name": "getAmountsOut",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
    // ... (add the rest of the ABI for production use)
  ],
}; 