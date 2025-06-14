import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDownIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TxStatusModal from './TxStatusModal';

const SwapCard = ({ walletConnected, address, tokens, uniswapRouter, uniswapQuoter, uniswapRouterAbi, erc20Abi }) => {
    const [fromToken, setFromToken] = useState(tokens[0]);
    const [toToken, setToToken] = useState(tokens[1]);
    const [fromValue, setFromValue] = useState('');
    const [toValue, setToValue] = useState('');
    const [priceImpact, setPriceImpact] = useState('0.00');
    const [slippage, setSlippage] = useState('0.5'); // Default slippage
    const [showFromTokenSelect, setShowFromTokenSelect] = useState(false);
    const [showToTokenSelect, setShowToTokenSelect] = useState(false);
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

    // Wagmi v2+ clients
    const publicClient = usePublicClient();

    // Fetch balances for selected tokens
    const { data: fromTokenBalance } = useBalance({
        address: address,
        token: fromToken.address === '0x0000000000000000000000000000000000000000' ? undefined : fromToken.address,
        query: { watch: true },
    });
    const { data: toTokenBalance } = useBalance({
        address: address,
        token: toToken.address === '0x0000000000000000000000000000000000000000' ? undefined : toToken.address,
        query: { watch: true },
    });

    const getQuote = useCallback(async (amountInBigInt, fromToken, toToken) => {
        if (!publicClient || !uniswapQuoter || !fromToken || !toToken || amountInBigInt === 0n) return 0n;

        try {
            const quote = await publicClient.readContract({
                address: uniswapQuoter.address,
                abi: uniswapQuoter.abi,
                functionName: 'quoteExactInputSingle',
                args: [{
                    tokenIn: fromToken.address,
                    tokenOut: toToken.address,
                    amountIn: amountInBigInt,
                    fee: 3000,
                    sqrtPriceLimitX96: 0n,
                }],
            });
            return BigInt(quote);
        } catch (error) {
            console.error("Error getting quote:", error);
            return 0n;
        }
    }, [publicClient, uniswapQuoter]);

    useEffect(() => {
        const fetchQuote = async () => {
            if (fromValue && fromToken && toToken && publicClient) {
                const amountInBigInt = parseUnits(fromValue, fromToken.decimals);
                if (amountInBigInt > 0n) {
                    const quotedAmountOut = await getQuote(amountInBigInt, fromToken, toToken);
                    setToValue(formatUnits(quotedAmountOut, toToken.decimals));
                } else {
                    setToValue('');
                }
            }
        };
        fetchQuote();
    }, [fromValue, fromToken, toToken, publicClient, getQuote]);

    const calculatePriceImpact = useCallback(async () => {
        if (fromValue && toValue && fromToken && toToken && publicClient && parseUnits(fromValue, fromToken.decimals) > 0n) {
            const smallAmountIn = parseUnits('1', fromToken.decimals);
            const smallQuoteOut = await getQuote(smallAmountIn, fromToken, toToken);

            if (smallQuoteOut > 0n) {
                const smallAmountInNum = parseFloat(formatUnits(smallAmountIn, fromToken.decimals));
                const smallQuoteOutNum = parseFloat(formatUnits(smallQuoteOut, toToken.decimals));
                const marketPriceRatio = smallQuoteOutNum / smallAmountInNum;
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
        }
        else {
            setPriceImpact('0.00');
        }
    }, [fromValue, toValue, fromToken, toToken, publicClient, getQuote]);

    useEffect(() => {
        calculatePriceImpact();
    }, [calculatePriceImpact]);

    const amountToApproveBigInt = fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000'
        ? parseUnits(fromValue, fromToken.decimals)
        : 0n;

    const { data: approveSimulateData, error: approveSimulateError } = useSimulateContract({
        address: fromToken.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [uniswapRouter.address, ethers.MaxUint256],
        query: { enabled: walletConnected && amountToApproveBigInt > 0n },
    });
    const { data: approveWriteData, writeContract: writeApprove } = useWriteContract();
    const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveErrorTx, data: approveTxData } = useWaitForTransactionReceipt({ hash: approveWriteData });

    useEffect(() => {
        if (isApproveLoading) {
            openModal('loading', 'Approving...', `Approving ${fromToken.symbol} for spending by the router.`);
        } else if (isApproveSuccess) {
            openModal('success', 'Approval Successful!', `You have successfully approved ${fromToken.symbol}.`, approveTxData?.transactionHash);
        } else if (isApproveErrorTx) {
            openModal('error', 'Approval Failed', `Error approving ${fromToken.symbol}: ${approveSimulateError?.message || 'Transaction failed.'}`, approveTxData?.transactionHash);
        }
    }, [isApproveLoading, isApproveSuccess, isApproveErrorTx, approveSimulateError, approveTxData, fromToken.symbol]);

    const checkApproval = useCallback(async () => {
        if (walletConnected && address && publicClient && fromToken && fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000') {
            try {
                const allowance = await publicClient.readContract({
                    address: fromToken.address,
                    abi: erc20Abi,
                    functionName: 'allowance',
                    args: [address, uniswapRouter.address],
                });
                const amountIn = parseUnits(fromValue, fromToken.decimals);
                setNeedsApproval(allowance < amountIn);
            } catch (error) {
                console.error("Error checking approval:", error);
                setNeedsApproval(true);
            }
        } else {
            setNeedsApproval(false);
        }
    }, [walletConnected, address, publicClient, fromToken, fromValue, uniswapRouter.address, erc20Abi]);

    useEffect(() => {
        checkApproval();
    }, [checkApproval]);

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
        if (approveSimulateData?.request && writeApprove) {
            writeApprove(approveSimulateData.request);
        } else {
            openModal('error', 'Approval Error', 'Could not prepare approval transaction. Check console for details.');
            console.error("Approve function not ready or configuration error:", approveSimulateError);
        }
    };

    const amountInBigInt = parseUnits(fromValue, fromToken.decimals);
    const amountOutMinBigInt = parseUnits(toValue, toToken.decimals) * (BigInt(10000) - BigInt(parseFloat(slippage) * 100)) / 10000n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    const swapArgs = [{
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        fee: 3000,
        recipient: address,
        deadline: deadline,
        amountIn: amountInBigInt,
        amountOutMinimum: amountOutMinBigInt,
        sqrtPriceLimitX96: 0n
    }];

    const isEthToToken = fromToken.address === '0x0000000000000000000000000000000000000000';

    const { data: swapSimulateData, error: swapSimulateError } = useSimulateContract({
        address: uniswapRouter.address,
        abi: uniswapRouter.abi,
        functionName: 'exactInputSingle',
        args: swapArgs,
        value: isEthToToken ? amountInBigInt : undefined,
        query: { enabled: walletConnected && amountInBigInt > 0n && toValue && !needsApproval },
    });

    const { data: swapWriteData, writeContract: writeSwap } = useWriteContract();
    const { isLoading: isSwapLoading, isSuccess: isSwapSuccess, isError: isSwapErrorTx, data: swapTxData } = useWaitForTransactionReceipt({ hash: swapWriteData });

    useEffect(() => {
        if (isSwapLoading) {
            openModal('loading', 'Swapping...', `Swapping ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`);
        } else if (isSwapSuccess) {
            openModal('success', 'Swap Successful!', `Successfully swapped ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`, swapTxData?.transactionHash);
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
            openModal('error', 'Swap Failed', `Error swapping: ${swapSimulateError?.message || 'Transaction failed.'}`, swapTxData?.transactionHash);
        }
    }, [isSwapLoading, isSwapSuccess, isSwapErrorTx, swapSimulateError, swapTxData, fromToken.symbol, toToken.symbol, fromValue, toValue]);

    const handleSwap = async () => {
        if (swapSimulateData?.request && writeSwap) {
            writeSwap(swapSimulateData.request);
        }
        else {
            openModal('error', 'Swap Error', 'Could not prepare swap transaction. Check console for details.');
            console.error("Swap function not ready or configuration error:", swapSimulateError);
        }
    };

    const estimatedGas = approveSimulateData?.request?.gasLimit || swapSimulateData?.request?.gasLimit ? formatUnits(approveSimulateData?.request?.gasLimit || swapSimulateData?.request?.gasLimit || 0n, 0) : 'N/A';

    return (
        <div className="bg-gray-900 rounded-lg p-6 shadow-xl max-w-md w-full border border-gray-700 glassmorphism-bg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white neon-text">Swap</h2>
                {/* Settings icon can go here */}
            </div>

            {/* Sell Token Input */}
            <div className="mb-3 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors duration-200 relative">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-lg">Sell</span>
                    <span className="text-gray-400 text-sm">Balance: {fromTokenBalance ? formatUnits(fromTokenBalance.value, fromTokenBalance.decimals) : '0.0'} {fromToken.symbol}</span>
                </div>
                <div className="flex items-center">
                    <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-transparent text-white text-3xl font-semibold outline-none focus:outline-none"
                        value={fromValue}
                        onChange={handleFromValueChange}
                    />
                    <button
                        className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-xl transition duration-200"
                        onClick={() => setShowFromTokenSelect(!showFromTokenSelect)}
                    >
                        <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-7 h-7 mr-2 rounded-full" />
                        <span className="text-xl font-semibold">{fromToken.symbol}</span>
                        <ChevronDownIcon className="h-5 w-5 ml-2 text-gray-400" />
                    </button>
                </div>
                {showFromTokenSelect && (
                    <div className="absolute z-10 bg-gray-700 rounded-md shadow-lg mt-2 left-0 right-0 max-h-60 overflow-y-auto border border-gray-600">
                        {tokens.map(token => (
                            <div
                                key={token.address}
                                className="flex items-center p-3 hover:bg-gray-600 cursor-pointer text-white"
                                onClick={() => { setFromToken(token); setShowFromTokenSelect(false); }}
                            >
                                <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 mr-3 rounded-full" />
                                <span className="text-lg">{token.symbol}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center -my-3">
                <button
                    className="bg-gray-700 p-2 rounded-full border-4 border-gray-900 hover:border-purple-500 transition-colors duration-200 shadow-lg z-10"
                    onClick={handleSwapTokens}
                >
                    <ArrowDownIcon className="h-6 w-6 text-purple-400" />
                </button>
            </div>

            {/* Buy Token Input */}
            <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors duration-200 relative">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-lg">Buy</span>
                    <span className="text-gray-400 text-sm">Balance: {toTokenBalance ? formatUnits(toTokenBalance.value, toTokenBalance.decimals) : '0.0'} {toToken.symbol}</span>
                </div>
                <div className="flex items-center">
                    <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-transparent text-white text-3xl font-semibold outline-none focus:outline-none"
                        value={toValue}
                        readOnly
                    />
                    <button
                        className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-xl transition duration-200"
                        onClick={() => setShowToTokenSelect(!showToTokenSelect)}
                    >
                        <img src={toToken.logoURI} alt={toToken.symbol} className="w-7 h-7 mr-2 rounded-full" />
                        <span className="text-xl font-semibold">{toToken.symbol}</span>
                        <ChevronDownIcon className="h-5 w-5 ml-2 text-gray-400" />
                    </button>
                </div>
                {showToTokenSelect && (
                    <div className="absolute z-10 bg-gray-700 rounded-md shadow-lg mt-2 left-0 right-0 max-h-60 overflow-y-auto border border-gray-600">
                        {tokens.map(token => (
                            <div
                                key={token.address}
                                className="flex items-center p-3 hover:bg-gray-600 cursor-pointer text-white"
                                onClick={() => { setToToken(token); setShowToTokenSelect(false); }}
                            >
                                <img src={token.logoURI} alt={token.symbol} className="w-7 h-7 mr-3 rounded-full" />
                                <span className="text-lg">{token.symbol}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Impact & Slippage & Fees */}
            <div className="text-gray-400 text-sm space-y-2 mb-6">
                <div className="flex justify-between">
                    <span>Price Impact:</span>
                    <span className="font-medium text-white">{priceImpact}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Slippage Tolerance:</span>
                    <div className="flex items-center">
                        <input
                            id="slippage"
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="50"
                            value={slippage}
                            onChange={(e) => setSlippage(e.target.value)}
                            className="w-20 bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm outline-none focus:border-purple-500"
                        />
                        <span className="ml-1">%</span>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span>Fee (0.25%):</span>
                    <span className="font-medium text-white">~ 0.00 ETH</span> {/* Placeholder */}
                </div>
                <div className="flex justify-between">
                    <span>Network fee:</span>
                    <span className="font-medium text-white">~ {estimatedGas} ETH</span>
                </div>
                <div className="flex justify-between">
                    <span>Routing source:</span>
                    <span className="font-medium text-white">Uniswap V3</span> {/* Placeholder */}
                </div>
            </div>

            {walletConnected ? (
                needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000' ? (
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        onClick={handleApprove}
                        disabled={isApproveLoading || !approveSimulateData?.request || amountToApproveBigInt === 0n}
                    >
                        {isApproveLoading ? 'Approving...' : `Approve ${fromToken.symbol}`}
                    </button>
                ) : (
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        onClick={handleSwap}
                        disabled={isSwapLoading || !swapSimulateData?.request || amountInBigInt === 0n || !toValue}
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