import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { ChevronDownIcon, ArrowDownIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import TxStatusModal from './TxStatusModal';
import { Dialog, Transition } from '@headlessui/react';
import { BASE_SEPOLIA_EXPLORER_URL } from '../utils/uniswap';
import { toast } from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const dummyTokens = [
    { name: "Ethereum", symbol: "ETH", address: "0x0000000000000000000000000000000000000000", logo: "/path/to/eth.svg" },
    { name: "Wrapped Ethereum", symbol: "WETH", address: "0x...WETH", logo: "/path/to/weth.svg" },
    { name: "USD Coin", symbol: "USDC", address: "0x...USDC", logo: "/path/to/usdc.svg" },
    { name: "Dai Stablecoin", symbol: "DAI", address: "0x...DAI", logo: "/path/to/dai.svg" },
    { name: "DarkNode Token", symbol: "DN", address: "0x...DN", logo: "/path/to/dn.svg" },
];

const SwapCard = ({ walletConnected, address, tokens, uniswapRouter, uniswapQuoter, uniswapRouterAbi, erc20Abi, handleConnectWallet }) => {
    const initialFromToken = tokens && tokens.length > 0 ? tokens[0] : { name: "Ethereum", symbol: "ETH", address: "0x0000000000000000000000000000000000000000", logo: "/eth.svg", decimals: 18 };
    const initialToToken = tokens && tokens.length > 1 ? tokens[1] : { name: "Select Token", symbol: "Select Token", address: "", logo: "", decimals: 18 };

    const [fromToken, setFromToken] = useState(initialFromToken);
    const [toToken, setToToken] = useState(initialToToken);
    const [fromValue, setFromValue] = useState('0');
    const [toValue, setToValue] = useState('0');
    const [priceImpact, setPriceImpact] = useState('0.00');
    const [slippage, setSlippage] = useState('0.5');
    const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
    const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
    const [needsApproval, setNeedsApproval] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const publicClient = usePublicClient();

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
                    setToValue('');
                }
            } else {
                setToValue('');
            }
        };
        const debounceFetch = setTimeout(() => {
            fetchQuote();
        }, 300);
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
    const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveErrorTx, data: approveTxData } = useWaitForTransactionReceipt({ hash: approveWriteData?.hash });

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
    }, [checkApproval, fromValue, fromToken, address]);

    const handleFromValueChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setFromValue(value);
        }
    };

    const handleMaxClick = () => {
        if (fromTokenBalance && fromTokenBalance.value) {
            setFromValue(formatUnits(fromTokenBalance.value, fromToken.decimals));
        }
    };

    const handleSwapTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromValue(toValue);
        setToValue(fromValue);
    };

    const handleApprove = async () => {
        if (!walletConnected) {
            toast.error('Please connect your wallet to approve tokens.');
            handleConnectWallet();
            return;
        }
        if (!approveSimulateData?.request) {
            toast.error('Unable to prepare approval transaction.');
            console.error("No approval request data:", approveSimulateData, approveSimulateError);
            return;
        }

        try {
            openTxStatusModal('loading', 'Approving Token...', `Please confirm the approval transaction for ${fromToken.symbol} in your wallet.`);
            writeApprove(approveSimulateData.request);
        } catch (error) {
            console.error("Approval transaction failed:", error);
            openTxStatusModal('error', 'Approval Failed', `Error initiating approval: ${error.message || 'Transaction rejected or failed.'}`);
        }
    };

    const amountOutMin = toValue ? parseUnits(toValue, toToken.decimals) * (100n - parseUnits(slippage, 0)) / 100n : 0n;

    const { data: swapSimulateData, error: swapSimulateError } = useSimulateContract({
        address: uniswapRouter.address,
        abi: uniswapRouter.abi,
        functionName: fromToken.address === '0x0000000000000000000000000000000000000000' ? 'exactInputSingle' : 'exactInputSingle',
        args: fromToken.address === '0x0000000000000000000000000000000000000000' ? [{
            tokenIn: tokens.find(t => t.symbol === 'WETH').address,
            tokenOut: toToken.address,
            amountIn: fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n,
            amountOutMinimum: amountOutMin,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
            sqrtPriceLimitX96: 0n,
        }] : [{
            tokenIn: fromToken.address,
            tokenOut: toToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH').address : toToken.address,
            amountIn: fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n,
            amountOutMinimum: amountOutMin,
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
            sqrtPriceLimitX96: 0n,
        }],
        value: fromToken.address === '0x0000000000000000000000000000000000000000' && fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n,
        query: {
            enabled: walletConnected && fromValue && toValue && parseUnits(fromValue, fromToken.decimals) > 0n && !needsApproval,
        },
    });

    const { data: swapWriteData, writeContract: writeSwap } = useWriteContract();
    const { isLoading: isSwapLoading, isSuccess: isSwapSuccess, isError: isSwapErrorTx, data: swapTxData } = useWaitForTransactionReceipt({ hash: swapWriteData?.hash });

    useEffect(() => {
        if (isSwapLoading) {
            openTxStatusModal('loading', 'Confirming Swap...', `Swapping ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`);
        } else if (isSwapSuccess) {
            openTxStatusModal('success', 'Swap Successful!', `Successfully swapped ${fromValue} ${fromToken.symbol} for ${toValue} ${toToken.symbol}.`, swapTxData?.transactionHash);
            setFromValue('');
            setToValue('');
        } else if (isSwapErrorTx) {
            openTxStatusModal('error', 'Swap Failed', `Error during swap: ${swapSimulateError?.message || 'Transaction failed.'}`, swapTxData?.transactionHash);
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
            toast.error('Unable to prepare swap transaction.');
            console.error("No swap request data:", swapSimulateData, swapSimulateError);
            return;
        }

        try {
            openTxStatusModal('loading', 'Confirming Swap...', `Please confirm the swap transaction in your wallet.`);
            writeSwap(swapSimulateData.request);
        } catch (error) {
            console.error("Swap transaction failed:", error);
            openTxStatusModal('error', 'Swap Failed', `Error initiating swap: ${error.message || 'Transaction rejected or failed.'}`);
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
        setSearchQuery('');
        setFromValue('');
        setToValue('');
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
            <div className="flex justify-between items-center mb-6">
                <div className="flex bg-zinc-800 rounded-full p-1 border border-zinc-700">
                    <button className="px-4 py-2 rounded-full bg-fuchsia-600 text-white font-bold text-sm shadow-md">Swap</button>
                    <button className="px-4 py-2 rounded-full text-gray-400 text-sm hover:text-white transition-colors">Limit</button>
                    <button className="px-4 py-2 rounded-full text-gray-400 text-sm hover:text-white transition-colors">Buy</button>
                    <button className="px-4 py-2 rounded-full text-gray-400 text-sm hover:text-white transition-colors">Sell</button>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors"><Cog6ToothIcon className="h-6 w-6" /></button>
            </div>

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
                        <button
                            onClick={handleMaxClick}
                            className="mr-2 px-3 py-1 bg-zinc-700 text-white text-xs font-semibold rounded-lg hover:bg-zinc-600 transition-colors duration-200"
                        >
                            MAX
                        </button>
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
                <div className="text-gray-500 text-sm mt-1">$0</div>
            </div>

            <div className="flex justify-center -my-2 z-10 relative">
                <button
                    className="p-2 bg-zinc-700 rounded-full border-4 border-zinc-900 text-white shadow-lg hover:bg-zinc-600 transition-colors duration-200 transform hover:rotate-180"
                    onClick={handleSwapTokens}
                >
                    <ArrowDownIcon className="w-6 h-6" />
                </button>
            </div>

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
                <div className="text-gray-500 text-sm mt-1">$0</div>
            </div>

            <div className="text-sm text-gray-400 space-y-2 mb-6">
                <div className="flex justify-between">
                    <span>Price Impact</span>
                    <span className={classNames(
                        parseFloat(priceImpact) > 5 ? 'text-red-500' : 'text-green-400',
                        'font-semibold'
                    )}>{priceImpact}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Slippage Tolerance</span>
                    <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={slippage}
                        onChange={(e) => setSlippage(e.target.value)}
                        className="bg-gray-800 text-white rounded-md px-2 py-1 w-20 text-right focus:outline-none focus:ring-2 focus:ring-fuchsia-500 border border-gray-600"
                    />%
                </div>
                <div className="flex justify-between">
                    <span>Route</span>
                    <span className="text-white font-semibold">WETH {'>'} USDC</span>
                </div>
                <div className="flex justify-between">
                    <span>Liquidity Provider Fee</span>
                    <span className="text-white font-semibold">0.3%</span>
                </div>
            </div>

            {!walletConnected ? (
                <button
                    onClick={handleConnectWallet}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xl font-bold hover:from-fuchsia-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-fuchsia-500/50 hover:shadow-fuchsia-500/70 font-['Orbitron']"
                >
                    Connect wallet
                </button>
            ) : needsApproval ? (
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

            <TxStatusModal
                isOpen={isTxStatusModalOpen}
                onClose={closeTxStatusModal}
                status={modalStatus}
                title={modalTitle}
                message={modalMessage}
                txHash={modalTxHash}
                explorerUrl={BASE_SEPOLIA_EXPLORER_URL}
            />
        </div>
    );
};

export default SwapCard;