import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronDownIcon, ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { FiSettings } from 'react-icons/fi';
import { formatUnits, parseUnits } from 'viem';
import { toast } from 'react-hot-toast';
import { MaxUint256 } from 'ethers';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance, usePublicClient, useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { baseSepolia } from 'wagmi/chains';
import { TOKENS, USDC_TOKEN } from '../src/utils/tokens';
import ERC20_ABI from '../src/abis/ERC20.json';
import { UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, UNISWAP_QUOTER_ADDRESS, UNISWAP_QUOTER_ABI, BASE_SEPOLIA_EXPLORER_URL } from '../src/utils/uniswap';
import { WETH_TOKEN } from '../src/utils/tokens';
import { Web3Provider } from 'ethers/providers';
import SWAP_ROUTER_ABI from '../src/abis/UniswapV3SwapRouter.json';
import QUOTER_ABI from '../src/abis/UniswapV3Quoter.json';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Update explorer URL usage
const EXPLORER_URL = BASE_SEPOLIA_EXPLORER_URL; // Monad explorer

// Remove WETH from ALL_TOKENS and use native ETH
const ETH_TOKEN = {
  name: 'Ether',
  symbol: 'ETH',
  address: undefined, // Native ETH has no address
  decimals: 18,
  logo: '/ethereum-eth-logo.png',
};
const ALL_TOKENS = [ETH_TOKEN, USDC_TOKEN];

const initialFromToken = ETH_TOKEN;
const initialToToken = USDC_TOKEN;

const UNISWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const UNISWAP_QUOTER = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';

