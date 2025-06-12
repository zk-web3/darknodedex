// /components/DarkNodeSwapBox.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FiSettings } from "react-icons/fi";
import { TOKENS } from "../utils/tokens";
import { UNISWAP_ROUTER_ABI, UNISWAP_ROUTER_ADDRESS } from "../utils/uniswap";
import ERC20_ABI from "../utils/erc20_abi";

let provider;
let signer;

const DarkNodeSwapBox = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [routerContract, setRouterContract] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const network = await provider.getNetwork();
      if (network.chainId !== 84532) return alert("Switch to Base Sepolia Network");
      setRouterContract(
        new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, signer)
      );
      setWalletConnected(true);
    } catch (error) {
      console.error("Wallet Connection Failed:", error);
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
    } catch (error) {
      console.error("Swap Failed:", error);
      alert("Swap Failed. Check console for details.");
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">DarkNode DEX</h2>

      {!walletConnected ? (
        <button
          onClick={connectWallet}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-xl"
        >
          Connect Wallet
        </button>
      ) : (
        <>
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
        </>
      )}

      <div className="flex justify-end mt-4">
        <FiSettings className="text-xl cursor-pointer" />
      </div>
    </div>
  );
};

export default DarkNodeSwapBox;
