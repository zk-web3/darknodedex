import React from "react";

export default function Faucet() {
  return (
    <section className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/20 p-8 w-full max-w-md relative flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white tracking-wide mb-6">Faucet</h2>
        <div className="w-full h-16 bg-cyan-400/10 rounded-xl blur-sm mb-6" />
        <button
          className="w-full py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg hover:from-cyan-400 hover:to-purple-500 transition text-white tracking-wide"
          disabled
        >
          Request Testnet Tokens
        </button>
      </div>
    </section>
  );
} 