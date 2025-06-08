import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER } from "../utils/uniswap";
import { FiSettings } from "react-icons/fi";
import Modal from "./Modal";

export default function Swap({ connectWallet, address, network, provider }) {
  const [inputToken, setInputToken] = useState(TOKENS[0]);
  const [outputToken, setOutputToken] = useState(TOKENS[2]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5); // %
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState("");
  const [modal, setModal] = useState({ open: false, title: '', message: '', link: '' });

  // Load balance for input token
  useEffect(() => {
    const fetchBalance = async () => {
      if (!provider || !address || !inputToken) return setBalance("");
      try {
        if (inputToken.symbol === "ETH") {
          const bal = await provider.getBalance(address);
          setBalance(ethers.utils.formatEther(bal));
        } else {
          const token = new ethers.Contract(inputToken.address, [
            "function balanceOf(address) view returns (uint256)"
          ], provider);
          const bal = await token.balanceOf(address);
          setBalance(ethers.utils.formatUnits(bal, inputToken.decimals));
        }
      } catch {
        setBalance("");
      }
    };
    fetchBalance();
  }, [provider, address, inputToken]);

  // Get output amount (Uniswap getAmountsOut)
  useEffect(() => {
    const fetchAmountOut = async () => {
      setError("");
      if (!amountIn || !inputToken || !outputToken || !provider) return setAmountOut("");
      try {
        const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, provider);
        let path;
        if (inputToken.symbol === "ETH") {
          path = [TOKENS[1].address, outputToken.address]; // ETH -> WETH -> output
        } else if (outputToken.symbol === "ETH") {
          path = [inputToken.address, TOKENS[1].address]; // input -> WETH -> ETH
        } else {
          path = [inputToken.address, outputToken.address];
        }
        const amtIn = ethers.utils.parseUnits(amountIn, inputToken.decimals);
        const amounts = await router.getAmountsOut(amtIn, path);
        setAmountOut(ethers.utils.formatUnits(amounts[amounts.length - 1], outputToken.decimals));
      } catch (e) {
        setAmountOut("");
        setError("No liquidity or invalid pair. Try a different token or amount.");
      }
    };
    fetchAmountOut();
  }, [amountIn, inputToken, outputToken, provider]);

  // Swap function
  const handleSwap = async () => {
    if (!provider || !address) return connectWallet();
    setLoading(true);
    setTxHash("");
    setError("");
    try {
      const signer = provider.getSigner();
      const router = new ethers.Contract(UNISWAP_ROUTER.address, UNISWAP_ROUTER.abi, signer);
      let path;
      if (inputToken.symbol === "ETH") {
        path = [TOKENS[1].address, outputToken.address];
      } else if (outputToken.symbol === "ETH") {
        path = [inputToken.address, TOKENS[1].address];
      } else {
        path = [inputToken.address, outputToken.address];
      }
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
      setModal({
        open: true,
        title: "Swap Successful!",
        message: `Your swap was successful!`,
        link: `https://sepolia.etherscan.io/tx/${tx.hash}`
      });
    } catch (e) {
      setLoading(false);
      if (e.code === 4001) {
        setModal({
          open: true,
          title: "Transaction Cancelled",
          message: "User cancelled the request in MetaMask.",
          link: ""
        });
      } else {
        setModal({
          open: true,
          title: "Swap Failed",
          message: e.message,
          link: ""
        });
      }
      setError("Swap failed: " + e.message);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">Swap</h2>
          <button
            className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:from-cyan-400 hover:to-purple-400 transition"
            onClick={connectWallet}
          >
            {address ? `Connected: ${address.slice(0, 6)}...` : "Connect Wallet"}
          </button>
        </div>
        <div className="mb-2 text-white/80 text-sm">
          {address && (
            <>
              <span>Network: {network?.name === "sepolia" ? "Sepolia" : <span className="text-red-400">Wrong Network</span>}</span>
              <br />
              <span>Balance: {balance ? `${parseFloat(balance).toFixed(4)} ${inputToken.symbol}` : "--"}</span>
            </>
          )}
        </div>
        {/* Token Input */}
        <div className="mb-4">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <select
              className="bg-transparent text-cyan-300 font-semibold text-base outline-none"
              value={inputToken.symbol}
              onChange={e => setInputToken(TOKENS.find(t => t.symbol === e.target.value))}
            >
              {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
            </select>
            <input
              className="ml-auto bg-transparent outline-none text-right text-2xl font-bold text-white placeholder:text-white/30 w-32"
              placeholder="0.00"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
            />
          </div>
        </div>
        {/* Token Output */}
        <div className="mb-6">
          <div className="flex items-center bg-black/30 rounded-xl px-4 py-3 border border-cyan-400/10">
            <select
              className="bg-transparent text-cyan-300 font-semibold text-base outline-none"
              value={outputToken.symbol}
              onChange={e => setOutputToken(TOKENS.find(t => t.symbol === e.target.value))}
            >
              {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
            </select>
            <input
              className="ml-auto bg-transparent outline-none text-right text-2xl font-bold text-white placeholder:text-white/30 w-32"
              placeholder="0.00"
              value={amountOut}
              readOnly
            />
          </div>
        </div>
        {/* Live Swap Summary */}
        <div className="mb-4 text-center text-cyan-300 text-base min-h-[24px]">
          {amountIn && amountOut && !error && (
            <span>
              You will get <b>{parseFloat(amountOut).toFixed(6)} {outputToken.symbol}</b> for <b>{parseFloat(amountIn).toFixed(6)} {inputToken.symbol}</b>
            </span>
          )}
        </div>
        {/* Slippage */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400/80 text-sm font-medium">Slippage</span>
            <input
              type="number"
              value={slippage}
              min={0}
              max={5}
              step={0.1}
              onChange={e => setSlippage(Number(e.target.value))}
              className="w-12 h-5 bg-cyan-400/10 rounded-lg"
            />
          </div>
        </div>
        {/* Swap CTA */}
        <button
          className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white tracking-wide"
          onClick={handleSwap}
          disabled={loading || !amountIn || !address || !amountOut || !!error}
        >
          {loading ? "Swapping..." : "Swap"}
        </button>
        {txHash && <div className="mt-4 text-center text-sm text-white/80">Tx: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400">{txHash.slice(0, 10)}...</a></div>}
        {error && <div className="mt-4 text-center text-sm text-red-400">{error}</div>}
        <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })}>
          <h2 className="text-xl font-bold mb-2">{modal.title}</h2>
          <p className="mb-4">{modal.message}</p>
          {modal.link && <a href={modal.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">View on Sepolia Explorer</a>}
        </Modal>
      </div>
    </section>
  );
} 