export default function SwapPage() {
  // Wallet
  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Swap State
  const [fromToken, setFromToken] = useState(initialFromToken);
  const [toToken, setToToken] = useState(initialToToken);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [priceImpact, setPriceImpact] = useState('0.00');
  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isTxStatusModalOpen, setIsTxStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalTxHash, setModalTxHash] = useState('');
  const [liquidityWarning, setLiquidityWarning] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [swapTxHash, setSwapTxHash] = useState('');
  const [allowance, setAllowance] = useState('0');
  const [estimatedOut, setEstimatedOut] = useState('');
  const [slippageWarning, setSlippageWarning] = useState('');
  const [gasEstimate, setGasEstimate] = useState('');

  // Defensive: fallback to empty object if fromToken/toToken is undefined
  const safeFromToken = fromToken || { address: '', symbol: '', decimals: 18, logo: '' };
  const safeToToken = toToken || { address: '', symbol: '', decimals: 18, logo: '' };

  // Wallet Connect Handler
  const handleConnectWallet = async () => {
    if (isConnected) {
      if (chain?.id !== baseSepolia.id) {
        try {
          await switchChain({ chainId: baseSepolia.id });
          toast.success('Switched to Base Sepolia Network!');
        } catch (switchError) {
          if (switchError.code === 4902) {
            toast.error('Base Sepolia network not found. Please add it to MetaMask.');
          } else {
            toast.error(`Failed to switch network: ${switchError.message}`);
          }
        }
      } else {
        toast.success('Wallet is already connected and on Base Sepolia Network!');
      }
    } else {
      try {
        await connect({ connector: injected() });
      } catch (connectError) {
        toast.error(`Failed to connect wallet: ${connectError.message}`);
      }
    }
  };

  // Show 'Wallet Connected!' toast only when isConnected and address are available
  useEffect(() => {
    if (isConnected && address) {
      toast.success('Wallet Connected!');
    }
  }, [isConnected, address]);

  // Balances
  const { data: fromTokenBalanceData, isLoading: isFromTokenBalanceLoading } = useBalance({
    address: isConnected && address ? address : undefined,
    token: safeFromToken.symbol === 'ETH' ? undefined : safeFromToken.address,
    query: { enabled: isConnected && !!address, watch: true },
  });
  const { data: toTokenBalanceData, isLoading: isToTokenBalanceLoading } = useBalance({
    address: isConnected && address ? address : undefined,
    token: safeToToken.symbol === 'ETH' ? undefined : safeToToken.address,
    query: { enabled: isConnected && !!address, watch: true },
  });

  // All token balances for dropdown
  const erc20TokenContracts = ALL_TOKENS.filter(token => token.address && token.address !== ETH_TOKEN.address).map(token => ({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  }));
  const { data: erc20BalancesData, isLoading: isErc20BalancesLoading } = useReadContracts({
    contracts: erc20TokenContracts,
    query: {
      enabled: isConnected && !!address,
      watch: true,
      select: (data) => {
        const balancesMap = {};
        ALL_TOKENS.forEach((token, index) => {
          const balance = data[index]?.result;
          if (balance !== undefined) {
            balancesMap[token.address] = formatUnits(balance, token.decimals);
          }
        });
        return balancesMap;
      },
    },
  });
  const allTokensBalances = erc20BalancesData || {};

  // Uniswap Quote
  const publicClient = usePublicClient();
  // Update getQuoteTokenAddress to handle native ETH (return WETH address for Uniswap contract calls)
  const getQuoteTokenAddress = (token) => token && token.symbol === 'ETH' ? WETH_TOKEN.address : token?.address;
  const getQuote = useCallback(async (amountInBigInt, currentFromToken, currentToToken) => {
    if (!publicClient || !currentFromToken || !currentToToken || !currentFromToken.address || !currentToToken.address || amountInBigInt === 0n) return 0n;
    try {
      const quote = await publicClient.readContract({
        address: UNISWAP_QUOTER_ADDRESS,
        abi: UNISWAP_QUOTER_ABI,
        functionName: 'quoteExactInputSingle',
        args: [{
          tokenIn: getQuoteTokenAddress(currentFromToken),
          tokenOut: getQuoteTokenAddress(currentToToken),
          amountIn: amountInBigInt,
          fee: 3000,
          sqrtPriceLimitX96: 0n,
        }],
      });
      // Uniswap V3 Quoter V2 returns [amountOut, ...]
      return BigInt(Array.isArray(quote) ? quote[0] : quote);
    } catch (error) {
      return 0n;
    }
  }, [publicClient]);

  useEffect(() => {
    const fetchQuote = async () => {
      setLiquidityWarning('');
      if (fromValue && safeFromToken && safeToToken && publicClient && fromValue !== '0' && fromValue !== '' && safeFromToken.address && safeToToken.address) {
        try {
          const amountInBigInt = parseUnits(fromValue, safeFromToken.decimals);
          if (amountInBigInt > 0n) {
            const quotedAmountOut = await getQuote(amountInBigInt, safeFromToken, safeToToken);
            setToValue(formatUnits(quotedAmountOut, safeToToken.decimals));
            // Check liquidity for a small amount
            const testAmount = parseUnits('0.01', safeFromToken.decimals);
            const testQuote = await getQuote(testAmount, safeFromToken, safeToToken);
            if (testQuote === 0n) {
              setLiquidityWarning('No liquidity for this pair.');
            }
          } else {
            setToValue('');
          }
        } catch (error) {
          setToValue('');
        }
      } else {
        setToValue('');
      }
    };
    const debounceFetch = setTimeout(fetchQuote, 300);
    return () => clearTimeout(debounceFetch);
  }, [fromValue, safeFromToken, safeToToken, publicClient, getQuote]);

  // Price Impact
  const calculatePriceImpact = useCallback(async () => {
    if (fromValue && toValue && safeFromToken && safeToToken && publicClient && safeFromToken.address && safeToToken.address && parseUnits(fromValue, safeFromToken.decimals) > 0n) {
      const smallAmountIn = parseUnits('1', safeFromToken.decimals);
      const smallQuoteOut = await getQuote(smallAmountIn, safeFromToken, safeToToken);
      if (smallQuoteOut > 0n) {
        const smallAmountInNum = parseFloat(formatUnits(smallAmountIn, safeFromToken.decimals));
        const smallQuoteOutNum = parseFloat(formatUnits(smallQuoteOut, safeToToken.decimals));
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
  }, [fromValue, toValue, safeFromToken, safeToToken, publicClient, getQuote]);
  useEffect(() => { calculatePriceImpact(); }, [calculatePriceImpact]);

  // Approval
  const amountToApproveBigInt = fromValue && safeFromToken.address !== ETH_TOKEN.address ? parseUnits(fromValue, safeFromToken.decimals) : 0n;
  const { data: approveSimulateData, error: approveSimulateError } = useSimulateContract({
    address: safeFromToken.address === ETH_TOKEN.address ? undefined : safeFromToken.address,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [UNISWAP_ROUTER_ADDRESS, MaxUint256],
    query: { enabled: isConnected && amountToApproveBigInt > 0n && safeFromToken.address !== ETH_TOKEN.address },
  });
  const { data: approveWriteData, writeContract: writeApprove } = useWriteContract();
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveErrorTx, data: approveTxData } = useWaitForTransactionReceipt({ hash: approveWriteData?.hash });
  useEffect(() => {
    if (isApproveLoading) {
      setIsTxStatusModalOpen(true); setModalStatus('loading'); setModalTitle('Approving...'); setModalMessage(`Approving ${safeFromToken.symbol}`);
    } else if (isApproveSuccess) {
      setIsTxStatusModalOpen(true); setModalStatus('success'); setModalTitle('Approval Successful!'); setModalMessage(`Approved ${safeFromToken.symbol}`); setModalTxHash(approveTxData?.transactionHash);
      checkApproval();
    } else if (isApproveErrorTx) {
      setIsTxStatusModalOpen(true); setModalStatus('error'); setModalTitle('Approval Failed'); setModalMessage(`Error approving ${safeFromToken.symbol}`); setModalTxHash(approveTxData?.transactionHash);
    }
  }, [isApproveLoading, isApproveSuccess, isApproveErrorTx, approveSimulateError, approveTxData, safeFromToken.symbol]);

  const checkApproval = useCallback(async () => {
    if (isConnected && address && publicClient && safeFromToken && fromValue && safeFromToken.address !== ETH_TOKEN.address) {
      try {
        const allowance = await publicClient.readContract({
          address: safeFromToken.address,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, UNISWAP_ROUTER_ADDRESS],
        });
        const amountIn = parseUnits(fromValue || '0', safeFromToken.decimals);
        setNeedsApproval(allowance < amountIn);
      } catch (error) {
        setNeedsApproval(true);
      }
    } else {
      setNeedsApproval(false);
    }
  }, [isConnected, address, publicClient, safeFromToken, fromValue]);
  useEffect(() => { checkApproval(); }, [checkApproval, fromValue, safeFromToken, address]);

  // Fetch allowance for USDC
  useEffect(() => {
    if (!isConnected || !address || safeFromToken.symbol !== 'USDC') return;
    const provider = new Web3Provider(window.ethereum);
    const erc20 = new Web3Provider(window.ethereum).getSigner().connect(new ethers.Contract(safeFromToken.address, ERC20_ABI, provider));
    erc20.allowance(address, UNISWAP_ROUTER).then(a => setAllowance(a.toString()));
  }, [isConnected, address, safeFromToken]);

  // Uniswap Quoter: Estimate output
  useEffect(() => {
    async function fetchQuote() {
      if (!fromValue || !safeFromToken || !safeToToken || !isConnected) return setEstimatedOut('');
      try {
        const provider = new Web3Provider(window.ethereum);
        const quoter = new Web3Provider(window.ethereum).getSigner().connect(new ethers.Contract(UNISWAP_QUOTER, QUOTER_ABI, provider));
        const amountIn = ethers.utils.parseUnits(fromValue, safeFromToken.decimals);
        const quoted = await quoter.quoteExactInputSingle(
          safeFromToken.symbol === 'ETH' ? WETH_ADDRESS : safeFromToken.address,
          safeToToken.symbol === 'ETH' ? WETH_ADDRESS : safeToToken.address,
          3000,
          amountIn,
          0
        );
        setEstimatedOut(ethers.utils.formatUnits(quoted, safeToToken.decimals));
        setSlippageWarning(parseFloat(fromValue) > 0 && parseFloat(quoted) === 0 ? 'No liquidity for this pair.' : '');
      } catch (e) {
        setEstimatedOut('');
        setSlippageWarning('No liquidity or error fetching quote.');
      }
    }
    fetchQuote();
  }, [fromValue, safeFromToken, safeToToken, isConnected]);

  // Gas Estimation
  useEffect(() => {
    async function estimateGas() {
      if (!fromValue || !safeFromToken || !safeToToken || !isConnected) return setGasEstimate('');
      try {
        const provider = new Web3Provider(window.ethereum);
        const signer = new Web3Provider(window.ethereum).getSigner();
        const router = new Web3Provider(window.ethereum).getSigner().connect(new ethers.Contract(UNISWAP_ROUTER, SWAP_ROUTER_ABI, signer));
        const amountIn = ethers.utils.parseUnits(fromValue, safeFromToken.decimals);
        const quoted = estimatedOut ? ethers.utils.parseUnits(estimatedOut, safeToToken.decimals) : 0;
        const minAmountOut = quoted ? quoted.mul(10000 - Math.floor(parseFloat(slippage) * 100)).div(10000) : 0;
        const params = {
          tokenIn: safeFromToken.symbol === 'ETH' ? WETH_ADDRESS : safeFromToken.address,
          tokenOut: safeToToken.symbol === 'ETH' ? WETH_ADDRESS : safeToToken.address,
          fee: 3000,
          recipient: address,
          deadline: Math.floor(Date.now() / 1000) + 60 * 10,
          amountIn,
          amountOutMinimum: minAmountOut,
          sqrtPriceLimitX96: 0,
        };
        const gas = await router.estimateGas.exactInputSingle(
          params,
          { value: safeFromToken.symbol === 'ETH' ? amountIn : 0 }
        );
        setGasEstimate(gas.toString());
      } catch (e) {
        setGasEstimate('');
      }
    }
    estimateGas();
  }, [fromValue, safeFromToken, safeToToken, isConnected, estimatedOut, slippage]);

  // Approve USDC if needed
  const handleApprove = async () => {
    setApproveLoading(true);
    setSwapError('');
    try {
      const provider = new Web3Provider(window.ethereum);
      const signer = new Web3Provider(window.ethereum).getSigner();
      const erc20 = new Web3Provider(window.ethereum).getSigner().connect(new ethers.Contract(safeFromToken.address, ERC20_ABI, signer));
      const tx = await erc20.approve(UNISWAP_ROUTER, ethers.constants.MaxUint256);
      await tx.wait();
      setAllowance(ethers.constants.MaxUint256.toString());
    } catch (e) {
      setSwapError('Approval failed: ' + (e.reason || e.message));
    }
    setApproveLoading(false);
  };

  // Swap function (ETH <-> USDC)
  const handleSwap = async () => {
    setSwapLoading(true);
    setSwapError('');
    setSwapTxHash('');
    try {
      const provider = new Web3Provider(window.ethereum);
      const signer = new Web3Provider(window.ethereum).getSigner();
      const router = new Web3Provider(window.ethereum).getSigner().connect(new ethers.Contract(UNISWAP_ROUTER, SWAP_ROUTER_ABI, signer));
      const amountIn = ethers.utils.parseUnits(fromValue, safeFromToken.decimals);
      const quoted = estimatedOut ? ethers.utils.parseUnits(estimatedOut, safeToToken.decimals) : 0;
      const minAmountOut = quoted ? quoted.mul(10000 - Math.floor(parseFloat(slippage) * 100)).div(10000) : 0;
      const params = {
        tokenIn: safeFromToken.symbol === 'ETH' ? WETH_ADDRESS : safeFromToken.address,
        tokenOut: safeToToken.symbol === 'ETH' ? WETH_ADDRESS : safeToToken.address,
        fee: 3000,
        recipient: address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        amountIn,
        amountOutMinimum: minAmountOut,
        sqrtPriceLimitX96: 0,
      };
      const tx = await router.exactInputSingle(
        params,
        { value: safeFromToken.symbol === 'ETH' ? amountIn : 0 }
      );
      setSwapTxHash(tx.hash);
      await tx.wait();
    } catch (e) {
      setSwapError('Swap failed: ' + (e.reason || e.message));
    }
    setSwapLoading(false);
  };

  // UI Handlers
  const handleFromValueChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) setFromValue(value);
  };
  const handleMaxClick = () => {
    if (isConnected && fromTokenBalanceData && fromTokenBalanceData.value) {
      setFromValue(formatUnits(fromTokenBalanceData.value, safeFromToken.decimals));
    }
  };
  const handleSwapTokens = () => {
    setFromToken(safeToToken);
    setToToken(safeFromToken);
    setFromValue(toValue);
    setToValue(fromValue);
    setSearchQuery('');
  };
  const handleTokenSelect = (token, isFrom) => {
    if (isFrom) { setFromToken(token); setIsFromTokenModalOpen(false); } else { setToToken(token); setIsToTokenModalOpen(false); }
    setSearchQuery(''); setFromValue(''); setToValue('');
  };

  // Token List Modal
  const renderTokenList = (isFrom) => {
    const filteredTokens = ALL_TOKENS.filter(token =>
      (token.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (token.symbol || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <>
        <input
          type="text"
          placeholder="Search name or paste address"
          className="w-full p-3 mb-4 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 font-['Exo']"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {filteredTokens.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  className="flex items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                  onClick={() => handleTokenSelect(token, isFrom)}
                >
                  <img src={token.logo || ''} alt={token.symbol || ''} className="w-9 h-9 mr-3 rounded-full" />
                  <div className="flex flex-col items-start">
                    <span className="text-white text-lg font-semibold">{token.symbol || ''}</span>
                    <span className="text-gray-400 text-sm">{token.name || ''}</span>
                    {isConnected && (
                      <span className="text-gray-400 text-xs">
                        Balance: {token.symbol === 'ETH' ? fromTokenBalanceData?.formatted || '0.0000' : toTokenBalanceData?.formatted || '0.0000'}
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

  // Main UI
  if (!mounted) return null;
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4">
      <h1 className="text-5xl font-bold text-white mb-8 neon-text">Trade</h1>
      <div className="max-w-md w-full mx-auto p-4 bg-[#1e1e1e] rounded-2xl shadow-lg text-white font-['Inter']">
        {/* Swap Box */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex rounded-lg bg-[#2a2a2a] p-1">
            <button className="text-sm px-3 py-1 rounded-md font-medium bg-[#3b3b3b] text-white shadow">Swap</button>
          </div>
          <button className="p-2 rounded-full hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-colors duration-200">
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
        {/* You Sell Panel */}
        <div className="bg-[#2a2a2a] p-4 rounded-xl mb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-400">Sell</div>
            {isConnected && (
              <span className="text-xs text-gray-400">
                Balance: {isFromTokenBalanceLoading ? 'Loading...' : fromTokenBalanceData?.formatted || '0.0000'}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <input
              className="bg-transparent text-3xl outline-none w-full font-semibold placeholder-gray-500 text-white"
              placeholder="0"
              value={fromValue}
              onChange={handleFromValueChange}
              aria-label={`Amount of ${safeFromToken.symbol || 'token'} to sell`}
              inputMode="decimal"
              autoComplete="off"
              role="spinbutton"
            />
            <button
              className="ml-2 text-xs text-purple-400 font-semibold px-2 py-1 rounded bg-gray-700 hover:bg-purple-700 transition"
              onClick={handleMaxClick}
              type="button"
              aria-label="Max"
            >
              MAX
            </button>
            <button 
              className="text-md flex items-center gap-1 bg-[#3b3b3b] px-3 py-2 rounded-lg text-white font-semibold"
              onClick={() => setIsFromTokenModalOpen(true)}
            >
              <img src={safeFromToken.logo || ''} alt={safeFromToken.symbol || ''} className="w-7 h-7 mr-1 rounded-full" />
              {safeFromToken.symbol || ''}
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-1">$0.00</div>
        </div>
        {/* Arrow Switcher */}
        <div className="w-full flex justify-center -my-3 z-10">
          <button 
            className="bg-[#2a2a2a] p-2 rounded-full border-4 border-[#1e1e1e] hover:bg-[#3b3b3b] transition-colors duration-200 cursor-pointer shadow-md"
            onClick={handleSwapTokens}
          >
            <ArrowDownIcon className="w-5 h-5 text-white" />
          </button>
        </div>
        {/* Price per token (from quoter) */}
        {fromValue && toValue && (
          <div className="flex justify-center items-center my-2 text-gray-400 text-sm">
            1 {safeFromToken.symbol} ≈ {(parseFloat(toValue) / parseFloat(fromValue)).toFixed(4)} {safeToToken.symbol}
          </div>
        )}
        {/* You Buy Panel */}
        <div className="bg-[#2a2a2a] p-4 rounded-xl mt-2">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-400">Buy</div>
            {isConnected && (
              <span className="text-xs text-gray-400">
                Balance: {isToTokenBalanceLoading ? 'Loading...' : toTokenBalanceData?.formatted || '0.0000'}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <input
              className="bg-transparent text-3xl outline-none w-full font-semibold placeholder-gray-500 text-white"
              placeholder="0"
              value={toValue}
              readOnly
              aria-label={`Amount of ${safeToToken.symbol || 'token'} to buy`}
              inputMode="decimal"
              autoComplete="off"
              role="spinbutton"
            />
            <button 
              className="text-md flex items-center gap-1 bg-[#3b3b3b] px-3 py-2 rounded-lg text-white font-semibold"
              onClick={() => setIsToTokenModalOpen(true)}
            >
              <img src={safeToToken.logo || ''} alt={safeToToken.symbol || ''} className="w-7 h-7 mr-1 rounded-full" />
              {safeToToken.symbol || ''}
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-1">$0.00</div>
        </div>
        {/* Price Impact and Slippage */}
        <div className="flex justify-between items-center text-sm text-gray-400 mt-5">
          <span>Price Impact:</span>
          <span className={classNames('font-semibold', parseFloat(priceImpact) > 1 ? 'text-red-400' : 'text-green-400')}>{priceImpact}%</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
          <span>Slippage Tolerance:</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={slippage}
            onChange={e => setSlippage(e.target.value)}
            className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
            aria-label="Slippage tolerance"
          />
          <span className="ml-1">%</span>
        </div>
        {/* Quoter summary */}
        <div className="flex justify-between items-center text-md text-gray-300 mt-4">
          <span>You pay:</span>
          <span className="font-semibold">{fromValue || '0'} {safeFromToken.symbol || ''}</span>
        </div>
        <div className="flex justify-between items-center text-md text-gray-300 mt-1">
          <span>You get:</span>
          <span className="font-semibold">{toValue || '0'} {safeToToken.symbol || ''}</span>
        </div>
        {liquidityWarning && (
          <div className="mt-4 text-center text-red-400 font-semibold">{liquidityWarning}</div>
        )}
        {/* Action Button */}
        {!isConnected ? (
          <button
            onClick={handleConnectWallet}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 font-semibold text-white hover:from-purple-700 hover:to-pink-600 transition duration-200 text-lg shadow-lg"
          >
            Connect wallet
          </button>
        ) : needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={isApproveLoading || !approveSimulateData?.request}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-700 font-semibold text-white hover:from-yellow-600 hover:to-yellow-800 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
          >
            {isApproveLoading ? 'Approving...' : `Approve ${safeFromToken.symbol || ''}`}
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={
              swapLoading ||
              !isConnected ||
              !address ||
              parseFloat(fromValue) === 0 ||
              parseFloat(fromValue) > parseFloat(fromTokenBalanceData?.formatted || '0') ||
              !isValidPair(safeFromToken, safeToToken)
            }
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 font-semibold text-white hover:from-green-600 hover:to-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
            aria-label="Swap ETH to USDC"
            role="button"
          >
            {swapLoading ? 'Swapping...' : 'Swap'}
          </button>
        )}
        {swapError && (
          <div className="text-red-500 text-sm mt-2">{swapError}</div>
        )}
      </div>
      {/* Token Selection Modals */}
      <Transition appear show={isFromTokenModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 font-['Inter']" onClose={() => setIsFromTokenModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1e1e1e] p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                      Select a token
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={() => setIsFromTokenModalOpen(false)}
                    >
                      <XMarkIcon className="h-5 w-5" />
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
        <Dialog as="div" className="relative z-50 font-['Inter']" onClose={() => setIsToTokenModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1e1e1e] p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                      Select a token
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={() => setIsToTokenModalOpen(false)}
                    >
                      <XMarkIcon className="h-5 w-5" />
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
      {/* Transaction Status Modal */}
      {isTxStatusModalOpen && (
        <Transition appear show={isTxStatusModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 font-['Inter']" onClose={() => setIsTxStatusModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1e1e1e] p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-bold mb-2 text-white">{modalTitle}</h3>
                      <p className="text-gray-300 mb-4">{modalMessage}</p>
                      {modalTxHash && (
                        <a
                          href={`${EXPLORER_URL}/tx/${modalTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          View on Explorer
                        </a>
                      )}
                      <button
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        onClick={() => setIsTxStatusModalOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
      {/* Add aria-live region for status messages */}
      <div aria-live="polite" className="sr-only">
        {modalStatus === 'success' && `Swap successful: ${modalMessage}`}
        {modalStatus === 'error' && `Swap failed: ${modalMessage}`}
        {liquidityWarning && `Warning: ${liquidityWarning}`}
      </div>
    </div>
  );
}

// In the swap button, disable if !isValidPair(safeFromToken, safeToToken)
const isValidPair = (from, to) => (
  (from.symbol === 'ETH' && to.symbol === 'USDC') ||
  (from.symbol === 'USDC' && to.symbol === 'ETH')
);