import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER } from "../utils/uniswap";
import { FiSettings } from "react-icons/fi";

export default function Swap({ onOpenSettings, onOpenTokenList, onConnectWallet }) {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState("");
  const [inputToken, setInputToken] = useState(TOKENS[0]);
  const [outputToken, setOutputToken] = useState(TOKENS[2]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5); // %
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    await prov.send("eth_requestAccounts", []);
    setProvider(prov);
    setSigner(prov.getSigner());
    setAddress(await prov.getSigner().getAddress());
  };

  // Get output amount (Uniswap getAmountsOut)
  useEffect(() => {
    const fetchAmountOut = async () => {
      setError("");
      if (!amountIn || !inputToken || !outputToken || !provider) return setAmountOut("");
      try {
        const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, provider);
        const path = inputToken.symbol === "ETH"
          ? [TOKENS[1].address, outputToken.address] // ETH -> WETH -> output
          : [inputToken.address, outputToken.address];
        const amtIn = ethers.utils.parseUnits(amountIn, inputToken.decimals);
        const amounts = await router.getAmountsOut(amtIn, path);
        setAmountOut(ethers.utils.formatUnits(amounts[amounts.length - 1], outputToken.decimals));
      } catch (e) {
        setAmountOut("");
        setError("No liquidity or invalid pair.");
      }
    };
    fetchAmountOut();
  }, [amountIn, inputToken, outputToken, provider]);

  // Swap function
  const handleSwap = async () => {
    if (!signer) return connectWallet();
    setLoading(true);
    setTxHash("");
    setError("");
    try {
      const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, signer);
      const path = inputToken.symbol === "ETH"
        ? [TOKENS[1].address, outputToken.address]
        : [inputToken.address, outputToken.address];
      const amtIn = ethers.utils.parseUnits(amountIn, inputToken.decimals);
      const amtOutMin = amountOut
        ? ethers.utils.parseUnits(
            (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(outputToken.decimals),
            outputToken.decimals
          )
        : 0;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      let tx;
      if (inputToken.symbol === "ETH") {
        tx = await router.swapExactETHForTokens(
          amtOutMin,
          path,
          address,
          deadline,
          { value: amtIn }
        );
      } else if (outputToken.symbol === "ETH") {
        // Approve first if needed
        const token = new ethers.Contract(inputToken.address, [
          "function approve(address spender, uint value) public returns (bool)"
        ], signer);
        await token.approve(UNISWAP_ROUTER.address, amtIn);
        tx = await router.swapExactTokensForETH(
          amtIn,
          amtOutMin,
          path,
          address,
          deadline
        );
      } else {
        // Approve first if needed
        const token = new ethers.Contract(inputToken.address, [
          "function approve(address spender, uint value) public returns (bool)"
        ], signer);
        await token.approve(UNISWAP_ROUTER.address, amtIn);
        tx = await router.swapExactTokensForTokens(
          amtIn,
          amtOutMin,
          path,
          address,
          deadline
        );
      }
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      alert("Swap successful!");
    } catch (e) {
      setLoading(false);
      setError("Swap failed: " + e.message);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">Swap</h2>
          <button
            className="p-2 rounded-full hover:bg-cyan-500/20 transition"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <FiSettings className="text-cyan-400 text-xl" />
          </button>
        </div>
        {/* Token Input */}
        <div className="mb-4">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <button
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 transition text-cyan-300 font-semibold text-base backdrop-blur"
              onClick={() => onOpenTokenList('input')}
            >
              <span className="blur-sm select-none">Token</span>
            </button>
            <input
              className="ml-auto bg-transparent outline-none text-right text-2xl font-bold text-white placeholder:text-white/30 w-32 blur-sm select-none"
              placeholder="0.00"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
            />
          </div>
        </div>
        {/* Token Output */}
        <div className="mb-6">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <button
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 transition text-cyan-300 font-semibold text-base backdrop-blur"
              onClick={() => onOpenTokenList('output')}
            >
              <span className="blur-sm select-none">Token</span>
            </button>
            <input
              className="ml-auto bg-transparent outline-none text-right text-2xl font-bold text-white placeholder:text-white/30 w-32 blur-sm select-none"
              placeholder="0.00"
              value={amountOut}
              readOnly
            />
          </div>
        </div>
        {/* Gas & Slippage */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400/80 text-sm font-medium">Gas</span>
            <span className="w-12 h-5 bg-cyan-400/10 rounded-lg blur-sm" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400/80 text-sm font-medium">Slippage</span>
            <input
              type="number"
              value={slippage}
              min={0}
              max={5}
              step={0.1}
              onChange={e => setSlippage(Number(e.target.value))}
              className="w-12 h-5 bg-cyan-400/10 rounded-lg blur-sm"
            />
          </div>
        </div>
        {/* Connect Wallet / Swap CTA */}
        <button
          className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white tracking-wide"
          onClick={handleSwap}
          disabled={loading || !amountIn || !address}
        >
          {loading ? "Swapping..." : "Swap"}
        </button>
        {txHash && <div className="mt-4 text-center text-sm text-white/80">Tx: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400">{txHash.slice(0, 10)}...</a></div>}
        {error && <div className="mt-4 text-center text-sm text-red-400">{error}</div>}
      </div>
    </section>
  );
} 