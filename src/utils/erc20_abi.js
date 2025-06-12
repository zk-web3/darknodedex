// utils/erc20_abi.js
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];
  export default ERC20_ABI;
  