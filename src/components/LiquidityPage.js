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

// Dummy pool stats
const DUMMY_POOLS = {
  'ETH-USDC': { tvl: 1200000, apy: 8.2, userShare: 0.12 },
  'ETH-DAI': { tvl: 800000, apy: 6.5, userShare: 0.08 },
  'WBTC-ETH': { tvl: 400000, apy: 10.1, userShare: 0.02 },
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
  max-width: 440px;
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

const Tabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
`;

const Tab = styled.button`
  background: ${({ active, theme }) => (active ? theme.accent : theme.glass)};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  border: none;
  border-radius: 8px 8px 0 0;
  padding: 10px 28px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: ${({ active, theme }) =>
    active ? `0 0 8px 0 ${theme.accent}` : 'none'};
  transition: background 0.2s, color 0.2s;
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
  font-size: 1.2rem;
  font-weight: 600;
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
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
  padding: 8px 14px;
  cursor: pointer;
  box-shadow: 0 0 8px 0 ${({ theme }) => theme.accent}22;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover {
    border: 1.5px solid ${({ theme }) => theme.accent};
    box-shadow: 0 0 12px 0 ${({ theme }) => theme.accent}55;
  }
`;

const PoolStats = styled.div`
  background: ${({ theme }) => theme.glass};
  border-radius: 12px;
  padding: 14px 18px;
  margin-top: 10px;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 0 8px 0 ${({ theme }) => theme.accent2}22;
`;

const ActionBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
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
  height: 22px;
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

// Main LiquidityPage component
const LiquidityPage = ({ wallet, notify, theme }) => {
  // State for add/remove, tokens, amounts
  const [tab, setTab] = useState('add');
  const [tokenA, setTokenA] = useState(TOKENS[0]);
  const [tokenB, setTokenB] = useState(TOKENS[1]);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(null); // 'A' or 'B' or null
  const [search, setSearch] = useState('');

  // Dummy pool key
  const poolKey = `${tokenA.symbol}-${tokenB.symbol}`;
  const poolStats = DUMMY_POOLS[poolKey] || { tvl: 0, apy: 0, userShare: 0 };

  // Dummy balances
  const balances = wallet ? DUMMY_BALANCES : {};

  // Handle add/remove
  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAmountA('');
      setAmountB('');
      notify('success', `${tab === 'add' ? 'Added' : 'Removed'} liquidity for ${tokenA.symbol}/${tokenB.symbol}`);
    }, 1600);
  };

  // Handle token select
  const handleTokenSelect = (token) => {
    if (showModal === 'A') setTokenA(token);
    else setTokenB(token);
    setShowModal(null);
    setSearch('');
  };

  // Dummy ratio for paired input
  React.useEffect(() => {
    if (!amountA) setAmountB('');
    else setAmountB((parseFloat(amountA) * 1.01).toFixed(4));
  }, [amountA, tokenA, tokenB]);

  // Filter tokens for modal
  const filteredTokens = TOKENS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      {/* Tabs */}
      <Tabs>
        <Tab active={tab === 'add'} onClick={() => setTab('add')}>Add</Tab>
        <Tab active={tab === 'remove'} onClick={() => setTab('remove')}>Remove</Tab>
      </Tabs>
      {/* Token A */}
      <Section>
        <LabelRow>
          <Label>Token A</Label>
          <Balance>
            {wallet ? `Balance: ${balances[tokenA.symbol] ?? 0}` : 'Connect wallet'}
          </Balance>
        </LabelRow>
        <InputRow>
          <AmountInput
            type="number"
            min="0"
            placeholder="0.0"
            value={amountA}
            onChange={e => setAmountA(e.target.value)}
            disabled={!wallet || loading}
          />
          <TokenSelector onClick={() => setShowModal('A')}>
            <span style={{ fontSize: '1.3rem' }}>{tokenA.logo}</span>
            {tokenA.symbol}
          </TokenSelector>
        </InputRow>
      </Section>
      {/* Token B */}
      <Section>
        <LabelRow>
          <Label>Token B</Label>
          <Balance>
            {wallet ? `Balance: ${balances[tokenB.symbol] ?? 0}` : 'Connect wallet'}
          </Balance>
        </LabelRow>
        <InputRow>
          <AmountInput
            type="number"
            min="0"
            placeholder="0.0"
            value={amountB}
            onChange={e => setAmountB(e.target.value)}
            disabled
          />
          <TokenSelector onClick={() => setShowModal('B')}>
            <span style={{ fontSize: '1.3rem' }}>{tokenB.logo}</span>
            {tokenB.symbol}
          </TokenSelector>
        </InputRow>
      </Section>
      {/* Pool stats */}
      <PoolStats>
        <div>TVL: ${poolStats.tvl.toLocaleString()}</div>
        <div>APY: {poolStats.apy}%</div>
        <div>Your Share: {poolStats.userShare}%</div>
      </PoolStats>
      {/* Action button */}
      <ActionBtn
        onClick={handleAction}
        disabled={!wallet || !amountA || loading}
      >
        {loading ? <Skeleton /> : tab === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
      </ActionBtn>
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

export default LiquidityPage; 