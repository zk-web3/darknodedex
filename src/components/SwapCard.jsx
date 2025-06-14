import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { ChevronDownIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TxStatusModal from './TxStatusModal';
import { Menu } from '@headlessui/react';
import { Transition } from '@headlessui/react';
import { BASE_SEPOLIA_EXPLORER_URL } from '../utils/uniswap';

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
        args: [uniswapRouter.address, BigInt(2n**256n - 1n)],
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-darknode-bg font-rajdhani">
            <div className="w-full max-w-md p-6 bg-darknode-container rounded-lg shadow-glass-neumorphic border border-darknode-border-neon">
                <h2 className="text-white text-2xl font-bold text-center mb-6">Swap</h2>

                <div className="mb-4 relative">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="from-token-input" className="text-sm font-medium text-gray-400">You sell</label>
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
                            placeholder="0.0"
                            className="w-full p-2 bg-transparent text-white text-xl font-bold focus:outline-none"
                            value={fromValue}
                            onChange={handleFromValueChange}
                        />
                        {/* From Token Select */}
                        <Menu as="div" className="relative inline-block text-left z-10">
                            <div>
                                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-darknode-neon-purple">
                                    <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-6 h-6 rounded-full mr-2" />
                                    {fromToken.symbol}
                                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                                </Menu.Button>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="py-1">
                                        {tokens.map((token) => (
                                            <Menu.Item key={token.address}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setFromToken(token)}
                                                        className={classNames(
                                                            active ? 'bg-gray-600 text-white' : 'text-gray-200',
                                                            'flex items-center px-4 py-2 text-sm w-full text-left'
                                                        )}
                                                    >
                                                        <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full mr-2" />
                                                        {token.symbol}
                                                        <p className="ml-auto text-gray-400 text-xs">
                                                            Balance: {fromTokenBalance && token.address === fromToken.address ? parseFloat(formatUnits(fromTokenBalance.value, fromToken.decimals)).toFixed(4) : '0.0000'}
                                                        </p>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        ))}
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>

                <div className="flex justify-center -my-2">
                    <button
                        onClick={handleSwapTokens}
                        className="z-20 p-2 bg-gray-700 rounded-full border-4 border-gray-900 shadow-lg text-darknode-neon-purple hover:text-white hover:bg-darknode-neon-purple transition-all duration-200"
                    >
                        <ArrowDownIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4 relative">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="to-token-input" className="text-sm font-medium text-gray-400">You buy</label>
                        {walletConnected && toTokenBalance && (
                            <span className="text-sm text-gray-400">
                                Balance: {parseFloat(formatUnits(toTokenBalance.value, toToken.decimals)).toFixed(4)}
                                <button 
                                    onClick={() => setToValue(formatUnits(toTokenBalance.value, toToken.decimals))}
                                    className="ml-2 px-2 py-1 bg-purple-600/20 text-darknode-neon-purple text-xs rounded-md hover:bg-purple-600/40 transition-colors"
                                >
                                    Max
                                </button>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center">
                        <input
                            id="to-token-input"
                            type="number"
                            placeholder="0.0"
                            className="w-full p-2 bg-transparent text-white text-xl font-bold focus:outline-none"
                            value={toValue}
                            readOnly // Output field
                        />
                        {/* To Token Select */}
                        <Menu as="div" className="relative inline-block text-left z-10">
                            <div>
                                <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-darknode-neon-purple">
                                    <img src={toToken.logoURI} alt={toToken.symbol} className="w-6 h-6 rounded-full mr-2" />
                                    {toToken.symbol}
                                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                                </Menu.Button>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="py-1">
                                        {tokens.map((token) => (
                                            <Menu.Item key={token.address}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setToToken(token)}
                                                        className={classNames(
                                                            active ? 'bg-gray-600 text-white' : 'text-gray-200',
                                                            'flex items-center px-4 py-2 text-sm w-full text-left'
                                                        )}
                                                    >
                                                        <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full mr-2" />
                                                        {token.symbol}
                                                        <p className="ml-auto text-gray-400 text-xs">
                                                            Balance: {toTokenBalance && token.address === toToken.address ? parseFloat(formatUnits(toTokenBalance.value, toToken.decimals)).toFixed(4) : '0.0000'}
                                                        </p>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        ))}
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>

                {walletConnected ? (
                    needsApproval ? (
                        <button
                            onClick={handleApprove}
                            disabled={!approveSimulateData?.request}
                            className="w-full bg-darknode-neon-purple hover:bg-darknode-neon-cyan text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        >
                            Approve {fromToken.symbol}
                        </button>
                    ) : (
                        <button
                            onClick={handleSwap}
                            disabled={!swapSimulateData?.request || parseFloat(fromValue) === 0}
                            className="w-full bg-darknode-neon-purple hover:bg-darknode-neon-cyan text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        >
                            Swap
                        </button>
                    )
                ) : (
                    <button
                        onClick={handleConnectWallet}
                        className="w-full bg-darknode-button-connect text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                    >
                        Connect Wallet
                    </button>
                )}

                <TxStatusModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    status={modalStatus}
                    title={modalTitle}
                    message={modalMessage}
                    txHash={modalTxHash}
                    explorerUrl={BASE_SEPOLIA_EXPLORER_URL}
                />
            </div>
        </div>
    );
};

export default SwapCard;