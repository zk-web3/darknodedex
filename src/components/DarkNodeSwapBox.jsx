import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS } from "../utils/uniswap";
import ERC20_ABI from "../utils/erc20_abi";

let provider;
let signer;

const DarkNodeSwapBox = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balances, setBalances] = useState({});
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [routerContract, setRouterContract] = useState(null);
  const [loadingBalances, setLoadingBalances] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Install MetaMask.");
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      const network = await provider.getNetwork();
      if (network.chainId !== 84532)
        return alert("Switch to Base Sepolia Network.");
      setRouterContract(
        new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer)
      );
      setWalletConnected(true);
    } catch (err) {
      console.error("Connection Error", err);
    }
  };

  const fetchBalances = async () => {
    try {
      if (!walletConnected) return;
      setLoadingBalances(true);
      const balData = {};
      for (const token of TOKENS) {
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const rawBal = await tokenContract.balanceOf(walletAddress);
        balData[token.symbol] = ethers.utils.formatUnits(rawBal, token.decimals);
      }
      setBalances(balData);
      setLoadingBalances(false);
    } catch (err) {
      console.error("Error fetching balances", err);
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    if (walletConnected) fetchBalances();
  }, [walletConnected]);

  const handleSwap = async () => {
    try {
      const amt = ethers.utils.parseUnits(amountIn, tokenIn.decimals);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      const tokenInContract = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);
      await tokenInContract.approve(UNISWAP_ROUTER_ADDRESS, amt);
      const tx = await routerContract.exactInputSingle({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: 3000,
        recipient: walletAddress,
        deadline,
        amountIn: amt,
        amountOutMinimum: 0,
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
        <>
          <h2 className="text-xl font-bold mb-4 text-center">Swap Tokens</h2>

          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm">
              <span>From</span>
              <span className="text-gray-400">
                Balance:{" "}
                {loadingBalances
                  ? "Loading..."
                  : balances[tokenIn.symbol]?.slice(0, 10) || "0.00"}
              </span>
            </div>
            <div className="bg-zinc-800 p-3 rounded-xl flex justify-between items-center">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-white text-xl outline-none w-full"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
              />
              <select
                className="bg-transparent text-white font-semibold"
                value={tokenIn.symbol}
                onChange={(e) =>
                  setTokenIn(TOKENS.find((t) => t.symbol === e.target.value))
                }
              >
                {TOKENS.map((t) => (
                  <option key={t.symbol}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm">
              <span>To</span>
              <span className="text-gray-400">
                Balance:{" "}
                {loadingBalances
                  ? "Loading..."
                  : balances[tokenOut.symbol]?.slice(0, 10) || "0.00"}
              </span>
            </div>
            <div className="bg-zinc-800 p-3 rounded-xl flex justify-between items-center">
              <input
                type="text"
                disabled
                placeholder="0.0"
                className="bg-transparent text-white text-xl outline-none w-full"
                value={amountOut}
              />
              <select
                className="bg-transparent text-white font-semibold"
                value={tokenOut.symbol}
                onChange={(e) =>
                  setTokenOut(TOKENS.find((t) => t.symbol === e.target.value))
                }
              >
                {TOKENS.map((t) => (
                  <option key={t.symbol}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSwap}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-xl mt-4"
          >
            Swap
          </button>
        </>
      )}
    </div>
  );
};

export default DarkNodeSwapBox;
