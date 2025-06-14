import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { ChevronDownIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import TxStatusModal from './TxStatusModal';
import { Menu, Transition, Dialog } from '@headlessui/react'; // Add Dialog for modal
import { BASE_SEPOLIA_EXPLORER_URL } from '../utils/uniswap';
import { toast } from 'react-hot-toast'; // Ensure toast is imported

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SwapCard = ({ walletConnected, address, tokens, uniswapRouter, uniswapQuoter, uniswapRouterAbi, erc20Abi, handleConnectWallet }) => {
    const [fromToken, setFromToken] = useState(tokens[0]);
    const [toToken, setToToken] = useState(tokens[1]);
    const [fromValue, setFromValue] = useState('');
    const [toValue, setToValue] = useState('');
    const [priceImpact, setPriceImpact] = useState('0.00');
    const [slippage, setSlippage] = useState('0.5'); // Default slippage
    const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false); // State for token selection modal
    const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false); // State for token selection modal
    const [needsApproval, setNeedsApproval] = useState(false); // Moved needsApproval declaration to the top

    // Modal for transaction status
    const [isTxStatusModalOpen, setIsTxStatusModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalTxHash, setModalTxHash] = useState('');

    const openTxStatusModal = (status, title, message, txHash = '') => {
        setModalStatus(status);
        setModalTitle(title);
        setModalMessage(message);
        setModalTxHash(txHash);
        setIsTxStatusModalOpen(true);
    };

    const closeTxStatusModal = () => {
        setIsTxStatusModalOpen(false);
        setModalStatus('');
        setModalTitle('');
        setModalMessage('');
        setModalTxHash('');
    };

    // Wagmi v2+ clients
    const publicClient = usePublicClient();

    // Fetch balances for selected tokens (for display next to input fields)
    const { data: fromTokenBalanceData } = useBalance({
        address: address,
        token: fromToken.address === '0x0000000000000000000000000000000000000000' ? undefined : fromToken.address,
        query: { enabled: walletConnected && fromToken.address !== '0x0000000000000000000000000000000000000000', watch: true },
    });
    const { data: ethBalanceData } = useBalance({
        address: address,
        query: { enabled: walletConnected && fromToken.address === '0x0000000000000000000000000000000000000000', watch: true },
    });
    const fromTokenBalance = fromToken.address === '0x0000000000000000000000000000000000000000' ? ethBalanceData : fromTokenBalanceData;


    const { data: toTokenBalanceData } = useBalance({
        address: address,
        token: toToken.address === '0x0000000000000000000000000000000000000000' ? undefined : toToken.address,
        query: { enabled: walletConnected && toToken.address !== '0x0000000000000000000000000000000000000000', watch: true },
    });
    const { data: toEthBalanceData } = useBalance({
        address: address,
        query: { enabled: walletConnected && toToken.address === '0x0000000000000000000000000000000000000000', watch: true },
    });
    const toTokenBalance = toToken.address === '0x0000000000000000000000000000000000000000' ? toEthBalanceData : toTokenBalanceData;


    // Fetch balances for ALL tokens in the list for the dropdowns
    const [allTokensBalances, setAllTokensBalances] = useState({});

    const ethBalanceQuery = useBalance({
        address: address,
        query: {
            enabled: walletConnected,
            watch: true,
        },
    });

    const erc20TokenContracts = tokens.filter(token => token.address !== '0x0000000000000000000000000000000000000000').map(token => ({
        address: token.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
    }));

    const { data: erc20BalancesData, isFetching: isFetchingErc20Balances } = useReadContracts({
        contracts: erc20TokenContracts,
        query: {
            enabled: walletConnected && erc20TokenContracts.length > 0,
            watch: true,
            select: (data) => {
                const balancesMap = {};
                tokens.filter(token => token.address !== '0x0000000000000000000000000000000000000000').forEach((token, index) => {
                    const balance = data[index]?.result;
                    if (balance !== undefined) {
                        balancesMap[token.address] = formatUnits(balance, token.decimals);
                    }
                });
                return balancesMap;
            },
        },
    });

    useEffect(() => {
        const newAllTokensBalances = {};
        if (ethBalanceQuery.data) {
            newAllTokensBalances['0x0000000000000000000000000000000000000000'] = formatUnits(ethBalanceQuery.data.value, 18);
        }
        if (erc20BalancesData) {
            Object.assign(newAllTokensBalances, erc20BalancesData);
        }
        setAllTokensBalances(newAllTokensBalances);
    }, [ethBalanceQuery.data, erc20BalancesData]);

    const getQuote = useCallback(async (amountInBigInt, fromToken, toToken) => {
        if (!publicClient || !uniswapQuoter || !fromToken || !toToken || amountInBigInt === 0n) return 0n;

        // If ETH is involved, use WETH for quoting
        const tokenInForQuote = fromToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH').address : fromToken.address;
        const tokenOutForQuote = toToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH').address : toToken.address;

        try {
            const quote = await publicClient.readContract({
                address: uniswapQuoter.address,
                abi: uniswapQuoter.abi,
                functionName: 'quoteExactInputSingle',
                args: [{
                    tokenIn: tokenInForQuote,
                    tokenOut: tokenOutForQuote,
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
    }, [publicClient, uniswapQuoter, tokens]);

    useEffect(() => {
        const fetchQuote = async () => {
            if (fromValue && fromToken && toToken && publicClient) {
                try {
                    const amountInBigInt = parseUnits(fromValue, fromToken.decimals);
                    if (amountInBigInt > 0n) {
                        const quotedAmountOut = await getQuote(amountInBigInt, fromToken, toToken);
                        setToValue(formatUnits(quotedAmountOut, toToken.decimals));
                    } else {
                        setToValue('');
                    }
                } catch (error) {
                    console.error("Error parsing fromValue or getting quote:", error);
                    setToValue(''); // Clear toValue on error
                }
            } else {
                setToValue(''); // Clear toValue if inputs are not ready
            }
        };
        const debounceFetch = setTimeout(() => {
            fetchQuote();
        }, 300); // Debounce quote fetching
        return () => clearTimeout(debounceFetch);
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
        args: [uniswapRouter.address, BigInt(2n**256n - 1n)],
        query: { enabled: walletConnected && amountToApproveBigInt > 0n },
    });
    const { data: approveWriteData, writeContract: writeApprove } = useWriteContract();
    const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveErrorTx, data: approveTxData } = useWaitForTransactionReceipt({ hash: approveWriteData });

    useEffect(() => {
        if (isApproveLoading) {
            openTxStatusModal('loading', 'Approving...', `Approving ${fromToken.symbol} for spending by the router.`);
        } else if (isApproveSuccess) {
            openTxStatusModal('success', 'Approval Successful!', `You have successfully approved ${fromToken.symbol}.`, approveTxData?.transactionHash);
        } else if (isApproveErrorTx) {
            openTxStatusModal('error', 'Approval Failed', `Error approving ${fromToken.symbol}: ${approveSimulateError?.message || 'Transaction failed.'}`, approveTxData?.transactionHash);
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
        const tempFromToken = fromToken;
        const tempToToken = toToken;
        const tempFromValue = fromValue;
        const tempToValue = toValue;

        setFromToken(tempToToken);
        setToToken(tempFromToken);
        setFromValue(tempToValue);
        setToValue(tempFromValue);
    };

    const handleApprove = async () => {
        if (approveSimulateData?.request && writeApprove) {
            writeApprove(approveSimulateData.request);
        } else {
            openTxStatusModal('error', 'Approval Error', 'Could not prepare approval transaction. Check console for details.');
            console.error("Approve function not ready or configuration error:", approveSimulateError);
        }
    };

    const amountInBigInt = fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n;
    const amountOutMinBigInt = toValue ? (parseUnits(toValue, toToken.decimals) * (BigInt(10000) - BigInt(parseFloat(slippage) * 100n))) / 10000n : 0n;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

    const swapArgs = [{
        tokenIn: fromToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH').address : fromToken.address,
        tokenOut: toToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH').address : toToken.address,
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
        query: { enabled: walletConnected && amountInBigInt > 0n && toValue && (!needsApproval || isEthToToken) }, // No approval needed for ETH
    });

    const { data: swapWriteData, writeContract: writeSwap } = useWriteContract();
    const { isLoading: isSwapLoading, isSuccess: isSwapSuccess, isError: isSwapErrorTx, data: swapTxData } = useWaitForTransactionReceipt({ hash: swapWriteData });

    useEffect(() => {
        if (isSwapLoading) {
            openTxStatusModal('loading', 'Swapping...', `Swapping ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`);
        } else if (isSwapSuccess) {
            openTxStatusModal('success', 'Swap Successful!', `Successfully swapped ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`, swapTxData?.transactionHash);
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
            openTxStatusModal('error', 'Swap Failed', `Error swapping: ${swapSimulateError?.message || 'Transaction failed.'}`, swapTxData?.transactionHash);
        }
    }, [isSwapLoading, isSwapSuccess, isSwapErrorTx, swapSimulateError, swapTxData, fromToken.symbol, toToken.symbol, fromValue, toValue]);

    const handleSwap = async () => {
        if (!walletConnected) {
            handleConnectWallet();
            return;
        }

        if (needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000') {
            toast.error(`Please approve ${fromToken.symbol} first.`);
            return;
        }

        if (swapSimulateData?.request && writeSwap) {
            writeSwap(swapSimulateData.request);
        } else {
            openTxStatusModal('error', 'Swap Error', 'Could not prepare swap transaction. Check console for details.');
            console.error("Swap function not ready or configuration error:", swapSimulateError);
        }
    };

    const handleTokenSelect = (token, isFrom) => {
        if (isFrom) {
            setFromToken(token);
            setIsFromTokenModalOpen(false);
        } else {
            setToToken(token);
            setIsToTokenModalOpen(false);
        }
        setFromValue(''); // Clear values on token change
        setToValue('');
    };

    return (
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8 w-full max-w-md mx-auto transform transition-all duration-300 hover:scale-[1.01] glassmorphism-bg">
            <h2 className="text-white text-2xl font-bold text-center mb-6">Trade</h2>

            {/* Sell Section */}
            <div className="mb-4 relative bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="from-token-input" className="text-sm font-medium text-gray-400">Sell</label>
                    {walletConnected && fromTokenBalance && (
                        <span className="text-sm text-gray-400">
                            Balance: {parseFloat(formatUnits(fromTokenBalance.value, fromToken.decimals)).toFixed(4)}
                            <button
                                onClick={() => setFromValue(formatUnits(fromTokenBalance.value, fromToken.decimals))}
                                className="ml-2 px-2 py-1 bg-purple-600/20 text-darknode-neon-purple text-xs rounded-md hover:bg-purple-600/40 transition-colors"
                            >
                                Max
                            </button>
                        </span>
                    )}
                </div>
                <div className="flex items-center">
                    <input
                        id="from-token-input"
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-white text-3xl font-bold focus:outline-none placeholder-gray-600"
                        value={fromValue}
                        onChange={handleFromValueChange}
                    />
                    <button
                        onClick={() => setIsFromTokenModalOpen(true)}
                        className="inline-flex justify-center items-center rounded-xl bg-gray-700 text-white font-bold py-2 px-3 text-lg transition duration-200 hover:bg-gray-600 focus:outline-none"
                    >
                        <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-6 h-6 rounded-full mr-2" />
                        {fromToken.symbol}
                        <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="text-gray-500 text-sm mt-1">$0.00</div> {/* Placeholder for USD value */}
            </div>

            <div className="flex justify-center -my-2">
                <button
                    onClick={handleSwapTokens}
                    className="z-20 p-2 bg-gray-700 rounded-full border-4 border-gray-900 shadow-lg text-darknode-neon-purple hover:text-white hover:bg-darknode-neon-purple transition-all duration-200"
                >
                    <ArrowDownIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Buy Section */}
            <div className="mb-4 relative bg-[#1A1A1A] rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="to-token-input" className="text-sm font-medium text-gray-400">Buy</label>
                    {walletConnected && toTokenBalance && (
                        <span className="text-sm text-gray-400">
                            Balance: {parseFloat(formatUnits(toTokenBalance.value, toToken.decimals)).toFixed(4)}
                            {/* No Max button for 'to' token as it's an output */}
                        </span>
                    )}
                </div>
                <div className="flex items-center">
                    <input
                        id="to-token-input"
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent text-white text-3xl font-bold focus:outline-none placeholder-gray-600"
                        value={toValue}
                        readOnly // Output field
                    />
                    <button
                        onClick={() => setIsToTokenModalOpen(true)}
                        className="inline-flex justify-center items-center rounded-xl bg-purple-600/20 text-darknode-neon-purple font-bold py-2 px-3 text-lg transition duration-200 hover:bg-purple-600/40 focus:outline-none"
                    >
                        {toToken.symbol === 'Select token' ? 'Select token' : (
                            <>
                                <img src={toToken.logoURI} alt={toToken.symbol} className="w-6 h-6 rounded-full mr-2" />
                                {toToken.symbol}
                            </>
                        )}
                        <ChevronDownIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="text-gray-500 text-sm mt-1">$0.00</div> {/* Placeholder for USD value */}
            </div>

            {/* Price Info, Slippage, Fees */}
            <div className="space-y-2 text-sm text-gray-400 mt-6">
                <div className="flex justify-between">
                    <span>Price Impact</span>
                    <span className="text-darknode-neon-purple">{priceImpact}%</span>
                </div>
                <div className="flex justify-between">
                    <span>Slippage Tolerance</span>
                    <div className="flex items-center">
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={slippage}
                            onChange={(e) => setSlippage(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-xs w-20 text-right focus:outline-none focus:border-darknode-neon-purple"
                        />
                        <span className="ml-1">%</span>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span>Liquidity Provider Fee</span>
                    <span>0.30%</span> {/* Uniswap V3 default fee */}
                </div>
                {/* <div className="flex justify-between">
                    <span>Route</span>
                    <span>WETH {'>'} USDC</span>
                </div> */}
            </div>

            {/* Approval Button (only for ERC20 fromToken) */}
            {needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000' && (
                <button
                    onClick={handleApprove}
                    disabled={isApproveLoading || !approveSimulateData?.request}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isApproveLoading ? 'Approving...' : `Approve ${fromToken.symbol}`}
                </button>
            )}

            <button
                onClick={handleSwap}
                disabled={!walletConnected || !fromValue || !toValue || (needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000') || isSwapLoading || !swapSimulateData?.request}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {!walletConnected ? 'Connect Wallet' : isSwapLoading ? 'Swapping...' : 'Swap'}
            </button>

            <TxStatusModal
                isOpen={isTxStatusModalOpen}
                onClose={closeTxStatusModal}
                status={modalStatus}
                title={modalTitle}
                message={modalMessage}
                txHash={modalTxHash}
                explorerUrl={BASE_SEPOLIA_EXPLORER_URL}
            />

            {/* Token Selection Modals */}
            {/* From Token Modal */}
            <Transition appear show={isFromTokenModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsFromTokenModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-75" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-white flex justify-between items-center"
                                    >
                                        Select a token
                                        <button onClick={() => setIsFromTokenModalOpen(false)} className="text-gray-400 hover:text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            placeholder="Search tokens"
                                            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-darknode-neon-purple"
                                        />
                                        {/* Placeholder for popular tokens grid */}
                                        <div className="grid grid-cols-4 gap-2 mt-4">
                                            {tokens.slice(0, 4).map(token => ( // Show first 4 tokens as popular
                                                <button key={token.address} onClick={() => handleTokenSelect(token, true)} className="flex flex-col items-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white text-xs">
                                                    <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full mb-1" />
                                                    {token.symbol}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-6 border-t border-gray-700 pt-4 max-h-60 overflow-y-auto custom-scrollbar">
                                            {tokens.map((token) => (
                                                <button
                                                    key={token.address}
                                                    onClick={() => handleTokenSelect(token, true)}
                                                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-700 transition-colors text-white"
                                                >
                                                    <div className="flex items-center">
                                                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium">{token.name}</p>
                                                            <p className="text-xs text-gray-400">{token.symbol}</p>
                                                        </div>
                                                    </div>
                                                    {walletConnected && allTokensBalances[token.address] && (
                                                        <p className="text-sm text-gray-300">
                                                            {parseFloat(allTokensBalances[token.address]).toFixed(4)}
                                                        </p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* To Token Modal (duplicate structure, can be refactored later if needed) */}
            <Transition appear show={isToTokenModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsToTokenModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-75" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-white flex justify-between items-center"
                                    >
                                        Select a token
                                        <button onClick={() => setIsToTokenModalOpen(false)} className="text-gray-400 hover:text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            placeholder="Search tokens"
                                            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-darknode-neon-purple"
                                        />
                                        {/* Placeholder for popular tokens grid */}
                                        <div className="grid grid-cols-4 gap-2 mt-4">
                                            {tokens.slice(0, 4).map(token => ( // Show first 4 tokens as popular
                                                <button key={token.address} onClick={() => handleTokenSelect(token, false)} className="flex flex-col items-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white text-xs">
                                                    <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full mb-1" />
                                                    {token.symbol}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-6 border-t border-gray-700 pt-4 max-h-60 overflow-y-auto custom-scrollbar">
                                            {tokens.map((token) => (
                                                <button
                                                    key={token.address}
                                                    onClick={() => handleTokenSelect(token, false)}
                                                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-700 transition-colors text-white"
                                                >
                                                    <div className="flex items-center">
                                                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium">{token.name}</p>
                                                            <p className="text-xs text-gray-400">{token.symbol}</p>
                                                        </div>
                                                    </div>
                                                    {walletConnected && allTokensBalances[token.address] && (
                                                        <p className="text-sm text-gray-300">
                                                            {parseFloat(allTokensBalances[token.address]).toFixed(4)}
                                                        </p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default SwapCard;