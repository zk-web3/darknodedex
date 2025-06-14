import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS } from "../utils/uniswap";
import ERC20_ABI from "../utils/erc20_abi";

// TokenSelectorModal Component inside same file (for simplicity)
const TokenSelectorModal = ({ tokens, balances, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-start pt-24 z-50">
      <div className="bg-zinc-900 rounded-lg p-4 max-w-md w-full max-h-[80vh] overflow-auto">
        <h3 className="text-white text-xl mb-4 font-semibold">Select a Token</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white mb-4"
        >
          Close
        </button>
        <ul>
          {tokens.map((token) => (
            <li
              key={token.address}
              className="flex justify-between items-center p-2 cursor-pointer rounded hover:bg-purple-700"
              onClick={() => onSelect(token)}
            >
              <span>{token.symbol}</span>
              <span className="text-sm text-gray-300">
                {balances[token.address]
                  ? Number(balances[token.address]).toFixed(4)
                  : "0.0000"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const DarkNodeSwapBox = ({ connectWallet, address, network, provider, signer }) => {
  const walletConnected = !!address; // Determine connection status from prop
  const walletAddress = address; // Use address prop directly
  const [balances, setBalances] = useState({});
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [routerContract, setRouterContract] = useState(null);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [modalOpenFor, setModalOpenFor] = useState(null); // null or "in" or "out"

  useEffect(() => {
    if (provider && signer) {
      setRouterContract(
        new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer)
      );
    }
  }, [provider, signer]);

  // Fetch balances of all tokens for connected wallet
  const fetchBalances = async () => {
    try {
      if (!walletConnected || !provider || !walletAddress) return;
      setLoadingBalances(true);
      const balData = {};
      for (const token of TOKENS) {
        if (token.symbol === "ETH") {
          const bal = await provider.getBalance(walletAddress);
          balData[token.address] = ethers.utils.formatEther(bal);
        } else {
          const tokenContract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            provider
          );
          const rawBal = await tokenContract.balanceOf(walletAddress);
          balData[token.address] = ethers.utils.formatUnits(
            rawBal,
            token.decimals
          );
        }
      }
      setBalances(balData);
      setLoadingBalances(false);
    } catch (err) {
      console.error("Error fetching balances", err);
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    if (walletConnected && provider && walletAddress) fetchBalances();
  }, [walletConnected, provider, walletAddress]);

  // Token select handler from modal
  const onSelectToken = (token) => {
    if (modalOpenFor === "in") {
      // Avoid selecting same token for both sides
      if (token.address === tokenOut.address) {
        alert("From and To tokens cannot be same.");
        return;
      }
      setTokenIn(token);
    } else if (modalOpenFor === "out") {
      if (token.address === tokenIn.address) {
        alert("From and To tokens cannot be same.");
        return;
      }
      setTokenOut(token);
    }
    setModalOpenFor(null);
  };

  // Swap handler (basic example)
  const handleSwap = async () => {
    try {
      if (!amountIn || Number(amountIn) <= 0) {
        alert("Enter valid amount");
        return;
      }
      if (!routerContract || !signer || !walletAddress) {
        alert("Wallet not fully connected or router contract not initialized.");
        return;
      }

      const amt = ethers.utils.parseUnits(amountIn, tokenIn.decimals);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      // Approve tokenIn
      const tokenInContract = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);
      const approveTx = await tokenInContract.approve(UNISWAP_ROUTER_ADDRESS, amt);
      await approveTx.wait();

      // Swap exactInputSingle params (Uniswap V3 style)
      const tx = await routerContract.exactInputSingle({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: 3000, // pool fee 0.3%
        recipient: walletAddress,
        deadline,
        amountIn: amt,
        amountOutMinimum: 0, // no minimum slippage protection here
        sqrtPriceLimitX96: 0,
      });
      await tx.wait();
      alert("Swap Successful");
      fetchBalances();
    } catch (error) {
      console.error("Swap Error", error);
      alert("Swap Failed");
    }
  };

  return (
    <div className="bg-zinc-900 w-full max-w-md mx-auto rounded-2xl p-6 shadow-2xl">
      {!walletConnected ? (
        <button
          onClick={connectWallet}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-xl"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="relative">
          {/* Settings icon */}
          <div className="absolute top-0 right-0 p-2 cursor-pointer text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.125 1.125 0 011.924 0c1.756.426 1.756 2.924 0 3.35a1.125 1.125 0 010 1.924c-1.756.426-2.924.426-3.35 0a1.125 1.125 0 01-1.924 0c-1.756-.426-1.756-2.924 0-3.35a1.125 1.125 0 010-1.924z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.317 10.325c-1.756.426-1.756 2.924 0 3.35a1.125 1.125 0 010 1.924c.426 1.756 2.924 1.756 3.35 0a1.125 1.125 0 011.924 0c.426 1.756 2.924 1.756 3.35 0a1.125 1.125 0 011.924 0c1.756.426 1.756 2.924 0 3.35a1.125 1.125 0 010 1.924c-1.756.426-2.924.426-3.35 0a1.125 1.125 0 01-1.924 0c-1.756-.426-1.756-2.924 0-3.35a1.125 1.125 0 010-1.924z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-4 text-center">Swap</h2>

          {/* From Token Input */}
          <div className="bg-zinc-800 rounded-xl p-4 mb-2 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">You pay</span>
              <span className="text-gray-400 text-sm">
                Balance:{" "}
                {loadingBalances
                  ? "Loading..."
                  : balances[tokenIn.address]
                  ? Number(balances[tokenIn.address]).toFixed(6)
                  : "0.0000"}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="0.0"
                className="w-full bg-transparent text-white text-3xl font-bold outline-none flex-grow"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
              />
              <button
                onClick={() => setModalOpenFor("in")}
                className="flex items-center bg-zinc-700 hover:bg-zinc-600 rounded-full py-2 pl-3 pr-4 ml-2 text-white font-semibold"
              >
                {/* Placeholder for token icon */}
                <div className="w-6 h-6 bg-gray-500 rounded-full mr-2"></div>
                {tokenIn.symbol}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 ml-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Swap Arrow Button */}
          <div className="flex justify-center -my-3 z-10 relative">
            <button
              onClick={() => {
                setTokenIn(tokenOut);
                setTokenOut(tokenIn);
                setAmountIn("");
                setAmountOut("");
              }}
              className="bg-zinc-900 border-4 border-zinc-800 rounded-full p-2 text-gray-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* To Token Input */}
          <div className="bg-zinc-800 rounded-xl p-4 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">You receive</span>
              <span className="text-gray-400 text-sm">
                Balance:{" "}
                {loadingBalances
                  ? "Loading..."
                  : balances[tokenOut.address]
                  ? Number(balances[tokenOut.address]).toFixed(6)
                  : "0.0000"}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                disabled
                placeholder="0.0"
                className="w-full bg-transparent text-white text-3xl font-bold outline-none flex-grow cursor-not-allowed"
                value={amountOut}
                readOnly
              />
              <button
                onClick={() => setModalOpenFor("out")}
                className="flex items-center bg-zinc-700 hover:bg-zinc-600 rounded-full py-2 pl-3 pr-4 ml-2 text-white font-semibold"
              >
                {/* Placeholder for token icon */}
                <div className="w-6 h-6 bg-gray-500 rounded-full mr-2"></div>
                {tokenOut.symbol}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 ml-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Price details and Slippage (Placeholders) */}
          <div className="mt-4 text-sm text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>Price</span>
              <span>
                1 {tokenIn.symbol} = ? {tokenOut.symbol}
              </span>{" "}
              {/* This will require fetching price from a router/oracle */}
            </div>
            <div className="flex justify-between">
              <span>Slippage Tolerance</span>
              <span>0.5%</span> {/* This will need a settings modal */}
            </div>
          </div>

          <button
            onClick={handleSwap}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-xl mt-6"
          >
            Swap
          </button>

          {/* Token Selector Modal */}{' '}
          {modalOpenFor && (
            <TokenSelectorModal
              tokens={TOKENS}
              balances={balances}
              onSelect={onSelectToken}
              onClose={() => setModalOpenFor(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DarkNodeSwapBox;
