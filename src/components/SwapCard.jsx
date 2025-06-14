import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ethers } from 'ethers';

const SwapCard = ({ walletConnected, address, provider, signer, tokens, uniswapRouter, uniswapQuoter, uniswapRouterAbi, erc20Abi }) => {
    const [fromToken, setFromToken] = useState(tokens[0]);
    const [toToken, setToToken] = useState(tokens[1]);
    const [fromValue, setFromValue] = useState('');
    const [toValue, setToValue] = useState('');
    const [priceImpact, setPriceImpact] = useState('0.00');
    const [slippage, setSlippage] = useState('0.5'); // Default slippage
    const [showFromTokenSelect, setShowFromTokenSelect] = useState(false);
    const [showToTokenSelect, setShowToTokenSelect] = useState(false);
    const [approving, setApproving] = useState(false);
    const [swapping, setSwapping] = useState(false);
    const [needsApproval, setNeedsApproval] = useState(false);

    // Helper function to format token amounts
    const formatTokenAmount = (amount, decimals) => {
        if (!amount) return '';
        return ethers.utils.formatUnits(amount, decimals);
    };

    // Helper function to parse token amounts
    const parseTokenAmount = (amount, decimals) => {
        if (!amount) return ethers.BigNumber.from(0);
        try {
            return ethers.utils.parseUnits(amount, decimals);
        } catch (e) {
            console.error("Error parsing amount:", e);
            return ethers.BigNumber.from(0);
        }
    };

    const getQuote = async (amountIn, fromToken, toToken) => {
        if (!provider || !uniswapQuoter || !fromToken || !toToken || amountIn.isZero()) return ethers.BigNumber.from(0);

        try {
            const quoterContract = new ethers.Contract(uniswapQuoter.address, uniswapQuoter.abi, provider);
            const quote = await quoterContract.callStatic.quoteExactInputSingle({
                tokenIn: fromToken.address,
                tokenOut: toToken.address,
                amountIn: amountIn,
                fee: 3000, // Assuming 0.3% fee for now, can be dynamic
                sqrtPriceLimitX96: 0,
            });
            return quote;
        } catch (error) {
            console.error("Error getting quote:", error);
            return ethers.BigNumber.from(0);
        }
    };


    useEffect(() => {
        const fetchQuote = async () => {
            if (fromValue && fromToken && toToken && provider) {
                const amountIn = parseTokenAmount(fromValue, fromToken.decimals);
                if (amountIn.gt(0)) {
                    const quotedAmountOut = await getQuote(amountIn, fromToken, toToken);
                    setToValue(formatTokenAmount(quotedAmountOut, toToken.decimals));
                } else {
                    setToValue('');
                }
            }
        };
        fetchQuote();
    }, [fromValue, fromToken, toToken, provider]);

    useEffect(() => {
        const checkApproval = async () => {
            if (walletConnected && address && signer && fromToken && fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000') {
                try {
                    const tokenContract = new ethers.Contract(fromToken.address, erc20Abi, provider);
                    const allowance = await tokenContract.allowance(address, uniswapRouter.address);
                    const amountToApprove = parseTokenAmount(fromValue, fromToken.decimals);
                    setNeedsApproval(allowance.lt(amountToApprove));
                } catch (error) {
                    console.error("Error checking approval:", error);
                    setNeedsApproval(true); // Assume approval needed on error
                }
            } else {
                setNeedsApproval(false); // No approval needed for native token or if not connected
            }
        };
        checkApproval();
    }, [fromValue, fromToken, walletConnected, address, signer, uniswapRouter.address, erc20Abi]);


    const handleFromValueChange = (e) => {
        setFromValue(e.target.value);
    };

    const handleSwapTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromValue(toValue);
        setToValue(fromValue);
    };

    const handleApprove = async () => {
        setApproving(true);
        try {
            const tokenContract = new ethers.Contract(fromToken.address, erc20Abi, signer);
            const amountToApprove = ethers.constants.MaxUint256; // Approve max for simplicity
            const tx = await tokenContract.approve(uniswapRouter.address, amountToApprove);
            await tx.wait();
            setNeedsApproval(false);
            alert('Approval successful!');
        } catch (error) {
            console.error("Approval failed:", error);
            alert(`Approval failed: ${error.message}`);
        } finally {
            setApproving(false);
        }
    };

    const handleSwap = async () => {
        setSwapping(true);
        try {
            const routerContract = new ethers.Contract(uniswapRouter.address, uniswapRouter.abi, signer);
            const amountIn = parseTokenAmount(fromValue, fromToken.decimals);
            const amountOutMin = parseTokenAmount(toValue, toToken.decimals).mul(ethers.BigNumber.from(10000 - parseFloat(slippage) * 100)).div(10000); // Apply slippage
            const path = [fromToken.address, toToken.address];
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

            let tx;
            if (fromToken.address === '0x0000000000000000000000000000000000000000') { // ETH to ERC20
                tx = await routerContract.exactInputSingle({
                    tokenIn: fromToken.address,
                    tokenOut: toToken.address,
                    fee: 3000,
                    recipient: address,
                    deadline: deadline,
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0
                }, { value: amountIn });
            } else if (toToken.address === '0x0000000000000000000000000000000000000000') { // ERC20 to ETH
                 tx = await routerContract.exactInputSingle({
                    tokenIn: fromToken.address,
                    tokenOut: toToken.address,
                    fee: 3000,
                    recipient: address,
                    deadline: deadline,
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0
                });
            } else { // ERC20 to ERC20
                 tx = await routerContract.exactInputSingle({
                    tokenIn: fromToken.address,
                    tokenOut: toToken.address,
                    fee: 3000,
                    recipient: address,
                    deadline: deadline,
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMin,
                    sqrtPriceLimitX96: 0
                });
            }


            await tx.wait();
            alert('Swap successful!');

            // --- Add this block for history storage --- 
            const transaction = {
                hash: tx.hash,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                fromAmount: fromValue,
                toAmount: toValue,
                timestamp: new Date().toISOString(),
            };

            const existingHistory = JSON.parse(localStorage.getItem('swapHistory')) || [];
            localStorage.setItem('swapHistory', JSON.stringify([transaction, ...existingHistory]));
            // --- End of history storage block ---

            setFromValue('');
            setToValue('');
        } catch (error) {
            console.error("Swap failed:", error);
            alert(`Swap failed: ${error.message}`);
        } finally {
            setSwapping(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full border border-purple-500 glassmorphism-bg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white neon-text">Swap Tokens</h2>
                {/* <div className="text-gray-400">Settings Icon</div> */}
            </div>

            {/* From Token Input */}
            <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">From</span>
                    <span className="text-gray-400 text-sm">Balance: 0.0</span> {/* Placeholder for balance */}
                </div>
                <div className="flex items-center">
                    <input
                        type="number"
                        placeholder="0.0"
                        className="w-full bg-transparent text-white text-3xl font-bold outline-none"
                        value={fromValue}
                        onChange={handleFromValueChange}
                    />
                    <button
                        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
                        onClick={() => setShowFromTokenSelect(!showFromTokenSelect)}
                    >
                        <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-6 h-6 mr-2" />
                        {fromToken.symbol} <ChevronDownIcon className="h-5 w-5 ml-1" />
                    </button>
                </div>
                {showFromTokenSelect && (
                    <div className="absolute z-10 bg-gray-700 rounded-md shadow-lg mt-2 max-h-60 overflow-y-auto">
                        {tokens.map(token => (
                            <div
                                key={token.address}
                                className="flex items-center p-2 hover:bg-gray-600 cursor-pointer text-white"
                                onClick={() => { setFromToken(token); setShowFromTokenSelect(false); }}
                            >
                                <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 mr-2" />
                                {token.symbol}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center -my-2">
                <button
                    className="bg-gray-700 p-2 rounded-full border-4 border-gray-800 hover:border-purple-500 transition-colors duration-200"
                    onClick={handleSwapTokens}
                >
                    <ArrowDownIcon className="h-6 w-6 text-purple-400" />
                </button>
            </div>

            {/* To Token Input */}
            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">To</span>
                    <span className="text-gray-400 text-sm">Balance: 0.0</span> {/* Placeholder for balance */}
                </div>
                <div className="flex items-center">
                    <input
                        type="number"
                        placeholder="0.0"
                        className="w-full bg-transparent text-white text-3xl font-bold outline-none"
                        value={toValue}
                        readOnly
                    />
                    <button
                        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
                        onClick={() => setShowToTokenSelect(!showToTokenSelect)}
                    >
                        <img src={toToken.logoURI} alt={toToken.symbol} className="w-6 h-6 mr-2" />
                        {toToken.symbol} <ChevronDownIcon className="h-5 w-5 ml-1" />
                    </button>
                </div>
                {showToTokenSelect && (
                    <div className="absolute z-10 bg-gray-700 rounded-md shadow-lg mt-2 max-h-60 overflow-y-auto">
                        {tokens.map(token => (
                            <div
                                key={token.address}
                                className="flex items-center p-2 hover:bg-gray-600 cursor-pointer text-white"
                                onClick={() => { setToToken(token); setShowToTokenSelect(false); }}
                            >
                                <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 mr-2" />
                                {token.symbol}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Impact & Slippage (Placeholder for now) */}
            <div className="text-gray-400 text-sm mb-4">
                <p>Price Impact: {priceImpact}%</p>
                <div className="flex items-center">
                    <label htmlFor="slippage" className="mr-2">Slippage Tolerance:</label>
                    <input
                        id="slippage"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50" // Set a reasonable max
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        className="w-20 bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm"
                    />
                    <span className="ml-1">%</span>
                </div>
            </div>

            {walletConnected ? (
                needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000' ? (
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        onClick={handleApprove}
                        disabled={approving}
                    >
                        {approving ? 'Approving...' : `Approve ${fromToken.symbol}`}
                    </button>
                ) : (
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        onClick={handleSwap}
                        disabled={swapping || !fromValue || !toValue || parseTokenAmount(fromValue, fromToken.decimals).isZero()}
                    >
                        {swapping ? 'Swapping...' : 'Swap'}
                    </button>
                )
            ) : (
                <button
                    className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-lg cursor-not-allowed"
                    disabled
                >
                    Connect Wallet to Swap
                </button>
            )}
        </div>
    );
};

export default SwapCard;