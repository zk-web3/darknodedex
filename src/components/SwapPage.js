import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// Dummy token list
const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', logo: '🦄' },
  { symbol: 'USDC', name: 'USD Coin', logo: '💵' },
  { symbol: 'DAI', name: 'Dai', logo: '🟡' },
  { symbol: 'WBTC', name: 'Wrapped BTC', logo: '₿' },
  { symbol: 'REN', name: 'Ren', logo: '⚫' },
];

// Dummy balances
const DUMMY_BALANCES = {
  ETH: 2.34,
  USDC: 1200.5,
  DAI: 800.0,
  WBTC: 0.12,
  REN: 5000,
};

// Skeleton loader animation
const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.card};
  box-shadow: ${({ theme }) => theme.shadow};
  border-radius: 22px;
  padding: 36px 32px 32px 32px;
  min-width: 350px;
  max-width: 410px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: stretch;
  border: ${({ theme }) => theme.border};
  backdrop-filter: blur(18px);
  @media (max-width: 500px) {
    min-width: 0;
    padding: 18px 4vw 18px 4vw;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const Balance = styled.span`
  font-size: 0.98rem;
  color: ${({ theme }) => theme.accent2};
  font-weight: 500;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AmountInput = styled.input`
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  outline: none;
  box-shadow: 0 0 0 1.5px ${({ theme }) => theme.accent}33;
  transition: box-shadow 0.2s;
  &:focus {
    box-shadow: 0 0 0 2.5px ${({ theme }) => theme.accent};
  }
`;

const TokenSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.glass};
  color: ${({ theme }) => theme.text};
  border: ${({ theme }) => theme.border};
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 10px 16px;
  cursor: pointer;
  box-shadow: 0 0 8px 0 ${({ theme }) => theme.accent}22;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover {
    border: 1.5px solid ${({ theme }) => theme.accent};
    box-shadow: 0 0 12px 0 ${({ theme }) => theme.accent}55;
  }
`;

const SwapIcon = styled.div`
  align-self: center;
  font-size: 2.1rem;
  color: ${({ theme }) => theme.accent};
  margin: 0 0 0 0;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.accent2}; }
`;

const SlippageRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const SlippageBtn = styled.button`
  background: ${({ active, theme }) => (active ? theme.accent : theme.glass)};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ active, theme }) =>
    active ? `0 0 8px 0 ${theme.accent}` : 'none'};
  transition: background 0.2s, color 0.2s;
`;

const PriceImpact = styled.div`
  font-size: 0.98rem;
  color: ${({ impact, theme }) =>
    impact > 2 ? theme.toastError : theme.accent2};
  font-weight: 500;
  margin-top: 2px;
`;

const SwapBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  font-weight: 700;
  font-size: 1.2rem;
  border: none;
  border-radius: 12px;
  padding: 16px 0;
  margin-top: 10px;
  box-shadow: 0 0 16px 0 ${({ theme }) => theme.accent}55;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.accent2};
  }
  &:disabled {
    background: #8888;
    color: #eee8;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// Skeleton loader
const Skeleton = styled.div`
  height: 24px;
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg, ${({ theme }) => theme.skeleton} 25%, #fff1 50%, ${({ theme }) => theme.skeleton} 75%);
  background-size: 400px 100%;
  animation: ${shimmer} 1.2s linear infinite;
`;

// Modal for token selection
const ModalBg = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Modal = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 18px;
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 28px 18px 18px 18px;
  min-width: 260px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  margin-bottom: 10px;
`;
const TokenOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 1.1rem;
  font-weight: 600;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 6px;
  width: 100%;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => theme.glass};
  }
`;

// Main SwapPage component
const SwapPage = ({ wallet, notify, theme }) => {
  // State for tokens and amounts
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(null); // 'from' or 'to' or null
  const [search, setSearch] = useState('');

  // Dummy price impact
  const priceImpact = fromAmount ? Math.min(0.1 * fromAmount, 5).toFixed(2) : 0;

  // Dummy balance
  const balances = wallet ? DUMMY_BALANCES : {};

  // Handle swap
  const handleSwap = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFromAmount('');
      setToAmount('');
      notify('success', `Swapped ${fromAmount} ${fromToken.symbol} for ${toToken.symbol}`);
    }, 1800);
  };

  // Handle token select
  const handleTokenSelect = (token) => {
    if (showModal === 'from') setFromToken(token);
    else setToToken(token);
    setShowModal(null);
    setSearch('');
  };

  // Dummy conversion
  React.useEffect(() => {
    if (!fromAmount) setToAmount('');
    else setToAmount((parseFloat(fromAmount) * 1.01).toFixed(4));
  }, [fromAmount, fromToken, toToken]);

  // Filter tokens for modal
  const filteredTokens = TOKENS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      {/* From token */}
      <Section>
        <LabelRow>
          <Label>From</Label>
          <Balance>
            {wallet ? `Balance: ${balances[fromToken.symbol] ?? 0}` : 'Connect wallet'}
          </Balance>
        </LabelRow>
        <InputRow>
          <AmountInput
            type="number"
            min="0"
            placeholder="0.0"
            value={fromAmount}
            onChange={e => setFromAmount(e.target.value)}
            disabled={!wallet || loading}
          />
          <TokenSelector onClick={() => setShowModal('from')}>
            <span style={{ fontSize: '1.3rem' }}>{fromToken.logo}</span>
            {fromToken.symbol}
          </TokenSelector>
        </InputRow>
      </Section>
      {/* Swap icon */}
      <SwapIcon onClick={() => {
        setFromToken(toToken);
        setToToken(fromToken);
      }}>⇅</SwapIcon>
      {/* To token */}
      <Section>
        <LabelRow>
          <Label>To</Label>
          <Balance>
            {wallet ? `Balance: ${balances[toToken.symbol] ?? 0}` : 'Connect wallet'}
          </Balance>
        </LabelRow>
        <InputRow>
          <AmountInput
            type="number"
            min="0"
            placeholder="0.0"
            value={toAmount}
            onChange={e => setToAmount(e.target.value)}
            disabled
          />
          <TokenSelector onClick={() => setShowModal('to')}>
            <span style={{ fontSize: '1.3rem' }}>{toToken.logo}</span>
            {toToken.symbol}
          </TokenSelector>
        </InputRow>
      </Section>
      {/* Slippage and price impact */}
      <SlippageRow>
        <Label>Slippage:</Label>
        {[0.1, 0.5, 1].map((s) => (
          <SlippageBtn
            key={s}
            active={slippage === s}
            onClick={() => setSlippage(s)}
          >
            {s}%
          </SlippageBtn>
        ))}
        <SlippageBtn
          active={![0.1, 0.5, 1].includes(slippage)}
          onClick={() => {
            const custom = prompt('Enter custom slippage %', slippage);
            if (custom && !isNaN(custom)) setSlippage(Number(custom));
          }}
        >
          Custom
        </SlippageBtn>
      </SlippageRow>
      <PriceImpact impact={priceImpact}>Price Impact: {priceImpact}%</PriceImpact>
      {/* Swap button */}
      <SwapBtn
        onClick={handleSwap}
        disabled={!wallet || !fromAmount || loading}
      >
        {loading ? <Skeleton /> : 'Swap'}
      </SwapBtn>
      {/* Token select modal */}
      {showModal && (
        <ModalBg onClick={() => setShowModal(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <SearchInput
              autoFocus
              placeholder="Search token"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {filteredTokens.map((token) => (
              <TokenOption
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
              >
                <span style={{ fontSize: '1.3rem' }}>{token.logo}</span>
                {token.symbol} <span style={{ color: '#888', fontWeight: 400, marginLeft: 6 }}>{token.name}</span>
              </TokenOption>
            ))}
          </Modal>
        </ModalBg>
      )}
    </Card>
  );
};

export default SwapPage; 