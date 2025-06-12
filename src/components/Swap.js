import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { abi as SWAP_ROUTER_ABI } from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";

// Uniswap V3 Router (Base Sepolia)
const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

// Example tokens (You can replace with actual Base Sepolia tokens)
const TOKENS = [
  {
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18
  },
  {
    symbol: "DAI",
    address: "0xD9bAfC7A7068F695d1FcA9c29063EEC7C4A2D2A8",
    decimals: 18
  }
];

export default function Swap() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null);
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setSigner(signer);
    setWalletAddress(address);
  };

  const handleSwap = async () => {
    if (!signer || !walletAddress) return alert("Connect wallet first.");
    setLoading(true);
    try {
      const router = new ethers.Contract(UNISWAP_V3_ROUTER, SWAP_ROUTER_ABI, signer);
      const amountInWei = ethers.utils.parseUnits(amountIn, tokenIn.decimals);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 mins

      // Approve if ERC20
      const tokenContract = new ethers.Contract(tokenIn.address, [
        "function approve(address spender, uint256 amount) public returns (bool)"
      ], signer);
      const approvalTx = await tokenContract.approve(UNISWAP_V3_ROUTER, amountInWei);
      await approvalTx.wait();

      const params = {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: 3000,
        recipient: walletAddress,
        deadline,
        amountIn: amountInWei,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
      };

      const tx = await router.exactInputSingle(params, {
        value: tokenIn.symbol === "ETH" ? amountInWei : 0
      });

      await tx.wait();
      alert("Swap successful!");
    } catch (err) {
      console.error(err);
      alert("Swap failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>🦄 Uniswap V3 Swap (Base Sepolia)</h2>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
      )}

      <div>
        <label>From Token:</label>
        <select onChange={(e) => setTokenIn(TOKENS[e.target.value])}>
          {TOKENS.map((t, i) => (
            <option value={i} key={i}>{t.symbol}</option>
          ))}
        </select>
      </div>

      <div>
        <label>To Token:</label>
        <select onChange={(e) => setTokenOut(TOKENS[e.target.value])}>
          {TOKENS.map((t, i) => (
            <option value={i} key={i}>{t.symbol}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Amount In:</label>
        <input type="number" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} />
      </div>

      <div>
        <label>Slippage (%):</label>
        <input type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)} />
      </div>

      <button onClick={handleSwap} disabled={loading}>
        {loading ? "Swapping..." : "Swap"}
      </button>
    </div>
  );
}
