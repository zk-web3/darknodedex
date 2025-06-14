import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { ChevronDownIcon, ArrowDownIcon, Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { formatUnits, parseUnits } from 'viem';
import { useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import TxStatusModal from './TxStatusModal'; // Assuming TxStatusModal exists
import { Dialog, Transition } from '@headlessui/react';
import { BASE_SEPOLIA_EXPLORER_URL } from '../utils/uniswap'; // Make sure this is correctly imported
import { toast } from 'react-hot-toast'; // Assuming toast is configured
import { FiSettings } from 'react-icons/fi'; // For the settings icon
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'; // For the swap arrow
import { IoSwapVertical } from 'react-icons/io5';
import { MaxUint256 } from 'ethers'; // Corrected import for ethers v6
import {
  USDC_TOKEN, 
  WETH_TOKEN, 
  DN_TOKEN,
  TOKENS_BY_ADDRESS,
  WETH_ABI,
  USDC_ABI,
  DN_ABI
} from '../utils/tokens';
import { UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, UNISWAP_QUOTER_ADDRESS, UNISWAP_QUOTER_ABI } from '../utils/uniswap';

// Inline classNames utility to avoid module not found errors
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SwapCard = ({
  walletConnected,
  address,
  tokens, // This should be an array of token objects with { name, symbol, address, logo, decimals }
  uniswapRouter,
  uniswapQuoter,
  uniswapRouterAbi,
  erc20Abi,
  handleConnectWallet,
}) => {

  // Ensure tokens prop is available and has at least two tokens for initial state
  const initialFromToken = tokens && tokens.length > 0 ? tokens[0] : { name: "Ethereum", symbol: "ETH", address: "0x0000000000000000000000000000000000000000", logo: "/eth.svg", decimals: 18 };
  const initialToToken = tokens && tokens.length > 1 ? tokens[1] : { name: "Select Token", symbol: "Select Token", address: "", logo: "", decimals: 18 };

  const [activeTab, setActiveTab] = useState('Swap');
  const [fromToken, setFromToken] = useState(initialFromToken);
  const [toToken, setToToken] = useState(initialToToken);
  const [fromValue, setFromValue] = useState('0');
  const [toValue, setToValue] = useState('0');
  const [priceImpact, setPriceImpact] = useState('0.00'); // Placeholder
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
          setToValue('0');
        }
      } else {
        setToValue('0');
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
    } else {
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
    args: [uniswapRouter.address, MaxUint256], // Approving max amount
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
  }, [checkApproval, fromValue, fromToken, address]);

  const handleFromValueChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\\d*\\.?\\d*$/.test(value)) {
      setFromValue(value);
    }
  };

  const handleMaxClick = () => {
    if (walletConnected && fromTokenBalance && fromTokenBalance.value) {
      setFromValue(formatUnits(fromTokenBalance.value, fromToken.decimals));
    }
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
    setSearchQuery('');
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

  const amountOutMin = toValue ? parseUnits(toValue, toToken.decimals) * (100n - parseUnits(slippage, 0)) / 100n : 0n;

  const { data: swapSimulateData, error: swapSimulateError } = useSimulateContract({
    address: uniswapRouter.address,
    abi: uniswapRouter.abi,
    functionName: fromToken.address === '0x0000000000000000000000000000000000000000' ? 'exactInputSingle' : 'exactInputSingle',
    args: fromToken.address === '0x0000000000000000000000000000000000000000' ? [{
      tokenIn: tokens.find(t => t.symbol === 'WETH')?.address, // Use WETH for ETH swaps
      tokenOut: toToken.address,
      amountIn: fromValue ? parseUnits(fromValue, fromToken.decimals) : 0n,
      amountOutMinimum: amountOutMin,
      recipient: address,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes from now
      sqrtPriceLimitX96: 0n,
    }] : [{
      tokenIn: fromToken.address,
      tokenOut: toToken.address === '0x0000000000000000000000000000000000000000' ? tokens.find(t => t.symbol === 'WETH')?.address : toToken.address,
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
    setSearchQuery('');
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
          className="w-full p-4 mb-4 rounded-xl bg-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 border border-zinc-700 font-['Exo'] text-lg shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {filteredTokens.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  className="flex items-center p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-600 transition-colors duration-200 shadow-md border border-zinc-700"
                  onClick={() => handleTokenSelect(token, isFrom)}
                >
                  <img src={token.logo} alt={token.symbol} className="w-10 h-10 mr-4 rounded-full border border-zinc-600" />
                  <div className="flex flex-col items-start">
                    <span className="text-white text-xl font-semibold">{token.symbol}</span>
                    <span className="text-gray-400 text-sm">{token.name}</span>
                    {walletConnected && allTokensBalances[token.address] !== undefined && (
                      <span className="text-gray-400 text-xs mt-1">
                        Balance: {parseFloat(allTokensBalances[token.address]).toFixed(4)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6 text-lg">No tokens found. Try a different search.</p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-700 text-white font-exo relative overflow-hidden transform transition-all duration-300 hover:scale-[1.005]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-zinc-800 to-black opacity-30 blur-3xl -z-10"></div>
      
      {/* Tabs and Settings */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex bg-zinc-800 rounded-full p-1 shadow-inner">
          {["Swap", "Limit", "Buy", "Sell"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                "text-sm px-4 py-2 rounded-full font-semibold transition-all duration-200",
                activeTab === tab ? "bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200 text-gray-400 hover:text-white">
          <FiSettings className="w-5 h-5" />
        </button>
      </div>

      {/* You Sell Panel */}
      <div className="bg-zinc-800 p-5 rounded-2xl mb-3 border border-zinc-700 shadow-lg relative">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-300 uppercase tracking-wider">You Sell</div>
          {walletConnected && fromTokenBalance && (
            <button onClick={handleMaxClick} className="text-sm text-fuchsia-400 font-semibold hover:text-fuchsia-300 transition-colors">MAX ({parseFloat(formatUnits(fromTokenBalance.value, fromToken.decimals)).toFixed(6)})</button>
          )}
        </div>
        <div className="flex justify-between items-end">
          <input
            className="bg-transparent text-4xl outline-none w-full font-orbitron placeholder-gray-500 text-white"
            placeholder="0.0"
            value={fromValue}
            onChange={handleFromValueChange}
          />
          <button 
            className="text-lg flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-xl ml-2 text-white font-semibold transition-colors duration-200 shadow-md"
            onClick={() => setIsFromTokenModalOpen(true)}
          >
            {fromToken.logo && <img src={fromToken.logo} alt={fromToken.symbol} className="w-7 h-7 rounded-full" />}
            {fromToken.symbol}
            <ChevronDownIcon className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Arrow Switcher */}
      <div className="w-full flex justify-center -my-3 z-20 relative">
        <button 
          className="bg-zinc-700 p-3 rounded-full border border-zinc-600 hover:bg-zinc-600 transition-all duration-300 cursor-pointer shadow-lg transform hover:scale-110"
          onClick={handleSwapTokens}
        >
          <IoSwapVertical className="w-5 h-5 text-fuchsia-400" />
        </button>
      </div>

      {/* You Buy Panel */}
      <div className="bg-zinc-800 p-5 rounded-2xl mt-3 border border-zinc-700 shadow-lg relative">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-300 uppercase tracking-wider">You Buy</div>
          {walletConnected && toTokenBalance && (
            <span className="text-sm text-gray-400">Balance: {parseFloat(formatUnits(toTokenBalance.value, toToken.decimals)).toFixed(6)}</span>
          )}
        </div>
        <div className="flex justify-between items-end">
          <input
            className="bg-transparent text-4xl outline-none w-full font-orbitron placeholder-gray-500 text-white"
            placeholder="0.0"
            value={toValue}
            readOnly
          />
          <button 
            className="text-lg flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 px-4 py-2 rounded-xl ml-2 text-white font-semibold transition-all duration-200 shadow-lg"
            onClick={() => setIsToTokenModalOpen(true)}
          >
            {toToken.symbol === 'Select Token' ? 'Select token' : (toToken.logo && <img src={toToken.logo} alt={toToken.symbol} className="w-7 h-7 rounded-full" />)}
            {toToken.symbol === 'Select Token' ? '' : toToken.symbol}
            <ChevronDownIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Price Impact and Slippage */}
      <div className="mt-5 space-y-2 relative z-10">
        <div className="flex justify-between items-center text-sm text-gray-300">
          <span>Price Impact:</span>
          <span className={classNames("font-semibold", parseFloat(priceImpact) > 1 ? "text-red-400" : "text-green-400")}>{priceImpact}%</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-300">
          <span>Slippage Tolerance:</span>
          <span className="font-semibold text-fuchsia-400">{slippage}%</span>
        </div>
      </div>

      {/* Action Button */}
      {!walletConnected ? (
        <button
          onClick={handleConnectWallet}
          className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 font-bold text-white text-lg hover:from-pink-500 hover:to-purple-600 transition-all duration-200 shadow-xl transform hover:scale-[1.01]"
        >
          Connect Wallet
        </button>
      ) : needsApproval && fromToken.address !== '0x0000000000000000000000000000000000000000' ? (
        <button
          onClick={handleApprove}
          disabled={isApproveLoading || !approveSimulateData?.request}
          className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 font-bold text-white text-lg hover:from-pink-500 hover:to-purple-600 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isApproveLoading ? 'Approving...' : `Approve ${fromToken.symbol}`}
        </button>
      ) : (
        <button
          onClick={handleSwap}
          disabled={isSwapLoading || !swapSimulateData?.request || parseFloat(fromValue) === 0}
          className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-700 font-bold text-white text-lg hover:from-pink-500 hover:to-purple-600 transition-all duration-200 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSwapLoading ? 'Swapping...' : 'Swap'}
        </button>
      )}

      {/* Transaction Status Modal */}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-700 p-6 text-left align-middle shadow-2xl transition-all backdrop-filter backdrop-blur-lg">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-white font-['Orbitron']">
                      Select a token
                    </Dialog.Title>
                    <button
                      type="button"
                      className="p-1 rounded-full bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      onClick={() => setIsFromTokenModalOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-4">
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-700 p-6 text-left align-middle shadow-2xl transition-all backdrop-filter backdrop-blur-lg">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-white font-['Orbitron']">
                      Select a token
                    </Dialog.Title>
                    <button
                      type="button"
                      className="p-1 rounded-full bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      onClick={() => setIsToTokenModalOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-4">
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