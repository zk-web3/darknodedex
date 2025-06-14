import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ethers } from 'ethers';
import { useBalance, usePrepareWriteContract, useWriteContract, useWaitForTransaction, useSimulateContract } from 'wagmi';
import TxStatusModal from './TxStatusModal';

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

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalTxHash, setModalTxHash] = useState('');

    const openModal = (status, title, message, txHash = '') => {
        setModalStatus(status);
        setModalTitle(title);
        setModalMessage(message);
        setModalTxHash(txHash);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalStatus('');
        setModalTitle('');
        setModalMessage('');
        setModalTxHash('');
    };

    // Fetch balances for selected tokens
    const { data: fromTokenBalance } = useBalance({
        address: address,
        token: fromToken.address === '0x0000000000000000000000000000000000000000' ? undefined : fromToken.address,
        watch: true, // Keep updated
    });
    const { data: toTokenBalance } = useBalance({
        address: address,
        token: toToken.address === '0x0000000000000000000000000000000000000000' ? undefined : toToken.address,
        watch: true,
    });

    // Helper function to format token amounts
    const formatTokenAmount = (amount, decimals) => {
        if (!amount) return '';
        try {
            return ethers.utils.formatUnits(amount, decimals);
        } catch (e) {
            return '0.0'; // Handle potential formatting errors gracefully
        }
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

    // --- Price Impact Calculation ---
    useEffect(() => {
        const calculatePriceImpact = async () => {
            if (fromValue && toValue && fromToken && toToken && provider && !parseTokenAmount(fromValue, fromToken.decimals).isZero()) {
                // Get a micro-quote for a small amount to approximate market price
                const smallAmountIn = ethers.utils.parseUnits('1', fromToken.decimals); // 1 unit of fromToken
                const smallQuoteOut = await getQuote(smallAmountIn, fromToken, toToken);

                if (smallQuoteOut.gt(0)) {
                    // Calculate the ideal expected output based on the small quote (market price)
                    const marketPriceRatio = parseFloat(ethers.utils.formatUnits(smallQuoteOut, toToken.decimals)) / parseFloat(ethers.utils.formatUnits(smallAmountIn, fromToken.decimals));
                    const expectedOutput = parseFloat(fromValue) * marketPriceRatio;

                    const actualOutput = parseFloat(toValue);

                    if (expectedOutput > 0) {
                        const impact = ((expectedOutput - actualOutput) / expectedOutput) * 100;
                        setPriceImpact(impact.toFixed(2));
                    } else {
                        setPriceImpact('0.00');
                    }
                } else {
                    setPriceImpact('0.00');
                }
            } else {
                setPriceImpact('0.00');
            }
        };
        calculatePriceImpact();
    }, [fromValue, toValue, fromToken, toToken, provider]);

    // --- Wagmi hooks for Approval --- 
    const amountToApprove = fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000' 
        ? parseTokenAmount(fromValue, fromToken.decimals) 
        : ethers.BigNumber.from(0);

    const { config: approveConfig, error: approvePrepareError } = usePrepareWriteContract({
        address: fromToken.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [uniswapRouter.address, ethers.constants.MaxUint256], // Approve max for simplicity
        enabled: needsApproval && walletConnected && amountToApprove.gt(0),
    });
    const { data: approveData, write: writeApprove } = useWriteContract(approveConfig);
    const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveErrorTx, data: approveTxData } = useWaitForTransaction({ hash: approveData?.hash });

    useEffect(() => {
        if (isApproveLoading) {
            openModal('loading', 'Approving...', `Approving ${fromToken.symbol} for spending by the router.`);
        } else if (isApproveSuccess) {
            openModal('success', 'Approval Successful!', `You have successfully approved ${fromToken.symbol}.`, approveTxData?.transactionHash);
            setNeedsApproval(false);
        } else if (isApproveErrorTx) {
            openModal('error', 'Approval Failed', `Error approving ${fromToken.symbol}: ${approvePrepareError?.message || 'Transaction failed.'}`, approveTxData?.transactionHash);
        }
    }, [isApproveLoading, isApproveSuccess, isApproveErrorTx, approvePrepareError, approveTxData]);


    useEffect(() => {
        const checkApproval = async () => {
            if (walletConnected && address && signer && fromToken && fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000') {
                try {
                    const tokenContract = new ethers.Contract(fromToken.address, erc20Abi, provider);
                    const allowance = await tokenContract.allowance(address, uniswapRouter.address);
                    const amountIn = parseTokenAmount(fromValue, fromToken.decimals);
                    setNeedsApproval(allowance.lt(amountIn));
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
        if (writeApprove) {
            writeApprove();
        } else {
            openModal('error', 'Approval Error', 'Could not prepare approval transaction. Check console for details.');
            console.error("Approve function not ready or configuration error:", approvePrepareError);
        }
    };

    // --- Wagmi hooks for Swap --- 
    const amountIn = parseTokenAmount(fromValue, fromToken.decimals);
    const amountOutMin = parseTokenAmount(toValue, toToken.decimals).mul(ethers.BigNumber.from(10000 - parseFloat(slippage) * 100)).div(10000);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    const swapArgs = {
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        fee: 3000,
        recipient: address,
        deadline: deadline,
        amountIn: amountIn,
        amountOutMinimum: amountOutMin,
        sqrtPriceLimitX96: 0
    };

    const isEthToToken = fromToken.address === '0x0000000000000000000000000000000000000000';

    const { config: swapConfig, error: swapPrepareError, isError: isSwapPrepareError } = usePrepareWriteContract({
        address: uniswapRouter.address,
        abi: uniswapRouter.abi,
        functionName: 'exactInputSingle',
        args: [swapArgs],
        value: isEthToToken ? amountIn : undefined,
        enabled: walletConnected && amountIn.gt(0) && toValue && !needsApproval && !swapping,
    });

    const { data: swapData, write: writeSwap } = useWriteContract(swapConfig);
    const { isLoading: isSwapLoading, isSuccess: isSwapSuccess, isError: isSwapErrorTx, data: swapTxData } = useWaitForTransaction({ hash: swapData?.hash });


    useEffect(() => {
        if (isSwapLoading) {
            openModal('loading', 'Swapping...', `Swapping ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`);
        } else if (isSwapSuccess) {
            openModal('success', 'Swap Successful!', `Successfully swapped ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`, swapTxData?.transactionHash);
            // Save to local storage after successful swap
            const transaction = {
                hash: swapTxData?.transactionHash,
                fromToken: fromToken.symbol,
                toToken: toToken.symbol,
                fromAmount: fromValue,
                toAmount: toValue,
                timestamp: new Date().toISOString(),
            };
            const existingHistory = JSON.parse(localStorage.getItem('swapHistory')) || [];
            localStorage.setItem('swapHistory', JSON.stringify([transaction, ...existingHistory]));

            setFromValue('');
            setToValue('');
        } else if (isSwapErrorTx) {
            openModal('error', 'Swap Failed', `Error swapping: ${swapPrepareError?.message || 'Transaction failed.'}`, swapTxData?.transactionHash);
        }
    }, [isSwapLoading, isSwapSuccess, isSwapErrorTx, swapPrepareError, swapTxData]);


    const handleSwap = async () => {
        if (writeSwap) {
            writeSwap();
        } else {
            openModal('error', 'Swap Error', 'Could not prepare swap transaction. Check console for details.');
            console.error("Swap function not ready or configuration error:", swapPrepareError);
        }
    };

    const estimatedGas = approveConfig.request?.gasLimit || swapConfig.request?.gasLimit ? ethers.utils.formatUnits(approveConfig.request?.gasLimit || swapConfig.request?.gasLimit || ethers.BigNumber.from(0), 0) : 'N/A';


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
                    <span className="text-gray-400 text-sm">Balance: {fromTokenBalance ? formatTokenAmount(fromTokenBalance.value, fromTokenBalance.decimals) : '0.0'} {fromToken.symbol}</span>
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
                    <span className="text-gray-400 text-sm">Balance: {toTokenBalance ? formatTokenAmount(toTokenBalance.value, toTokenBalance.decimals) : '0.0'} {toToken.symbol}</span>
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

            {/* Price Impact & Slippage */}
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
                <p className="mt-2">Estimated Gas: {estimatedGas} </p>
            </div>

            {walletConnected ? (
                needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000' ? (
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        onClick={handleApprove}
                        disabled={isApproveLoading || !writeApprove || amountToApprove.isZero()}
                    >
                        {isApproveLoading ? 'Approving...' : `Approve ${fromToken.symbol}`}
                    </button>
                ) : (
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        onClick={handleSwap}
                        disabled={isSwapLoading || !writeSwap || amountIn.isZero() || !toValue}
                    >
                        {isSwapLoading ? 'Swapping...' : 'Swap'}
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

            <TxStatusModal
                isOpen={isModalOpen}
                onClose={closeModal}
                status={modalStatus}
                title={modalTitle}
                message={modalMessage}
                txHash={modalTxHash}
                explorerUrl="https://sepolia.basescan.org"
            />
        </div>
    );
};

export default SwapCard;