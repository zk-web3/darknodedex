import React, { useEffect, useState } from 'react';

const TransactionHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const storedHistory = JSON.parse(localStorage.getItem('swapHistory')) || [];
        setHistory(storedHistory);

        // You might want to add an event listener here if you expect history to update dynamically
        // e.g., window.addEventListener('localStorageChanged', handleStorageChange);
        // return () => window.removeEventListener('localStorageChanged', handleStorageChange);
    }, []);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full border border-purple-500 glassmorphism-bg mt-8">
            <h2 className="text-2xl font-bold text-white neon-text mb-4">Recent Swaps</h2>
            {history.length === 0 ? (
                <p className="text-gray-400">No swap history found.</p>
            ) : (
                <ul className="space-y-3">
                    {history.map((tx, index) => (
                        <li key={index} className="bg-gray-900 p-3 rounded-md border border-gray-700">
                            <p className="text-sm text-gray-300">Date: {new Date(tx.timestamp).toLocaleString()}</p>
                            <p className="text-white">Swapped <span className="font-semibold">{parseFloat(tx.fromAmount).toFixed(4)} {tx.fromToken}</span> for <span className="font-semibold">{parseFloat(tx.toAmount).toFixed(4)} {tx.toToken}</span></p>
                            <p className="text-xs text-gray-500 truncate">Tx Hash: <a href={`https://sepolia.basescan.org/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{tx.hash}</a></p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TransactionHistory; 