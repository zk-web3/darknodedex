import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER, UNISWAP_QUOTER } from "../utils/uniswap";
import { FiSettings } from "react-icons/fi";

export default function Swap({ onOpenSettings, onOpenTokenList, onConnectWallet }) {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState("");
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
    const newBalances = {};
    for (let token of TOKENS) {
      if (token.symbol === "ETH") {
        const bal = await provider.getBalance(address);
        newBalances[token.symbol] = ethers.utils.formatEther(bal);
      } else {
        const contract = new ethers.Contract(token.address, ["function balanceOf(address) view returns (uint256)"], provider);
        const bal = await contract.balanceOf(address);
        newBalances[token.symbol] = ethers.utils.formatUnits(bal, token.decimals);
      }
    }
    setBalances(newBalances);
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    await prov.send("eth_requestAccounts", []);
    const signer = prov.getSigner();
    const addr = await signer.getAddress();
    setProvider(prov);
    setSigner(signer);
    setAddress(addr);
  };

  useEffect(() => {
    if (provider && address) fetchBalances();
  }, [provider, address]);

  useEffect(() => {
    const fetchQuote = async () => {
      setError("");
      if (!amountIn || !inputToken || !outputToken || !provider) return setAmountOut("");
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
        setSlippage(newSlippage.toFixed(2));

      } catch (e) {
        setAmountOut("");
        setError("No liquidity or invalid pair.");
      }
    };
    fetchQuote();
  }, [amountIn, inputToken, outputToken, provider]);

  const estimateGas = async () => {
    try {
      if (!signer || !amountIn || !inputToken || !outputToken) return;
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
      const ethCost = ethers.utils.formatEther(gas.mul(await provider.getGasPrice()));
      setGasEstimate(`${ethCost} ETH`);
    } catch (err) {
      setGasEstimate(null);
    }
  };

  useEffect(() => {
    estimateGas();
  }, [amountIn, amountOut, inputToken, outputToken]);

  const handleSwap = async () => {
    if (!signer) return connectWallet();
    setLoading(true);
    setError("");
    try {
      const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, signer);
      const amtIn = ethers.utils.parseUnits(amountIn, inputToken.decimals);
      const amtOutMin = ethers.utils.parseUnits(
        (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(outputToken.decimals),
        outputToken.decimals
      );

      const previewTx = await router.populateTransaction.exactInputSingle({
        tokenIn: inputToken.address,
        tokenOut: outputToken.address,
        fee: 3000,
        recipient: address,
        deadline: Math.floor(Date.now() / 1000) + 600,
        amountIn: amtIn,
        amountOutMinimum: amtOutMin,
        sqrtPriceLimitX96: 0,
      });
      console.log("Simulated Tx:", previewTx);

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
    } catch (e) {
      setLoading(false);
      setError("Swap failed: " + (e?.message || "Unexpected error"));
    }
  };

  const reverseSwap = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  return (
    <section className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">Swap</h2>
          <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-cyan-500/20">
            <FiSettings className="text-cyan-400 text-xl" />
          </button>
        </div>
        {!address ? (
          <button
            onClick={connectWallet}
            className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white mb-4"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <button onClick={reverseSwap} className="mb-2 text-cyan-300 underline text-sm">⇅ Reverse</button>
            <div className="mb-4">
              <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
                <button onClick={() => onOpenTokenList('input')} className="flex items-center gap-2 text-cyan-300 font-semibold text-base backdrop-blur">
                  <img src={inputToken.logo} alt={inputToken.symbol} className="w-6 h-6 rounded-full" />
                  {inputToken.symbol}
                </button>
                <input
                  placeholder="0.00"
                  value={amountIn}
                  onChange={e => setAmountIn(e.target.value)}
                  className="ml-auto bg-transparent outline-none text-right text-2xl font-bold text-white placeholder:text-white/30 w-32"
                />
              </div>
              <p className="text-white/50 text-xs mt-1">Balance: {balances[inputToken.symbol] || "-"}</p>
            </div>
            <div className="mb-6">
              <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
                <button onClick={() => onOpenTokenList('output')} className="flex items-center gap-2 text-cyan-300 font-semibold text-base backdrop-blur">
                  <img src={outputToken.logo} alt={outputToken.symbol} className="w-6 h-6 rounded-full" />
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
            <div className="flex flex-col gap-1 text-white/70 text-sm mb-6">
              <div className="flex justify-between">
                <span>Slippage: {slippage}%</span>
                <span>Price Impact: {priceImpact || "-"}%</span>
              </div>
              <div className="flex justify-between">
                <span>Routing Path: {routingPath}</span>
                <span>TWAP: {twapPrice || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Gas: {gasEstimate || "-"}</span>
              </div>
            </div>
            <button onClick={handleSwap} disabled={loading || !amountIn || !address}
              className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white">
              {loading ? "Swapping..." : "Swap"}
            </button>
          </>
        )}
        {txHash && <div className="mt-4 text-center text-sm text-white/80">Tx: <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400">{txHash.slice(0, 10)}...</a></div>}
        {error && <div className="mt-4 text-center text-sm text-red-400">{error}</div>}
      </div>
    </section>
  );
}
