import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useWalletClient, usePrepareWriteContract, useWriteContract, useWaitForTransaction } from 'wagmi';
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
    const { data: publicClient } = usePublicClient();
    const { data: walletClient } = useWalletClient();

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

    const getQuote = async (amountInBigInt, fromToken, toToken) => {
        if (!publicClient || !uniswapQuoter || !fromToken || !toToken || amountInBigInt === 0n) return 0n;

        try {
            // Use ethers.Contract with walletClient.transport (for ethers v6 compatible signer) or publicClient for read
            const quoterContract = new ethers.Contract(uniswapQuoter.address, uniswapQuoter.abi, publicClient);

            // Wagmi's publicClient.readContract is often cleaner for calls
            const quote = await publicClient.readContract({
                address: uniswapQuoter.address,
                abi: uniswapQuoter.abi,
                functionName: 'quoteExactInputSingle',
                args: [{
                    tokenIn: fromToken.address,
                    tokenOut: toToken.address,
                    amountIn: amountInBigInt,
                    fee: 3000, // Assuming 0.3% fee for now, can be dynamic
                    sqrtPriceLimitX96: 0n, // BigInt literal for sqrtPriceLimitX96
                }],
            });
            return BigInt(quote); // Ensure it's BigInt for consistency
        } catch (error) {
            console.error("Error getting quote:", error);
            return 0n;
        }
    };


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
    }, [fromValue, fromToken, toToken, publicClient]);

    // --- Price Impact Calculation ---
    useEffect(() => {
        const calculatePriceImpact = async () => {
            if (fromValue && toValue && fromToken && toToken && publicClient && parseUnits(fromValue, fromToken.decimals) > 0n) {
                // Get a micro-quote for a small amount to approximate market price
                const smallAmountIn = parseUnits('1', fromToken.decimals); // 1 unit of fromToken
                const smallQuoteOut = await getQuote(smallAmountIn, fromToken, toToken);

                if (smallQuoteOut > 0n) {
                    // Convert BigInts to numbers for floating-point division for ratio
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
            } else {
                setPriceImpact('0.00');
            }
        };
        calculatePriceImpact();
    }, [fromValue, toValue, fromToken, toToken, publicClient]);

    // --- Wagmi hooks for Approval ---
    const amountToApproveBigInt = fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000'
        ? parseUnits(fromValue, fromToken.decimals)
        : 0n;

    const { config: approveConfig, error: approvePrepareError } = usePrepareWriteContract({
        address: fromToken.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [uniswapRouter.address, ethers.MaxUint256], // Use ethers.MaxUint256 for ethers v6
        enabled: walletConnected && amountToApproveBigInt > 0n,
    });
    const { data: approveData, writeContract: writeApprove } = useWriteContract(approveConfig);
    const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveErrorTx, data: approveTxData } = useWaitForTransaction({ hash: approveData?.hash });

    useEffect(() => {
        if (isApproveLoading) {
            openModal('loading', 'Approving...', `Approving ${fromToken.symbol} for spending by the router.`);
        } else if (isApproveSuccess) {
            openModal('success', 'Approval Successful!', `You have successfully approved ${fromToken.symbol}.`, approveTxData?.transactionHash);
            // After successful approval, re-check approval status if needed, or simply allow swap
        } else if (isApproveErrorTx) {
            openModal('error', 'Approval Failed', `Error approving ${fromToken.symbol}: ${approvePrepareError?.message || 'Transaction failed.'}`, approveTxData?.transactionHash);
        }
    }, [isApproveLoading, isApproveSuccess, isApproveErrorTx, approvePrepareError, approveTxData]);


    useEffect(() => {
        const checkApproval = async () => {
            if (walletConnected && address && publicClient && fromToken && fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000') {
                try {
                    const tokenContract = new ethers.Contract(fromToken.address, erc20Abi, publicClient); // Use publicClient for read calls
                    const allowance = await tokenContract.allowance(address, uniswapRouter.address);
                    const amountIn = parseUnits(fromValue, fromToken.decimals);
                    setNeedsApproval(allowance < amountIn); // Use < for BigInt comparison
                } catch (error) {
                    console.error("Error checking approval:", error);
                    setNeedsApproval(true); // Assume approval needed on error
                }
            } else {
                setNeedsApproval(false); // No approval needed for native token or if not connected
            }
        };
        checkApproval();
    }, [fromValue, fromToken, walletConnected, address, publicClient, uniswapRouter.address, erc20Abi]);


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
    const amountInBigInt = parseUnits(fromValue, fromToken.decimals);
    const amountOutMinBigInt = parseUnits(toValue, toToken.decimals) * (BigInt(10000) - BigInt(parseFloat(slippage) * 100)) / 10000n; // Use BigInt for calculations
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes from now

    const swapArgs = [{
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        fee: 3000,
        recipient: address,
        deadline: deadline,
        amountIn: amountInBigInt,
        amountOutMinimum: amountOutMinBigInt,
        sqrtPriceLimitX96: 0n // BigInt literal
    }];

    const isEthToToken = fromToken.address === '0x0000000000000000000000000000000000000000';

    const { config: swapConfig, error: swapPrepareError, isError: isSwapPrepareError } = usePrepareWriteContract({
        address: uniswapRouter.address,
        abi: uniswapRouter.abi,
        functionName: 'exactInputSingle',
        args: swapArgs,
        value: isEthToToken ? amountInBigInt : undefined,
        enabled: walletConnected && amountInBigInt > 0n && toValue && !needsApproval, // Removed || !swapping, as wagmi handles loading
    });

    const { data: swapData, writeContract: writeSwap } = useWriteContract(swapConfig);
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

    const estimatedGas = approveConfig.request?.gasLimit || swapConfig.request?.gasLimit ? formatUnits(approveConfig.request?.gasLimit || swapConfig.request?.gasLimit || 0n, 0) : 'N/A'; // Use 0n for BigInt literal


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
                    <span className="text-gray-400 text-sm">Balance: {fromTokenBalance ? formatUnits(fromTokenBalance.value, fromTokenBalance.decimals) : '0.0'} {fromToken.symbol}</span>
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
                    <span className="text-gray-400 text-sm">Balance: {toTokenBalance ? formatUnits(toTokenBalance.value, toTokenBalance.decimals) : '0.0'} {toToken.symbol}</span>
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
                        disabled={isApproveLoading || !writeApprove || amountToApproveBigInt === 0n}
                    >
                        {isApproveLoading ? 'Approving...' : `Approve ${fromToken.symbol}`}
                    </button>
                ) : (
                    <button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        onClick={handleSwap}
                        disabled={isSwapLoading || !writeSwap || amountInBigInt === 0n || !toValue}
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
                explorerUrl="https://sepolia.basescan.org" // Base Sepolia Etherscan URL
            />
        </div>
    );
};

export default SwapCard;