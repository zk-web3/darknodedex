import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { ChevronDownIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { ethers } from 'ethers';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import TxStatusModal from './TxStatusModal';
import { Menu } from '@headlessui/react';
import { Transition } from '@headlessui/react';
import { BASE_SEPOLIA_EXPLORER_URL } from '../utils/uniswap';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-darknode-bg font-rajdhani">
            <div className="w-full max-w-md p-6 bg-darknode-container rounded-lg shadow-glass-neumorphic border border-darknode-border-neon">
                <h2 className="text-white text-2xl font-bold text-center mb-6">Swap</h2>

                <div className="relative mb-4 bg-darknode-alt-container rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="from-token-input" className="text-gray-400 text-sm">Sell</label>
                        <span className="text-gray-400 text-sm">Balance: {fromTokenBalance ? parseFloat(formatUnits(fromTokenBalance.value, fromTokenBalance.decimals)).toFixed(4) : '0.0000'} {fromToken.symbol}</span>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="from-token-input"
                            type="number"
                            placeholder="0.0"
                            value={fromValue}
                            onChange={handleFromValueChange}
                            className="w-full text-3xl font-bold bg-transparent text-white focus:outline-none placeholder-gray-600"
                        />
                        <Menu as="div" className="relative ml-3">
                            <div>
                                <Menu.Button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-xl text-lg transition duration-200 focus:outline-none">
                                    <img src="/path/to/placeholder-eth-icon.svg" alt="ETH" className="h-5 w-5 rounded-full" />{fromToken.symbol} <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
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
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {tokens.map((token) => (
                                        <Menu.Item key={token.symbol}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => { setFromToken(token); setToValue(''); }}
                                                    className={classNames(
                                                        active ? 'bg-gray-700 text-white' : 'text-gray-300',
                                                        'block w-full text-left px-4 py-2 text-sm'
                                                    )}
                                                >
                                                    {token.symbol}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">$0.00</div>
                </div>

                <div className="flex justify-center my-2">
                    <button
                        onClick={handleSwapTokens}
                        className="p-2 rounded-full bg-darknode-alt-container hover:bg-gray-700 text-darknode-neon-cyan focus:outline-none"
                    >
                        <ArrowDownIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative mb-4 bg-darknode-alt-container rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="to-token-input" className="text-gray-400 text-sm">Buy</label>
                        <span className="text-gray-400 text-sm">Balance: {toTokenBalance ? parseFloat(formatUnits(toTokenBalance.value, toTokenBalance.decimals)).toFixed(4) : '0.0000'} {toToken.symbol}</span>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="to-token-input"
                            type="text"
                            placeholder="0.0"
                            value={toValue}
                            readOnly
                            className="w-full text-3xl font-bold bg-transparent text-white focus:outline-none placeholder-gray-600"
                        />
                        <Menu as="div" className="relative ml-3">
                            <div>
                                <Menu.Button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-xl text-lg transition duration-200 focus:outline-none">
                                    <img src="/path/to/placeholder-sushi-icon.svg" alt="SUSHI" className="h-5 w-5 rounded-full" />{toToken.symbol} <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
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
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {tokens.map((token) => (
                                        <Menu.Item key={token.symbol}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => { setToToken(token); setToValue(''); }}
                                                    className={classNames(
                                                        active ? 'bg-gray-700 text-white' : 'text-gray-300',
                                                        'block w-full text-left px-4 py-2 text-sm'
                                                    )}
                                                >
                                                    {token.symbol}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">$0.00</div>
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
                        className="w-full bg-darknode-button-connect text-white font-bold py-3 px-4 rounded-lg text-lg transition duration-200"
                        disabled
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