import React from "react";
import DarkNodeSwapBox from "./DarkNodeSwapBox"; // 👈 Import your functional SwapBox component

const DarkNodeSwapPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 p-4 shadow-md flex items-center justify-center">
        <h1 className="text-3xl font-bold tracking-wide">DarkNode DEX</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex justify-center items-center p-6">
        {/* SwapBox Actual Component */}
        <DarkNodeSwapBox /> {/* 👈 Replaced Placeholder with working component */}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 p-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DarkNode DEX. All rights reserved.
      </footer>
    </div>
  );
};

export default DarkNodeSwapPage;
