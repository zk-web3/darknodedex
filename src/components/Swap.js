import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const TOKENS = [
  {
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    logo: "https://cryptologos.cc/logos/weth-logo.png"
  },
  {
    symbol: "USDC",
    address: "0xD9FECa0D8BcD57C9e34b32F83b1d49ACb0B279F2",
    decimals: 6,
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
  }
];

const ISwapRouter_ABI = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) payable returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)"
];
const QuoterV2_ABI = [
  "function quoteExactInputSingle(address,address,uint24,uint256) external returns (uint256)"
];

const SWAP_ROUTER = "0x5615CDAb10dc425a742d643d949a7F474C7eF466";
const QUOTER = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
const FEE = 3000; // 0.3%

export default function Swap() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("");
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return setError("MetaMask not found");
    const prov = new ethers.BrowserProvider(window.ethereum);
    const signer = await prov.getSigner();
    const addr = await signer.getAddress();
    setProvider(prov);
    setSigner(signer);
    setAddress(addr);
    setError("");
  };

  // Fetch ETH balance
  useEffect(() => {
    if (!provider || !address) return;
    provider.getBalance(address).then(bal => {
      setEthBalance(ethers.formatEther(bal));
    });
  }, [provider, address]);

  // Estimate output using QuoterV2
  useEffect(() => {
    if (!amountIn || isNaN(amountIn) || Number(amountIn) <= 0) {
      setAmountOut("");
      return;
    }
    const fetchQuote = async () => {
      try {
        const quoter = new ethers.Contract(QUOTER, QuoterV2_ABI, provider || ethers);
        const amountInWei = ethers.parseUnits(amountIn, fromToken.decimals);
        const quoted = await quoter.quoteExactInputSingle(
          fromToken.address,
          toToken.address,
          FEE,
          amountInWei
        );
        setAmountOut(ethers.formatUnits(quoted, toToken.decimals));
      } catch (e) {
        setAmountOut("");
      }
    };
    fetchQuote();
  }, [amountIn, fromToken, toToken, provider]);

  // Check approval
  useEffect(() => {
    if (!signer || fromToken.symbol === "ETH") {
      setApproved(true);
      return;
    }
    const check = async () => {
      const token = new ethers.Contract(fromToken.address, ["function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)"], signer);
      const allowance = await token.allowance(address, SWAP_ROUTER);
      setApproved(allowance >= ethers.parseUnits(amountIn || "0", fromToken.decimals));
    };
    check();
  }, [signer, fromToken, amountIn, address]);

  // Approve token
  const handleApprove = async () => {
    setApproving(true);
    setError("");
    try {
      const token = new ethers.Contract(fromToken.address, ["function approve(address,uint256) returns (bool)"], signer);
      const tx = await token.approve(SWAP_ROUTER, ethers.MaxUint256);
      await tx.wait();
      setApproved(true);
    } catch (e) {
      setError("Approval failed");
    }
    setApproving(false);
  };

  // Execute swap
  const handleSwap = async () => {
    setSwapping(true);
    setError("");
    setTxHash("");
    try {
      const router = new ethers.Contract(SWAP_ROUTER, ISwapRouter_ABI, signer);
      const params = {
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        fee: FEE,
        recipient: address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        amountIn: ethers.parseUnits(amountIn, fromToken.decimals),
        amountOutMinimum: amountOut ? ethers.parseUnits((Number(amountOut) * (1 - Number(slippage)/100)).toFixed(toToken.decimals), toToken.decimals) : 0,
        sqrtPriceLimitX96: 0
      };
      const tx = await router.exactInputSingle(params, { value: fromToken.symbol === "ETH" ? ethers.parseUnits(amountIn, 18) : 0 });
      setTxHash(tx.hash);
      await tx.wait();
    } catch (e) {
      setError("Swap failed");
    }
    setSwapping(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-xl p-6 border border-cyan-200">
      <h2 className="text-2xl font-bold mb-4 text-center">Swap on Base Sepolia</h2>
      {!address ? (
        <button className="w-full py-2 bg-cyan-600 text-white rounded-lg font-semibold" onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Wallet:</span>
            <span className="font-mono">{address.slice(0,6)}...{address.slice(-4)}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">ETH Balance:</span>
            <span>{Number(ethBalance).toFixed(4)}</span>
          </div>
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <TokenSelect token={fromToken} setToken={setFromToken} otherToken={toToken} />
              <TokenSelect token={toToken} setToken={setToToken} otherToken={fromToken} />
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2 mb-2"
              type="number"
              placeholder="Amount"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
              min="0"
            />
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Slippage (%)</span>
              <input
                className="w-16 border rounded px-1 text-right"
                type="number"
                value={slippage}
                min="0"
                max="5"
                step="0.1"
                onChange={e => setSlippage(e.target.value)}
              />
            </div>
            <div className="mb-2 text-gray-700">
              {amountOut && (
                <span>Estimated: {amountOut} {toToken.symbol}</span>
              )}
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {txHash && <div className="text-green-600 mb-2">Tx: <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash.slice(0,10)}...</a></div>}
            {!approved && fromToken.symbol !== "ETH" ? (
              <button className="w-full py-2 bg-yellow-400 text-white rounded-lg font-semibold" onClick={handleApprove} disabled={approving}>{approving ? "Approving..." : `Approve ${fromToken.symbol}`}</button>
            ) : (
              <button className="w-full py-2 bg-cyan-600 text-white rounded-lg font-semibold" onClick={handleSwap} disabled={swapping || !amountIn || Number(amountIn) <= 0}>{swapping ? "Swapping..." : "Swap"}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TokenSelect({ token, setToken, otherToken }) {
  return (
    <div className="relative w-1/2">
      <button className="flex items-center w-full border rounded-lg px-3 py-2 bg-gray-50" type="button">
        <img src={token.logo} alt={token.symbol} className="w-6 h-6 mr-2" />
        <span>{token.symbol}</span>
      </button>
      {/* For demo: no dropdown, but you can add a dropdown here */}
    </div>
  );
}