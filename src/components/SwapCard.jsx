import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { ChevronDownIcon, ArrowDownIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import TxStatusModal from './TxStatusModal'; // Assuming TxStatusModal is still in ./TxStatusModal
import { Dialog, Transition } from '@headlessui/react';
import { BASE_SEPOLIA_EXPLORER_URL } from '../utils/uniswap'; // Assuming this correctly imports your explorer URL
import { toast } from 'react-hot-toast'; // Assuming toast is configured in your project

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SwapCard = ({ walletConnected, address, tokens, uniswapRouter, uniswapQuoter, uniswapRouterAbi, erc20Abi, handleConnectWallet }) => {
    // Ensure tokens prop is available and has at least two tokens for initial state
    const initialFromToken = tokens && tokens.length > 0 ? tokens[0] : { name: "Ethereum", symbol: "ETH", address: "0x0000000000000000000000000000000000000000", logo: "/eth.svg", decimals: 18 };
    const initialToToken = tokens && tokens.length > 1 ? tokens[1] : { name: "Select Token", symbol: "Select Token", address: "", logo: "", decimals: 18 };

    const [fromToken, setFromToken] = useState(initialFromToken);
    const [toToken, setToToken] = useState(initialToToken);
    const [fromValue, setFromValue] = useState('0'); // Initial state as '0' to match screenshot
    const [toValue, setToValue] = useState('0');     // Initial state as '0' to match screenshot
    const [priceImpact, setPriceImpact] = useState('0.00');
    const [slippage, setSlippage] = useState('0.5'); // Default slippage
    const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
    const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
    const [needsApproval, setNeedsApproval] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Ensure tokens passed to useReadContracts are ERC20s (not native ETH)
    const erc20TokenContracts = tokens.filter(token => token.address && token.address !== '0x0000000000000000000000000000000000000000').map(token => ({
        address: token.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
    }));

    const { data: erc20BalancesData } = useReadContracts({
        contracts: erc20TokenContracts,
        query: {
            enabled: walletConnected && erc20TokenContracts.length > 0,
            watch: true,
            select: (data) => {
                const balancesMap = {};
                // Map results back to original tokens list
                tokens.filter(token => token.address && token.address !== '0x0000000000000000000000000000000000000000').forEach((token, index) => {
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

    const getQuote = useCallback(async (amountInBigInt, currentFromToken, currentToToken) => {
        if (!publicClient || !uniswapQuoter || !currentFromToken || !currentToToken || amountInBigInt === 0n) return 0n;

        // If ETH is involved, use WETH for quoting
        const tokenInForQuote = currentFromToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH')?.address : currentFromToken.address;
        const tokenOutForQuote = currentToToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH')?.address : currentToToken.address;

        if (!tokenInForQuote || !tokenOutForQuote) {
            console.error("WETH address not found in tokens for quoting.");
            return 0n;
        }

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
            toast.error("Error getting quote: " + (error.shortMessage || error.message));
            return 0n;
        }
    }, [publicClient, uniswapQuoter, tokens]);

    useEffect(() => {
        const fetchQuote = async () => {
            if (fromValue && fromToken && toToken && publicClient && fromValue !== '0' && fromValue !== '') {
                try {
                    const amountInBigInt = parseUnits(fromValue, fromToken.decimals);
                    if (amountInBigInt > 0n) {
                        const quotedAmountOut = await getQuote(amountInBigInt, fromToken, toToken);
                        setToValue(formatUnits(quotedAmountOut, toToken.decimals));
                    } else {
                        setToValue('0');
                    }
                } catch (error) {
                    console.error("Error parsing fromValue or getting quote:", error);
                    setToValue('0'); // Clear toValue on error
                }
            } else {
                setToValue('0'); // Clear toValue if inputs are not ready or fromValue is 0
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
        args: [uniswapRouter.address, BigInt(2n**256n - 1n)], // Approving max amount
        query: { enabled: walletConnected && amountToApproveBigInt > 0n && fromToken.address !== '0x0000000000000000000000000000000000000000' },
    });
    const { data: approveWriteData, writeContract: writeApprove } = useWriteContract();
    const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveErrorTx, data: approveTxData } = useWaitForTransactionReceipt({ hash: approveWriteData?.hash });

    useEffect(() => {
        if (isApproveLoading) {
            openTxStatusModal('loading', 'Approving...', `Approving ${fromToken.symbol} for spending by the router.`);
        } else if (isApproveSuccess) {
            openTxStatusModal('success', 'Approval Successful!', `You have successfully approved ${fromToken.symbol}.`, approveTxData?.transactionHash);
            checkApproval(); // Re-check approval after successful approval
        } else if (isApproveErrorTx) {
            openTxStatusModal('error', 'Approval Failed', `Error approving ${fromToken.symbol}: ${approveSimulateError?.shortMessage || approveSimulateError?.message || 'Transaction failed.'}`, approveTxData?.transactionHash);
        }
    }, [isApproveLoading, isApproveSuccess, isApproveErrorTx, approveSimulateError, approveTxData, fromToken.symbol, checkApproval]);


    const checkApproval = useCallback(async () => {
        if (walletConnected && address && publicClient && fromToken && fromValue && fromToken.address !== '0x0000000000000000000000000000000000000000') {
            try {
                const allowance = await publicClient.readContract({
                    address: fromToken.address,
                    abi: erc20Abi,
                    functionName: 'allowance',
                    args: [address, uniswapRouter.address],
                });
                const amountIn = parseUnits(fromValue || '0', fromToken.decimals); // Handle empty fromValue
                setNeedsApproval(allowance < amountIn);
            } catch (error) {
                console.error("Error checking approval:", error);
                setNeedsApproval(true); // Assume approval is needed on error
            }
        } else {
            setNeedsApproval(false); // No approval needed for ETH or if not connected/no value
        }
    }, [walletConnected, address, publicClient, fromToken, fromValue, uniswapRouter.address, erc20Abi]);

    useEffect(() => {
        checkApproval();
    }, [checkApproval, fromValue, fromToken, address]); // Re-check approval when inputs/tokens/address change

    const handleFromValueChange = (e) => {
        const value = e.target.value;
        // Allow empty string to clear input, or numbers with optional single decimal
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFromValue(value);
        }
    };

    const handleMaxClick = () => {
        if (fromTokenBalance && fromTokenBalance.value) {
            setFromValue(formatUnits(fromTokenBalance.value, fromToken.decimals));
        }
    };

    const handleSwapTokens = () => {
        // Swap tokens and their values
        const tempFromToken = fromToken;
        const tempToToken = toToken;
        const tempFromValue = fromValue;
        const tempToValue = toValue;

        setFromToken(tempToToken);
        setToToken(tempFromToken);
        setFromValue(tempToValue);
        setToValue(tempFromValue);
        setSearchQuery(''); // Clear search query
    };

    const handleApprove = async () => {
        if (!walletConnected) {
            toast.error('Please connect your wallet to approve tokens.');
            handleConnectWallet();
            return;
        }
        if (!approveSimulateData?.request) {
            toast.error('Unable to prepare approval transaction. Check console for details.');
            console.error("No approval request data:", approveSimulateData, approveSimulateError);
            return;
        }

        try {
            openTxStatusModal('loading', 'Approving Token...', `Please confirm the approval transaction for ${fromToken.symbol} in your wallet.`);
            writeApprove(approveSimulateData.request);
        } catch (error) {
            console.error("Approval transaction failed:", error);
            openTxStatusModal('error', 'Approval Failed', `Error initiating approval: ${error.shortMessage || error.message || 'Transaction rejected or failed.'}`);
        }
    };

    // Calculate minimum amount out with slippage
    const amountOutMin = toValue ? parseUnits(toValue, toToken.decimals) * (100n - parseUnits(slippage, 0)) / 100n : 0n;

    const { data: swapSimulateData, error: swapSimulateError } = useSimulateContract({
        address: uniswapRouter.address,
        abi: uniswapRouter.abi,
        functionName: fromToken.address === '0x0000000000000000000000000000000000000000' ? 'exactInputSingle' : 'exactInputSingle',
        args: fromToken.address === '0x0000000000000000000000000000000000000000' ? [{ // ETH -> Token
            tokenIn: tokens.find(t => t.symbol === 'WETH')?.address, // Use WETH for ETH swaps
            tokenOut: toToken.address,
            amountIn: fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n,
            amountOutMinimum: amountOutMin,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes from now
            sqrtPriceLimitX96: 0n,
        }] : [{ // Token -> ETH or Token -> Token
            tokenIn: fromToken.address,
            tokenOut: toToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH')?.address : toToken.address, // Convert to WETH for ETH out
            amountIn: fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n,
            amountOutMinimum: amountOutMin,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes from now
            sqrtPriceLimitX96: 0n,
        }],
        value: fromToken.address === '0x0000000000000000000000000000000000000000' && fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n, // ETH value for swap
        query: {
            enabled: walletConnected && fromValue && toValue && parseUnits(fromValue, fromToken.decimals) > 0n && !needsApproval && fromToken.address && toToken.address,
        },
    });

    const { data: swapWriteData, writeContract: writeSwap } = useWriteContract();
    const { isLoading: isSwapLoading, isSuccess: isSwapSuccess, isError: isSwapErrorTx, data: swapTxData } = useWaitForTransactionReceipt({ hash: swapWriteData?.hash });

    useEffect(() => {
        if (isSwapLoading) {
            openTxStatusModal('loading', 'Confirming Swap...', `Swapping ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`);
        } else if (isSwapSuccess) {
            openTxStatusModal('success', 'Swap Successful!', `Successfully swapped ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`, swapTxData?.transactionHash);
            setFromValue('0');
            setToValue('0');
        } else if (isSwapErrorTx) {
            openTxStatusModal('error', 'Swap Failed', `Error during swap: ${swapSimulateError?.shortMessage || swapSimulateError?.message || 'Transaction failed.'}`, swapTxData?.transactionHash);
        }
    }, [isSwapLoading, isSwapSuccess, isSwapErrorTx, swapSimulateError, swapTxData, fromValue, fromToken, toValue, toToken]);


    const handleSwap = async () => {
        if (!walletConnected) {
            toast.error('Please connect your wallet to swap.');
            handleConnectWallet();
            return;
        }

        if (needsApproval) {
            toast.error(`Please approve ${fromToken.symbol} first.`);
            return;
        }

        if (!swapSimulateData?.request) {
            toast.error('Unable to prepare swap transaction. Check console for details.');
            console.error("No swap request data:", swapSimulateData, swapSimulateError);
            return;
        }

        try {
            openTxStatusModal('loading', 'Confirming Swap...', `Please confirm the swap transaction in your wallet.`);
            writeSwap(swapSimulateData.request);
        } catch (error) {
            console.error("Swap transaction failed:", error);
            openTxStatusModal('error', 'Swap Failed', `Error initiating swap: ${error.shortMessage || error.message || 'Transaction rejected or failed.'}`);
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
        setSearchQuery(''); // Clear search query when a token is selected
        setFromValue('0'); // Clear values on token change to re-quote
        setToValue('0');
    };

    const renderTokenList = (isFrom) => {
        const filteredTokens = tokens.filter(token =>
            token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <>
                <input
                    type="text"
                    placeholder="Search name or paste address"
                    className="w-full p-3 mb-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 border border-gray-600 font-['Exo']"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {filteredTokens.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                            {filteredTokens.map((token) => (
                                <button
                                    key={token.symbol}
                                    className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-colors duration-200"
                                    onClick={() => handleTokenSelect(token, isFrom)}
                                >
                                    <img src={token.logo} alt={token.symbol} className="w-9 h-9 mr-3 rounded-full" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-white text-lg font-semibold">{token.symbol}</span>
                                        <span className="text-gray-400 text-sm">{token.name}</span>
                                        {walletConnected && allTokensBalances[token.address] !== undefined && (
                                            <span className="text-gray-400 text-xs">
                                                Balance: {parseFloat(allTokensBalances[token.address]).toFixed(4)}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">No tokens found.</p>
                    )}
                </div>
            </>
        );
    };

    return (
        <div className="bg-zinc-900/80 p-6 rounded-2xl shadow-xl border border-zinc-700 max-w-md mx-auto my-10 backdrop-filter backdrop-blur-lg font-['Exo']">
            {/* Top Tabs and Settings */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-zinc-800 rounded-full p-1 border border-zinc-700">
                    <button className="px-4 py-2 rounded-full bg-fuchsia-600 text-white font-bold text-sm shadow-md">Swap</button>
                    <button className="px-4 py-2 rounded-full text-gray-400 text-sm hover:text-white transition-colors">Limit</button>
                    <button className="px-4 py-2 rounded-full text-gray-400 text-sm hover:text-white transition-colors">Buy</button>
                    <button className="px-4 py-2 rounded-full text-gray-400 text-sm hover:text-white transition-colors">Sell</button>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors"><Cog6ToothIcon className="h-6 w-6" /></button>
            </div>

            {/* Sell Panel */}
            <div className="mb-4 bg-zinc-800 rounded-2xl p-4 border border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="fromAmount" className="text-sm font-medium text-gray-400">Sell</label>
                    {walletConnected && fromTokenBalance && (
                        <span className="text-sm text-gray-400">Balance: {parseFloat(formatUnits(fromTokenBalance.value, fromToken.decimals)).toFixed(6)}</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        id="fromAmount"
                        placeholder="0"
                        className="flex-grow bg-transparent text-white text-4xl font-bold focus:outline-none placeholder-gray-500 font-['Orbitron']"
                        value={fromValue}
                        onChange={handleFromValueChange}
                    />
                    <div className="flex items-center">
                        {walletConnected && fromTokenBalance && fromTokenBalance.value > 0n && (
                            <button
                                onClick={handleMaxClick}
                                className="mr-2 px-3 py-1 bg-zinc-700 text-white text-xs font-semibold rounded-lg hover:bg-zinc-600 transition-colors duration-200"
                            >
                                MAX
                            </button>
                        )}
                        <button
                            className="flex items-center bg-zinc-700 hover:bg-zinc-600 rounded-full px-3 py-2 text-white text-lg font-bold transition-colors duration-200"
                            onClick={() => setIsFromTokenModalOpen(true)}
                        >
                            <img src={fromToken.logo} alt={fromToken.symbol} className="w-7 h-7 mr-2" />
                            {fromToken.symbol}
                            <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" />
                        </button>
                    </div>
                </div>
                <div className="text-gray-500 text-sm mt-1">$0</div> {/* Assuming $0 as placeholder for USD value */}
            </div>

            {/* Swap Arrow Button */}
            <div className="flex justify-center -my-2 z-10 relative">
                <button
                    className="p-2 bg-zinc-700 rounded-full border-4 border-zinc-900 text-white shadow-lg hover:bg-zinc-600 transition-colors duration-200 transform hover:rotate-180"
                    onClick={handleSwapTokens}
                >
                    <ArrowDownIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Buy Panel */}
            <div className="mb-6 bg-zinc-800 rounded-2xl p-4 border border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="toAmount" className="text-sm font-medium text-gray-400">Buy</label>
                    {walletConnected && toTokenBalance && (
                        <span className="text-sm text-gray-400">Balance: {parseFloat(formatUnits(toTokenBalance.value, toToken.decimals)).toFixed(6)}</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <input
                        type="text"
                        id="toAmount"
                        placeholder="0"
                        className="flex-grow bg-transparent text-white text-4xl font-bold focus:outline-none placeholder-gray-500 font-['Orbitron']"
                        value={toValue}
                        readOnly
                    />
                    <button
                        className="flex items-center bg-fuchsia-600 hover:bg-fuchsia-700 rounded-full px-3 py-2 text-white text-lg font-bold transition-colors duration-200 shadow-fuchsia-500/50 hover:shadow-fuchsia-500/70"
                        onClick={() => setIsToTokenModalOpen(true)}
                    >
                        {toToken.symbol === 'Select Token' ? 'Select token' : <img src={toToken.logo} alt={toToken.symbol} className="w-7 h-7 mr-2" />}
                        {toToken.symbol === 'Select Token' ? '' : toToken.symbol}
                        <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" />
                    </button>
                </div>
                <div className="text-gray-500 text-sm mt-1">$0</div> {/* Assuming $0 as placeholder for USD value */}
            </div>

            {/* Connect Wallet / Swap Button (with conditional rendering for Approve/Swap) */}
            {!walletConnected ? (
                <button
                    onClick={handleConnectWallet}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xl font-bold hover:from-fuchsia-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-fuchsia-500/50 hover:shadow-fuchsia-500/70 font-['Orbitron']"
                >
                    Connect wallet
                </button>
            ) : needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000' ? (
                <button
                    onClick={handleApprove}
                    disabled={isApproveLoading || !approveSimulateData?.request}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xl font-bold hover:from-fuchsia-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/50 hover:shadow-fuchsia-500/70 font-['Orbitron']"
                >
                    {isApproveLoading ? 'Approving...' : `Approve ${fromToken.symbol}`}
                </button>
            ) : (
                <button
                    onClick={handleSwap}
                    disabled={isSwapLoading || !swapSimulateData?.request || parseFloat(fromValue) === 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xl font-bold hover:from-fuchsia-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/50 hover:shadow-fuchsia-500/70 font-['Orbitron']"
                >
                    {isSwapLoading ? 'Swapping...' : 'Swap'}
                </button>
            )}

            {/* Transaction Status Modal (Assuming this component exists) */}
            {isTxStatusModalOpen && (
                <TxStatusModal
                    isOpen={isTxStatusModalOpen}
                    onClose={closeTxStatusModal}
                    status={modalStatus}
                    title={modalTitle}
                    message={modalMessage}
                    txHash={modalTxHash}
                    explorerUrl={BASE_SEPOLIA_EXPLORER_URL}
                />
            )}

            {/* From Token Selection Modal */}
            <Transition appear show={isFromTokenModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 font-['Exo']" onClose={() => setIsFromTokenModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 p-6 text-left align-middle shadow-xl transition-all backdrop-filter backdrop-blur-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-white font-['Orbitron']">
                                            Select a token
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-white transition-colors"
                                            onClick={() => setIsFromTokenModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        {renderTokenList(true)}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* To Token Selection Modal */}
            <Transition appear show={isToTokenModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 font-['Exo']" onClose={() => setIsToTokenModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-700 p-6 text-left align-middle shadow-xl transition-all backdrop-filter backdrop-blur-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-white font-['Orbitron']">
                                            Select a token
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-white transition-colors"
                                            onClick={() => setIsToTokenModalOpen(false)}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        {renderTokenList(false)}
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