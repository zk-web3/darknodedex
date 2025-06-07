import React from "react";
import { FiSettings } from "react-icons/fi";

export default function Swap({ onOpenSettings, onOpenTokenList, onConnectWallet }) {
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
              disabled
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
              disabled
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
            <span className="w-12 h-5 bg-cyan-400/10 rounded-lg blur-sm" />
          </div>
        </div>
        {/* Connect Wallet / Swap CTA */}
        <button
          className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white tracking-wide"
          onClick={onConnectWallet}
        >
          Connect Wallet
        </button>
      </div>
    </section>
  );
} 