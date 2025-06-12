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
  const [loadingConnect, setLoadingConnect] = useState(false);

  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [routerContract, setRouterContract] = useState(null);

  const connectWallet = async () => {
    try {
      setLoadingConnect(true);

      if (!window.ethereum) return alert("Please install MetaMask.");
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const network = await provider.getNetwork();

      if (network.chainId !== 84532) {
        alert("Please switch to Base Sepolia Network.");
        setLoadingConnect(false);
        return;
      }

      const address = await signer.getAddress();
      setWalletAddress(address);

      setRouterContract(
        new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer)
      );

      await fetchBalances(address);
      setWalletConnected(true);
    } catch (error) {
      console.error("Wallet Connection Failed:", error);
    } finally {
      setLoadingConnect(false);
    }
  };

  const fetchBalances = async (address) => {
    try {
      let updated = {};

      // Fetch ETH Balance
      const ethBal = await provider.getBalance(address);
      updated["ETH"] = ethers.utils.formatEther(ethBal);

      // Fetch other token balances
      for (const token of TOKENS) {
        if (token.symbol === "ETH") continue;
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const rawBal = await tokenContract.balanceOf(address);
        updated[token.symbol] = ethers.utils.formatUnits(rawBal, token.decimals);
      }

      setBalances(updated);
    } catch (err) {
      console.error("Fetching balances failed", err);
    }
  };

  const handleSwap = async () => {
    try {
      if (!amountIn || isNaN(amountIn)) {
        alert("Enter a valid amount.");
        return;
      }

      if (tokenIn.address === tokenOut.address) {
        alert("Token In and Out must be different.");
        return;
      }

      const amountInWei = ethers.utils.parseUnits(amountIn, tokenIn.decimals);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      const tokenInContract = new ethers.Contract(tokenIn.address, ERC20_ABI, signer);

      await tokenInContract.approve(UNISWAP_ROUTER_ADDRESS, amountInWei);

      const tx = await routerContract.exactInputSingle({
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        fee: 3000,
        recipient: await signer.getAddress(),
        deadline,
        amountIn: amountInWei,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      });

      await tx.wait();
      alert("Swap Successful");

      // 🔁 Update balances
      await fetchBalances(walletAddress);
    } catch (error) {
      console.error("Swap Failed:", error);
      alert("Swap Failed. Check console for details.");
    }
  };

  // 🟣 Connect Button
  if (!walletConnected) {
    return (
      <div className="text-center">
        <button
          onClick={connectWallet}
          className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl text-lg font-semibold"
          disabled={loadingConnect}
        >
          {loadingConnect ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    );
  }

  // 🟪 Swap Box (after wallet connected)
  return (
    <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-[380px]">
      <h2 className="text-2xl font-bold mb-4 text-center">DarkNode DEX</h2>

      <div className="text-sm text-gray-400 mb-4 break-all text-center">
        Connected: {walletAddress}
      </div>

      <div className="bg-zinc-800 p-3 rounded-lg text-sm mb-4">
        <h4 className="font-semibold mb-2 text-purple-400">Wallet Balances</h4>
        {Object.keys(balances).length === 0 ? (
          <p>Loading balances...</p>
        ) : (
          <ul className="space-y-1">
            {Object.entries(balances).map(([sym, bal]) => (
              <li key={sym}>
                <span className="font-semibold">{sym}:</span> {parseFloat(bal).toFixed(4)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* From Token */}
      <div className="mb-4">
        <label className="block mb-1">From:</label>
        <select
          className="w-full p-2 bg-zinc-800 rounded"
          value={tokenIn.symbol}
          onChange={(e) =>
            setTokenIn(TOKENS.find((t) => t.symbol === e.target.value))
          }
        >
          {TOKENS.map((token) => (
            <option key={token.address} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Amount"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          className="w-full mt-2 p-2 bg-zinc-800 rounded"
        />
      </div>

      {/* To Token */}
      <div className="mb-4">
        <label className="block mb-1">To:</label>
        <select
          className="w-full p-2 bg-zinc-800 rounded"
          value={tokenOut.symbol}
          onChange={(e) =>
            setTokenOut(TOKENS.find((t) => t.symbol === e.target.value))
          }
        >
          {TOKENS.map((token) => (
            <option key={token.address} value={token.symbol}>
              {token.symbol}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Estimated Output"
          value={amountOut}
          disabled
          className="w-full mt-2 p-2 bg-zinc-800 rounded text-gray-400"
        />
      </div>

      <button
        onClick={handleSwap}
        className="w-full bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-xl mt-4"
      >
        Swap
      </button>
    </div>
  );
};

export default DarkNodeSwapBox;
