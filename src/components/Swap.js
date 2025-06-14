import React from "react";
import DarkNodeSwapBox from "./DarkNodeSwapBox"; // 👈 Import your functional SwapBox component

const DarkNodeSwapPage = ({ connectWallet, address, network, provider, signer }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 p-4 shadow-md flex items-center justify-center">
        <h1 className="text-3xl font-bold tracking-wide">DarkNode DEX</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex justify-center items-center p-6">
        <div className="w-full max-w-md mx-auto">
          {!provider || !signer ? (
            <div className="text-center text-lg text-gray-400">
              Please connect your wallet to use the swap feature.
              <button
                onClick={connectWallet}
                className="mt-4 w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-xl"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <DarkNodeSwapBox
              connectWallet={connectWallet}
              address={address}
              network={network}
              provider={provider}
              signer={signer}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 p-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DarkNode DEX. All rights reserved.
      </footer>
    </div>
  );
};

export default DarkNodeSwapPage;
