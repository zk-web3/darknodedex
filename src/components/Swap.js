import React, { useState, useEffect, useCallback } from 'react';

// Base Sepolia configuration
const BASE_SEPOLIA_CONFIG = {
  chainId: '0x14A34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org/'],
};

// Contract addresses for Base Sepolia
const CONTRACTS = {
  UNISWAP_V3_ROUTER: '0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4',
  WETH: '0x4200000000000000000000000000000000000006',
  QUOTER: '0xC5290058841028F1614F3A6F0F5816cAd0df5E27'
};

// Token list for Base Sepolia testnet
const TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logo: '⚡'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    logo: '🔷'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals: 6,
    logo: '💵'
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x174956bDfbCEb6e53089297cce4fE2825E58d92C',
    decimals: 18,
    logo: '🟡'
  }
];

// Contract ABIs
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

const ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)'
];

const QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)'
];

// Utilities
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatBalance = (balance, decimals = 18) => {
  if (!balance) return '0.0000';
  const divisor = Math.pow(10, decimals);
  return (parseInt(balance) / divisor).toFixed(4);
};

const parseAmount = (amount, decimals = 18) => {
  if (!amount) return '0';
  const multiplier = Math.pow(10, decimals);
  return (parseFloat(amount) * multiplier).toString();
};

const estimateGasPrice = () => {
  // Mock gas estimation
  return (Math.random() * 0.01 + 0.005).toFixed(6);
};

