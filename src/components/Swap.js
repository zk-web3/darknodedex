import React from "react";

const DarkNodeSwapPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 p-4 shadow-md flex items-center justify-center">
        <h1 className="text-3xl font-bold tracking-wide">DarkNode DEX</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex justify-center items-center p-6">
        {/* SwapBox Placeholder */}
        <div className="w-full max-w-md border-4 border-dashed border-purple-700 rounded-3xl p-12 flex flex-col items-center justify-center">
          <p className="text-purple-400 text-xl mb-4 font-semibold">
            SwapBox Component Will Be Here
          </p>
          <div className="w-40 h-40 bg-purple-900 rounded-lg opacity-50 animate-pulse"></div>
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
