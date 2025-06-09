import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER, UNISWAP_QUOTER } from "../utils/uniswap";
import { FiSettings } from "react-icons/fi";

export default function Swap({ 
  onOpenSettings, 
  onOpenTokenList, 
  connectWallet, 
  address, 
  network, 
  provider, 
  signer 
}) {
  const [inputToken, setInputToken] = useState(TOKENS[0]);
  const [outputToken, setOutputToken] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [balances, setBalances] = useState({});
  const [priceImpact, setPriceImpact] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [routingPath, setRoutingPath] = useState("");
  const [twapPrice, setTwapPrice] = useState(null);

  const fetchBalances = async () => {
    if (!provider || !address) return;
    
    try {
      const newBalances = {};
      for (let token of TOKENS) {
        if (token.symbol === "ETH") {
          const bal = await provider.getBalance(address);
          newBalances[token.symbol] = ethers.utils.formatEther(bal);
        } else {
          const contract = new ethers.Contract(
            token.address, 
            ["function balanceOf(address) view returns (uint256)"], 
            provider
          );
          const bal = await contract.balanceOf(address);
          newBalances[token.symbol] = ethers.utils.formatUnits(bal, token.decimals);
        }
      }
      setBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    if (provider && address) {
      fetchBalances();
    }
  }, [provider, address]);

  useEffect(() => {
    const fetchQuote = async () => {
      setError("");
      if (!amountIn || !inputToken || !outputToken || !provider) {
        setAmountOut("");
        return;
      }
      
      try {
        const quoter = new ethers.Contract(UNISWAP_QUOTER.address, UNISWAP_QUOTER.abi, provider);
        const amtIn = ethers.utils.parseUnits(amountIn, inputToken.decimals);
        const quotedOut = await quoter.quoteExactInputSingle(
          inputToken.address,
          outputToken.address,
          3000,
          amtIn,
          0
        );
        const out = ethers.utils.formatUnits(quotedOut, outputToken.decimals);
        setAmountOut(out);

        const midPrice = parseFloat(out) / parseFloat(amountIn);
        const impact = Math.abs(((midPrice - 1) / 1) * 100).toFixed(2);
        setPriceImpact(impact);

        setRoutingPath(`${inputToken.symbol} → 🛣 → ${outputToken.symbol}`);
        setTwapPrice((parseFloat(out) * 0.98).toFixed(4));

        // Auto-update slippage based on simple volatility logic
        const newSlippage = Math.min(Math.max(parseFloat(impact) * 0.5, 0.1), 3.0);
        setSlippage(parseFloat(newSlippage.toFixed(2)));

      } catch (e) {
        setAmountOut("");
        setError("No liquidity or invalid pair.");
        console.error("Quote error:", e);
      }
    };
    
    const debounceTimer = setTimeout(fetchQuote, 300);
    return () => clearTimeout(debounceTimer);
  }, [amountIn, inputToken, outputToken, provider]);

  const estimateGas = async () => {
    try {
      if (!signer || !amountIn || !inputToken || !outputToken || !amountOut) return;
      
      const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, signer);
      const amtIn = ethers.utils.parseUnits(amountIn, inputToken.decimals);
      const amtOutMin = ethers.utils.parseUnits(
        (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(outputToken.decimals),
        outputToken.decimals
      );
      
      const txReq = await router.populateTransaction.exactInputSingle({
        tokenIn: inputToken.address,
        tokenOut: outputToken.address,
        fee: 3000,
        recipient: address,
        deadline: Math.floor(Date.now() / 1000) + 600,
        amountIn: amtIn,
        amountOutMinimum: amtOutMin,
        sqrtPriceLimitX96: 0,
      });
      
      const gas = await provider.estimateGas({ ...txReq, from: address });
      const gasPrice = await provider.getGasPrice();
      const ethCost = ethers.utils.formatEther(gas.mul(gasPrice));
      setGasEstimate(`${parseFloat(ethCost).toFixed(6)} ETH`);
    } catch (err) {
      setGasEstimate(null);
      console.error("Gas estimation error:", err);
    }
  };

  useEffect(() => {
    if (amountIn && amountOut && signer) {
      const debounceTimer = setTimeout(estimateGas, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [amountIn, amountOut, inputToken, outputToken, signer, slippage]);

  const handleSwap = async () => {
    if (!signer || !address) {
      connectWallet();
      return;
    }
    
    if (!amountIn || !amountOut) {
      setError("Please enter an amount");
      return;
    }
    
    setLoading(true);
    setError("");
    setTxHash("");
    
    try {
      const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, signer);
      const amtIn = ethers.utils.parseUnits(amountIn, inputToken.decimals);
      const amtOutMin = ethers.utils.parseUnits(
        (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(outputToken.decimals),
        outputToken.decimals
      );

      // Check if we need to approve token first (if not ETH)
      if (inputToken.symbol !== "ETH") {
        const tokenContract = new ethers.Contract(
          inputToken.address,
          ["function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)"],
          signer
        );
        
        const allowance = await tokenContract.allowance(address, UNISWAP_ROUTER.address);
        if (allowance.lt(amtIn)) {
          const approveTx = await tokenContract.approve(UNISWAP_ROUTER.address, ethers.constants.MaxUint256);
          await approveTx.wait();
        }
      }

      const tx = await router.exactInputSingle({
        tokenIn: inputToken.address,
        tokenOut: outputToken.address,
        fee: 3000,
        recipient: address,
        deadline: Math.floor(Date.now() / 1000) + 600,
        amountIn: amtIn,
        amountOutMinimum: amtOutMin,
        sqrtPriceLimitX96: 0,
      });
      
      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      alert("Swap successful!");
      fetchBalances();
      setAmountIn("");
      setAmountOut("");
    } catch (e) {
      setLoading(false);
      setError("Swap failed: " + (e?.message || "Unexpected error"));
      console.error("Swap error:", e);
    }
  };

  const reverseSwap = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setAmountIn(amountOut);
    setAmountOut("");
  };

  const isConnected = !!(provider && signer && address);

  return (
    <section className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">Swap</h2>
          <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-cyan-500/20">
            <FiSettings className="text-cyan-400 text-xl" />
          </button>
        </div>

        {isConnected && (
          <button onClick={reverseSwap} className="mb-2 text-cyan-300 underline text-sm hover:text-cyan-200">
            ⇅ Reverse
          </button>
        )}

        <div className="mb-4">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <button 
              onClick={() => onOpenTokenList('input')} 
              className="text-cyan-300 font-semibold text-base backdrop-blur hover:text-cyan-200"
            >
              {inputToken.symbol}
            </button>
            <input
              placeholder="0.00"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
              className="ml-auto bg-transparent outline-none text-right text-2xl font-bold text-white placeholder:text-white/30 w-32"
              disabled={!isConnected}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-white/50 text-xs">Balance: {balances[inputToken.symbol] || "-"}</p>
            {balances[inputToken.symbol] && (
              <button 
                onClick={() => setAmountIn(balances[inputToken.symbol])}
                className="text-cyan-300 text-xs hover:text-cyan-200"
              >
                Max
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <button 
              onClick={() => onOpenTokenList('output')} 
              className="text-cyan-300 font-semibold text-base backdrop-blur hover:text-cyan-200"
            >
              {outputToken.symbol}
            </button>
            <input
              placeholder="0.00"
              value={amountOut}
              readOnly
              className="ml-auto bg-transparent outline-none text-right text-2xl font-bold text-white placeholder:text-white/30 w-32"
            />
          </div>
          <p className="text-white/50 text-xs mt-1">Balance: {balances[outputToken.symbol] || "-"}</p>
        </div>

        {isConnected && amountIn && amountOut && (
          <div className="flex flex-col gap-1 text-white/70 text-sm mb-6 bg-black/20 p-3 rounded-xl">
            <div className="flex justify-between">
              <span>Slippage:</span>
              <span>{slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact:</span>
              <span>{priceImpact || "-"}%</span>
            </div>
            <div className="flex justify-between">
              <span>Route:</span>
              <span>{routingPath}</span>
            </div>
            {gasEstimate && (
              <div className="flex justify-between">
                <span>Est. Gas:</span>
                <span>{gasEstimate}</span>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={isConnected ? handleSwap : connectWallet} 
          disabled={loading || (isConnected && (!amountIn || !amountOut))}
          className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Swapping..." : 
           !isConnected ? "Connect Wallet" : 
           !amountIn ? "Enter Amount" : 
           "Swap"}
        </button>
        
        {txHash && (
          <div className="mt-4 text-center text-sm text-white/80">
            Tx: <a 
              href={`https://sepolia.basescan.org/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:text-cyan-300"
            >
              {txHash.slice(0, 10)}...
            </a>
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-center text-sm text-red-400 bg-red-400/10 p-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}