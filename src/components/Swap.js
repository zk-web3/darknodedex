// Swap.js
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER } from "../utils/uniswap"; // Ensure there's no other declaration
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

  // Fetch balances
  const fetchBalances = async () => {
    if (!provider || !address) return;
    try {
      const newBalances = {};
      const ethBalance = await provider.getBalance(address);
      newBalances["ETH"] = parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(6);
      for (let token of TOKENS) {
        if (token.symbol !== "ETH" && token.address) {
          try {
            const contract = new ethers.Contract(
              token.address,
              ["function balanceOf(address) view returns (uint256)"],
              provider
            );
            const bal = await contract.balanceOf(address);
            newBalances[token.symbol] = parseFloat(
              ethers.utils.formatUnits(bal, token.decimals)
            ).toFixed(6);
          } catch {
            newBalances[token.symbol] = "0.00";
          }
        }
      }
      setBalances(newBalances);
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  useEffect(() => {
    if (provider && address) fetchBalances();
  }, [provider, address]);

  // Get quote
  const getQuoteV2 = async (fromToken, toToken, amountInput) => {
    if (!provider || !amountInput || parseFloat(amountInput) <= 0) return null;
    const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, provider);

    let path = [];
    const weth = TOKENS.find(t => t.symbol === "WETH");
    if (fromToken.symbol === "ETH") {
      path = [weth.address, toToken.address];
    } else if (toToken.symbol === "ETH") {
      path = [fromToken.address, weth.address];
    } else {
      path = [fromToken.address, toToken.address];
      try {
        const amtWei = ethers.utils.parseUnits(amountInput, fromToken.decimals);
        await router.getAmountsOut(amtWei, path);
      } catch {
        path = [fromToken.address, weth.address, toToken.address];
      }
    }

    const amtWei = ethers.utils.parseUnits(amountInput, fromToken.decimals);
    const amounts = await router.getAmountsOut(amtWei, path);
    const outputWei = amounts[amounts.length - 1];
    const output = ethers.utils.formatUnits(outputWei, toToken.decimals);
    const rate = parseFloat(output) / parseFloat(amountInput);
    const impact = Math.abs((1 - rate) * 100);

    return { amountOut: output, path, priceImpact: impact.toFixed(2) };
  };

  useEffect(() => {
    const fetchQuote = async () => {
      setError("");
      if (!amountIn || !inputToken || !outputToken || !provider) {
        setAmountOut("");
        setPriceImpact(null);
        setRoutingPath("");
        return;
      }

      const quote = await getQuoteV2(inputToken, outputToken, amountIn);
      if (quote) {
        setAmountOut(quote.amountOut);
        setPriceImpact(quote.priceImpact);
        setRoutingPath(
          quote.path.length === 2
            ? `${inputToken.symbol} → ${outputToken.symbol}`
            : `${inputToken.symbol} → WETH → ${outputToken.symbol}`
        );
        const newSlippage = Math.max(0.5, Math.min(parseFloat(quote.priceImpact) * 0.5, 3.0));
        setSlippage(parseFloat(newSlippage.toFixed(2)));
      } else {
        setAmountOut("");
        setError("No liquidity available for this pair");
      }
    };

    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [amountIn, inputToken, outputToken, provider]);

  // Estimate gas
  const estimateGas = async () => {
    if (!signer || !amountIn || !amountOut || !inputToken || !outputToken) return;
    try {
      const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, signer);
      const amtInWei = ethers.utils.parseUnits(amountIn, inputToken.decimals);
      const amtOutMin = ethers.utils.parseUnits(
        (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(outputToken.decimals),
        outputToken.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 600;
      const weth = TOKENS.find(t => t.symbol === "WETH");

      let path = [];
      if (inputToken.symbol === "ETH") {
        path = [weth.address, outputToken.address];
      } else if (outputToken.symbol === "ETH") {
        path = [inputToken.address, weth.address];
      } else {
        path = [inputToken.address, outputToken.address];
      }

      let gasEst;
      if (inputToken.symbol === "ETH") {
        gasEst = await router.estimateGas.swapExactETHForTokens(
          amtOutMin, path, address, deadline, { value: amtInWei }
        );
      } else if (outputToken.symbol === "ETH") {
        gasEst = await router.estimateGas.swapExactTokensForETH(
          amtInWei, amtOutMin, path, address, deadline
        );
      } else {
        gasEst = await router.estimateGas.swapExactTokensForTokens(
          amtInWei, amtOutMin, path, address, deadline
        );
      }

      const gasPrice = await provider.getGasPrice();
      const cost = ethers.utils.formatEther(gasEst.mul(gasPrice));
      setGasEstimate(`${parseFloat(cost).toFixed(6)} ETH`);
    } catch (err) {
      setGasEstimate(null);
      console.error("Gas estimation error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(estimateGas, 500);
    return () => clearTimeout(timer);
  }, [amountIn, amountOut, inputToken, outputToken, signer, slippage]);

  // Swap execution
  const handleSwap = async () => {
    if (!signer || !address) { connectWallet(); return; }
    if (!amountIn || !amountOut) { setError("Please enter an amount"); return; }

    setLoading(true);
    setError("");
    setTxHash("");

    try {
      const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, signer);
      const amtInWei = ethers.utils.parseUnits(amountIn, inputToken.decimals);
      const amtOutMin = ethers.utils.parseUnits(
        (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(outputToken.decimals),
        outputToken.decimals
      );
      const deadline = Math.floor(Date.now() / 1000) + 600;
      const weth = TOKENS.find(t => t.symbol === "WETH");

      let path = [];
      if (inputToken.symbol === "ETH") {
        path = [weth.address, outputToken.address];
      } else if (outputToken.symbol === "ETH") {
        path = [inputToken.address, weth.address];
      } else {
        path = [inputToken.address, outputToken.address];
        try { await router.getAmountsOut(amtInWei, path); }
        catch { path = [inputToken.address, weth.address, outputToken.address]; }
      }

      let tx;
      if (inputToken.symbol === "ETH") {
        tx = await router.swapExactETHForTokens(amtOutMin, path, address, deadline, { value: amtInWei });
      } else {
        const tokenContract = new ethers.Contract(
          inputToken.address,
          ["function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)"],
          signer
        );
        const allowance = await tokenContract.allowance(address, UNISWAP_ROUTER.address);
        if (allowance.lt(amtInWei)) {
          const approveTx = await tokenContract.approve(UNISWAP_ROUTER.address, ethers.constants.MaxUint256);
          await approveTx.wait();
        }
        if (outputToken.symbol === "ETH") {
          tx = await router.swapExactTokensForETH(amtInWei, amtOutMin, path, address, deadline);
        } else {
          tx = await router.swapExactTokensForTokens(amtInWei, amtOutMin, path, address, deadline);
        }
      }

      setTxHash(tx.hash);
      await tx.wait();
      setLoading(false);
      alert("Swap successful!");
      await fetchBalances();
      setAmountIn("");
      setAmountOut("");
    } catch (e) {
      setLoading(false);
      setError("Swap failed: " + (e?.message || "Unexpected error"));
      console.error("Swap error:", e);
    }
  };

  const reverseSwap = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
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

        {isConnected && network && (
          <div className="mb-4 text-center">
            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm inline-block">
              Connected to Base Sepolia Testnet
            </div>
            <div className="text-white/70 text-xs mt-1">
              Balance: {balances["ETH"] || "0.00"} ETH
            </div>
          </div>
        )}

        {isConnected && (
          <button onClick={reverseSwap} className="mb-2 text-cyan-300 underline text-sm hover:text-cyan-200">
            ⇅ Reverse
          </button>
        )}

        {/* Input token */}
        <div className="mb-4">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <button
              onClick={() => onOpenTokenList("input")}
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
              <button onClick={() => setAmountIn(balances[inputToken.symbol])} className="text-cyan-300 text-xs hover:text-cyan-200">
                Max
              </button>
            )}
          </div>
        </div>

        {/* Output token */}
        <div className="mb-6">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <button
              onClick={() => onOpenTokenList("output")}
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

        {/* Swap details */}
        {isConnected && amountIn && amountOut && (
          <div className="flex flex-col gap-1 text-white/70 text-sm mb-6 bg-black/20 p-3 rounded-xl">
            <div className="flex justify-between"><span>Slippage:</span><span>{slippage}%</span></div>
            <div className="flex justify-between"><span>Price Impact:</span><span>{priceImpact || "-"}%</span></div>
            <div className="flex justify-between"><span>Route:</span><span className="text-xs">{routingPath}</span></div>
            {gasEstimate && (<div className="flex justify-between"><span>Est. Gas:</span><span>{gasEstimate}</span></div>)}
          </div>
        )}

        <button
          onClick={isConnected ? handleSwap : connectWallet}
          disabled={loading || (isConnected && (!amountIn || !amountOut))}
          className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Swapping..." : !isConnected ? "Connect Wallet" : !amountIn ? "Enter Amount" : "Swap"}
        </button>

        {txHash && (
          <div className="mt-4 text-center text-sm text-white/80">
            Tx:{" "}
            <a
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
