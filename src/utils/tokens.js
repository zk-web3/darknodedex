// tokens.js
export const TOKENS = [
  {
    symbol: 'ETH',
    address: '', // Native
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    logo: 'https://cryptologos.cc/logos/weth-logo.png'
  },
  {
    symbol: 'USDC',
    address: '0x9799b5edc1aa7d3fad350309b08df3f64914e244',
    decimals: 6,
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  }
];

// contracts.js
export const UNISWAP_ROUTER = {
  address: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  abi: [
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "swapExactTokensForTokens",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "swapExactETHForTokens",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" },
        { "internalType": "address", "name": "to", "type": "address" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" }
      ],
      "name": "swapExactTokensForETH",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" }
      ],
      "name": "getAmountsOut",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// swapService.js
import { ethers } from 'ethers';
import { UNISWAP_ROUTER, ERC20_ABI } from './contracts.js';
import { TOKENS } from './tokens.js';

export class SwapService {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    this.routerContract = new ethers.Contract(
      UNISWAP_ROUTER.address,
      UNISWAP_ROUTER.abi,
      signer
    );
  }

  // Get token balance
  async getTokenBalance(tokenAddress, userAddress) {
    try {
      if (!tokenAddress || tokenAddress === '') {
        // ETH balance
        const balance = await this.provider.getBalance(userAddress);
        return ethers.utils.formatEther(balance);
      } else {
        // ERC20 token balance
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await tokenContract.balanceOf(userAddress);
        const decimals = await tokenContract.decimals();
        return ethers.utils.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  // Get quote for swap
  async getQuote(fromToken, toToken, amountIn) {
    try {
      const fromAddress = fromToken.address === '' ? TOKENS.find(t => t.symbol === 'WETH').address : fromToken.address;
      const toAddress = toToken.address === '' ? TOKENS.find(t => t.symbol === 'WETH').address : toToken.address;
      
      const path = [fromAddress, toAddress];
      const amountInWei = ethers.utils.parseUnits(amountIn.toString(), fromToken.decimals);
      
      const amounts = await this.routerContract.getAmountsOut(amountInWei, path);
      const amountOut = ethers.utils.formatUnits(amounts[1], toToken.decimals);
      
      return amountOut;
    } catch (error) {
      console.error('Error getting quote:', error);
      return '0';
    }
  }

  // Check and approve token if needed
  async checkAndApproveToken(tokenAddress, amount, decimals) {
    try {
      if (!tokenAddress || tokenAddress === '') return true; // ETH doesn't need approval
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const userAddress = await this.signer.getAddress();
      
      const allowance = await tokenContract.allowance(userAddress, UNISWAP_ROUTER.address);
      const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
      
      if (allowance.lt(amountWei)) {
        console.log('Approving token...');
        const approveTx = await tokenContract.approve(
          UNISWAP_ROUTER.address,
          ethers.constants.MaxUint256
        );
        await approveTx.wait();
        console.log('Token approved successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error approving token:', error);
      return false;
    }
  }

  // Execute swap
  async executeSwap(fromToken, toToken, amountIn, slippage = 0.5) {
    try {
      const userAddress = await this.signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      
      // Calculate minimum amount out with slippage
      const quote = await this.getQuote(fromToken, toToken, amountIn);
      const minAmountOut = (parseFloat(quote) * (100 - slippage) / 100).toString();
      const amountOutMin = ethers.utils.parseUnits(minAmountOut, toToken.decimals);
      
      let tx;
      
      if (fromToken.address === '') {
        // ETH to Token
        const path = [
          TOKENS.find(t => t.symbol === 'WETH').address,
          toToken.address
        ];
        const value = ethers.utils.parseEther(amountIn.toString());
        
        tx = await this.routerContract.swapExactETHForTokens(
          amountOutMin,
          path,
          userAddress,
          deadline,
          { value }
        );
      } else if (toToken.address === '') {
        // Token to ETH
        const path = [
          fromToken.address,
          TOKENS.find(t => t.symbol === 'WETH').address
        ];
        const amountInWei = ethers.utils.parseUnits(amountIn.toString(), fromToken.decimals);
        
        // Check approval first
        const approved = await this.checkAndApproveToken(fromToken.address, amountIn, fromToken.decimals);
        if (!approved) throw new Error('Token approval failed');
        
        tx = await this.routerContract.swapExactTokensForETH(
          amountInWei,
          amountOutMin,
          path,
          userAddress,
          deadline
        );
      } else {
        // Token to Token
        const path = [fromToken.address, toToken.address];
        const amountInWei = ethers.utils.parseUnits(amountIn.toString(), fromToken.decimals);
        
        // Check approval first
        const approved = await this.checkAndApproveToken(fromToken.address, amountIn, fromToken.decimals);
        if (!approved) throw new Error('Token approval failed');
        
        tx = await this.routerContract.swapExactTokensForTokens(
          amountInWei,
          amountOutMin,
          path,
          userAddress,
          deadline
        );
      }
      
      console.log('Swap transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Swap completed:', receipt.transactionHash);
      
      return {
        success: true,
        hash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      console.error('Swap failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// React Component Example - SwapInterface.jsx
import React, { useState, useEffect } from 'react';
import { SwapService } from './swapService.js';
import { TOKENS } from './tokens.js';

export const SwapInterface = ({ provider, signer }) => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [swapService, setSwapService] = useState(null);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    if (provider && signer) {
      setSwapService(new SwapService(provider, signer));
    }
  }, [provider, signer]);

  // Load balances
  useEffect(() => {
    if (swapService && signer) {
      loadBalances();
    }
  }, [swapService, signer]);

  const loadBalances = async () => {
    if (!swapService || !signer) return;
    
    try {
      const userAddress = await signer.getAddress();
      const newBalances = {};
      
      for (const token of TOKENS) {
        const balance = await swapService.getTokenBalance(token.address, userAddress);
        newBalances[token.symbol] = balance;
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  // Get quote when amount changes
  useEffect(() => {
    if (amountIn && swapService && parseFloat(amountIn) > 0) {
      getQuote();
    } else {
      setAmountOut('');
    }
  }, [amountIn, fromToken, toToken, swapService]);

  const getQuote = async () => {
    try {
      const quote = await swapService.getQuote(fromToken, toToken, amountIn);
      setAmountOut(quote);
    } catch (error) {
      console.error('Error getting quote:', error);
      setAmountOut('0');
    }
  };

  const handleSwap = async () => {
    if (!swapService || !amountIn || parseFloat(amountIn) <= 0) return;
    
    setLoading(true);
    try {
      const result = await swapService.executeSwap(fromToken, toToken, amountIn);
      
      if (result.success) {
        alert(`Swap successful! Transaction: ${result.hash}`);
        setAmountIn('');
        setAmountOut('');
        await loadBalances(); // Refresh balances
      } else {
        alert(`Swap failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Swap error:', error);
      alert(`Swap failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmountIn('');
    setAmountOut('');
  };

  return (
    <div className="swap-interface">
      <div className="swap-container">
        <h2>Swap Tokens</h2>
        
        {/* From Token */}
        <div className="token-input">
          <label>From</label>
          <div className="input-group">
            <select 
              value={fromToken.symbol} 
              onChange={(e) => setFromToken(TOKENS.find(t => t.symbol === e.target.value))}
            >
              {TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
            />
          </div>
          <small>Balance: {balances[fromToken.symbol] || '0'}</small>
        </div>

        {/* Switch Button */}
        <button onClick={switchTokens} className="switch-btn">
          ⇅
        </button>

        {/* To Token */}
        <div className="token-input">
          <label>To</label>
          <div className="input-group">
            <select 
              value={toToken.symbol} 
              onChange={(e) => setToToken(TOKENS.find(t => t.symbol === e.target.value))}
            >
              {TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amountOut}
              readOnly
              placeholder="0.0"
            />
          </div>
          <small>Balance: {balances[toToken.symbol] || '0'}</small>
        </div>

        {/* Swap Button */}
        <button 
          onClick={handleSwap} 
          disabled={loading || !amountIn || parseFloat(amountIn) <= 0}
          className="swap-btn"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  );
};

// CSS (add to your stylesheet)
/*
.swap-interface {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.swap-container {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
}

.token-input {
  margin: 15px 0;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.input-group input {
  flex: 2;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.switch-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  margin: 10px auto;
  display: block;
}

.swap-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.swap-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
*/