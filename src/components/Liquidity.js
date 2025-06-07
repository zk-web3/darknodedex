import React, { useState } from "react";

export default function Liquidity({ onOpenTokenList }) {
  const [mode, setMode] = useState("add");
  return (
    <section className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">Liquidity</h2>
          <div className="flex gap-2">
            <button
              className={`px-4 py-1 rounded-xl font-semibold text-sm transition ${mode === "add" ? "bg-cyan-500/80 text-white" : "bg-black/30 text-cyan-300"}`}
              onClick={() => setMode("add")}
            >
              Add
            </button>
            <button
              className={`px-4 py-1 rounded-xl font-semibold text-sm transition ${mode === "remove" ? "bg-purple-600/80 text-white" : "bg-black/30 text-purple-300"}`}
              onClick={() => setMode("remove")}
            >
              Remove
            </button>
          </div>
        </div>
        {/* Token Pair Selector */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="flex-1 px-4 py-3 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 transition text-cyan-300 font-semibold text-base backdrop-blur border border-cyan-400/10 blur-sm select-none"
            onClick={() => onOpenTokenList('tokenA')}
          >
            Token
          </button>
          <span className="text-cyan-400 text-2xl font-bold">+</span>
          <button
            className="flex-1 px-4 py-3 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 transition text-cyan-300 font-semibold text-base backdrop-blur border border-cyan-400/10 blur-sm select-none"
            onClick={() => onOpenTokenList('tokenB')}
          >
            Token
          </button>
        </div>
        {/* Info Panel */}
        <div className="bg-black/30 rounded-xl p-4 border border-cyan-400/10 mb-6 min-h-[60px] flex flex-col gap-2">
          <div className="w-full h-4 bg-cyan-400/10 rounded blur-sm" />
          <div className="w-2/3 h-4 bg-cyan-400/10 rounded blur-sm" />
        </div>
        {/* Add/Remove CTA */}
        <button
          className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white tracking-wide"
        >
          {mode === "add" ? "Add Liquidity" : "Remove Liquidity"}
        </button>
      </div>
    </section>
  );
} 