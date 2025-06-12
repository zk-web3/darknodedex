import React from "react";

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
                  ? `${balances[token.address]}`
                  : "0.00"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TokenSelectorModal;