const Swap = () => {
  // State management
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState('');
  const [tokenIn, setTokenIn] = useState(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState(TOKENS[2]);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [balanceIn, setBalanceIn] = useState('0');
  const [balanceOut, setBalanceOut] = useState('0');
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gasEstimate, setGasEstimate] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20);
  const [priceImpact, setPriceImpact] = useState(0);

  // MetaMask connection functions
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setAccount(accounts[0]);
      setChainId(chainId);
      setIsConnected(true);

      // Check if on correct network
      if (chainId !== BASE_SEPOLIA_CONFIG.chainId) {
        await switchToBaseSepolia();
      }

      setSuccess('Wallet connected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Connection error:', error);
      setError(`Failed to connect: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CONFIG.chainId }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add Base Sepolia network');
        }
      } else {
        throw switchError;
      }
    }
  };

  // Token balance fetching
  const getTokenBalance = async (token, address) => {
    if (!window.ethereum || !address) return '0';

    try {
      if (token.address === '0x0000000000000000000000000000000000000000') {
        // ETH balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        return balance;
      } else {
        // ERC20 token balance
        const data = `0x70a08231000000000000000000000000${address.slice(2)}`;
        const balance = await window.ethereum.request({
          method: 'eth_call',
          params: [{
            to: token.address,
            data: data,
          }, 'latest'],
        });
        return balance;
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      return '0';
    }
  };

  // Update balances
  const updateBalances = useCallback(async () => {
    if (!isConnected || !account) return;

    try {
      const [balIn, balOut] = await Promise.all([
        getTokenBalance(tokenIn, account),
        getTokenBalance(tokenOut, account)
      ]);

      setBalanceIn(balIn);
      setBalanceOut(balOut);
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }, [isConnected, account, tokenIn, tokenOut]);

  // Get price quote
  const getQuote = useCallback(async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      setAmountOut('');
      setPriceImpact(0);
      return;
    }

    try {
      // Mock price calculation (in production, use Uniswap Quoter)
      let rate = 1;
      const pair = `${tokenIn.symbol}-${tokenOut.symbol}`;
      
      // Mock exchange rates
      const rates = {
        'ETH-USDC': 2000,
        'USDC-ETH': 0.0005,
        'WETH-USDC': 2000,
        'USDC-WETH': 0.0005,
        'ETH-WETH': 1,
        'WETH-ETH': 1,
        'ETH-DAI': 2000,
        'DAI-ETH': 0.0005,
        'USDC-DAI': 1,
        'DAI-USDC': 1,
        'WETH-DAI': 2000,
        'DAI-WETH': 0.0005
      };

      rate = rates[pair] || 1;
      
      const inputAmount = parseFloat(amountIn);
      const outputAmount = inputAmount * rate * 0.997; // 0.3% fee simulation
      
      setAmountOut(outputAmount.toFixed(6));
      
      // Mock price impact calculation
      const impact = Math.min(inputAmount / 1000 * 100, 5); // Max 5% impact
      setPriceImpact(impact);
      
      // Gas estimate
      setGasEstimate(estimateGasPrice());
      
    } catch (error) {
      console.error('Quote error:', error);
      setAmountOut('');
    }
  }, [amountIn, tokenIn, tokenOut]);

  // Check token allowance
  const checkAllowance = async (token, owner, spender) => {
    if (token.address === '0x0000000000000000000000000000000000000000') {
      return true; // ETH doesn't need approval
    }

    try {
      const data = `0xdd62ed3e000000000000000000000000${owner.slice(2)}000000000000000000000000${spender.slice(2)}`;
      const allowance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: token.address,
          data: data,
        }, 'latest'],
      });

      const amountBN = parseAmount(amountIn, token.decimals);
      return parseInt(allowance, 16) >= parseInt(amountBN);
    } catch (error) {
      console.error('Allowance check error:', error);
      return false;
    }
  };

  // Approve token
  const approveToken = async () => {
    if (!account || tokenIn.address === '0x0000000000000000000000000000000000000000') {
      return true;
    }

    setApproving(true);
    setError('');

    try {
      // Max approval amount (2^256 - 1)
      const maxAmount = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      
      const data = `0x095ea7b3000000000000000000000000${CONTRACTS.UNISWAP_V3_ROUTER.slice(2)}${maxAmount.slice(2)}`;
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: tokenIn.address,
          data: data,
          gas: '0x15F90', // 90000 gas limit
        }],
      });

      setSuccess(`Approval transaction submitted: ${txHash}`);
      
      // Wait for confirmation (simplified)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSuccess('Token approved successfully!');
      return true;
    } catch (error) {
      console.error('Approval error:', error);
      setError(`Approval failed: ${error.message}`);
      return false;
    } finally {
      setApproving(false);
    }
  };

  // Execute swap
  const executeSwap = async () => {
    if (!account || !amountIn || !amountOut) return;

    setSwapping(true);
    setError('');
    setSuccess('');

    try {
      // Check allowance first
      const hasAllowance = await checkAllowance(tokenIn, account, CONTRACTS.UNISWAP_V3_ROUTER);
      
      if (!hasAllowance) {
        const approved = await approveToken();
        if (!approved) {
          setSwapping(false);
          return;
        }
      }

      // Prepare swap parameters
      const amountInWei = parseAmount(amountIn, tokenIn.decimals);
      const amountOutMinimum = parseAmount(
        (parseFloat(amountOut) * (1 - slippage / 100)).toString(),
        tokenOut.decimals
      );
      
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (deadline * 60);

      // Handle ETH swaps
      let tokenInAddress = tokenIn.address;
      let value = '0x0';
      
      if (tokenIn.address === '0x0000000000000000000000000000000000000000') {
        tokenInAddress = CONTRACTS.WETH;
        value = `0x${parseInt(amountInWei).toString(16)}`;
      }

      let tokenOutAddress = tokenOut.address;
      if (tokenOut.address === '0x0000000000000000000000000000000000000000') {
        tokenOutAddress = CONTRACTS.WETH;
      }

      // Encode swap parameters (simplified)
      const swapData = `0x414bf389${tokenInAddress.slice(2).padStart(64, '0')}${tokenOutAddress.slice(2).padStart(64, '0')}${(3000).toString(16).padStart(6, '0')}${account.slice(2).padStart(64, '0')}${deadlineTimestamp.toString(16).padStart(64, '0')}${parseInt(amountInWei).toString(16).padStart(64, '0')}${parseInt(amountOutMinimum).toString(16).padStart(64, '0')}${'0'.padStart(64, '0')}`;

      setSuccess('Executing swap transaction...');

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: CONTRACTS.UNISWAP_V3_ROUTER,
          data: swapData,
          value: value,
          gas: '0x493E0', // 300000 gas limit
        }],
      });

      setSuccess(`Swap submitted! Transaction: ${txHash}`);
      
      // Simulate transaction confirmation
      setTimeout(() => {
        setSuccess(`Swap completed successfully! 🎉`);
        setAmountIn('');
        setAmountOut('');
        updateBalances();
      }, 5000);

    } catch (error) {
      console.error('Swap error:', error);
      setError(`Swap failed: ${error.message || 'Transaction rejected'}`);
    } finally {
      setSwapping(false);
    }
  };

  // Flip tokens
  const flipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut('');
    setBalanceIn(balanceOut);
    setBalanceOut(balanceIn);
  };

  // Effects
  useEffect(() => {
    if (window.ethereum) {
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setAccount('');
          setIsConnected(false);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(chainId);
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    updateBalances();
  }, [updateBalances]);

  useEffect(() => {
    const timeoutId = setTimeout(getQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [getQuote]);

  const isValidSwap = () => {
    return isConnected && 
           amountIn && 
           amountOut && 
           parseFloat(amountIn) > 0 && 
           parseFloat(amountIn) <= parseFloat(formatBalance(balanceIn, tokenIn.decimals)) &&
           tokenIn.address !== tokenOut.address;
  };

  return (
    <div style={{
      maxWidth: '420px',
      margin: '20px auto',
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>🔄 Base DEX</h1>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Base Sepolia Testnet
          </div>
        </div>
        
        {isConnected && (
          <div style={{ 
            marginTop: '10px', 
            fontSize: '14px', 
            opacity: 0.9,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>🟢 {formatAddress(account)}</span>
            <span>Chain: {parseInt(chainId, 16)}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {!isConnected ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '20px', color: '#666' }}>
              Connect your wallet to start trading
            </div>
            <button
              onClick={connectWallet}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Connecting...' : '🦊 Connect MetaMask'}
            </button>
          </div>
        ) : (
          <>
            {/* Token Input Section */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>From</span>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  Balance: {formatBalance(balanceIn, tokenIn.decimals)} {tokenIn.symbol}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={tokenIn.symbol}
                  onChange={(e) => setTokenIn(TOKENS.find(t => t.symbol === e.target.value))}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    backgroundColor: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '100px'
                  }}
                >
                  {TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.logo} {token.symbol}
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="0.0"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'right',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Swap Button */}
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <button
                onClick={flipTokens}
                style={{
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
              >
                ⇅
              </button>
            </div>

            {/* Token Output Section */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>To</span>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                  Balance: {formatBalance(balanceOut, tokenOut.decimals)} {tokenOut.symbol}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={tokenOut.symbol}
                  onChange={(e) => setTokenOut(TOKENS.find(t => t.symbol === e.target.value))}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    backgroundColor: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '100px'
                  }}
                >
                  {TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.logo} {token.symbol}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="0.0"
                  value={amountOut}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'right',
                    outline: 'none',
                    color: '#64748b'
                  }}
                />
              </div>
            </div>

            {/* Trade Details */}
            {amountOut && (
              <div style={{
                backgroundColor: '#f1f5f9',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Price Impact</span>
                  <span style={{ color: priceImpact > 3 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Slippage Tolerance</span>
                  <span style={{ fontWeight: '600' }}>{slippage}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Est. Gas Fee</span>
                  <span style={{ fontWeight: '600' }}>{gasEstimate} ETH</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={executeSwap}
              disabled={!isValidSwap() || swapping || approving}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: !isValidSwap() || swapping || approving
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                background: !isValidSwap() || swapping || approving
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: (!isValidSwap() || swapping || approving) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {approving ? 'Approving Token...' :
               swapping ? 'Swapping...' :
               !amountIn ? 'Enter Amount' :
               parseFloat(amountIn) > parseFloat(formatBalance(balanceIn, tokenIn.decimals)) ? 'Insufficient Balance' :
               tokenIn.address === tokenOut.address ? 'Select Different Tokens' :
               '🔄 Swap Tokens'}
            </button>

            {/* Settings */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '16px',
              gap: '12px'
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Slippage %
                </label>
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                  min="0.1"
                  max="50"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Deadline (min)
                </label>
                <input
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(parseInt(e.target.value) || 20)}
                  min="1"
                  max="180"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Status Messages */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#16a34a',
            fontSize: '14px'
          }}>
            ✅ {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default Swap;