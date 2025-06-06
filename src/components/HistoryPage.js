import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// Dummy transaction data
const DUMMY_TXS = [
  { id: 1, type: 'Swap', date: '2025-06-06', desc: 'Swapped 1.2 ETH for 4200 USDC', status: 'Success' },
  { id: 2, type: 'Add', date: '2025-06-05', desc: 'Added liquidity ETH/USDC', status: 'Success' },
  { id: 3, type: 'Remove', date: '2025-06-04', desc: 'Removed liquidity ETH/DAI', status: 'Success' },
  { id: 4, type: 'Faucet', date: '2025-06-03', desc: 'Claimed 100 USDC from faucet', status: 'Success' },
  { id: 5, type: 'Swap', date: '2025-06-02', desc: 'Swapped 0.5 WBTC for 8 ETH', status: 'Success' },
  { id: 6, type: 'Swap', date: '2025-06-01', desc: 'Swapped 1000 REN for 0.1 ETH', status: 'Success' },
];

const TYPES = ['All', 'Swap', 'Add', 'Remove', 'Faucet'];

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
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: stretch;
  border: ${({ theme }) => theme.border};
  backdrop-filter: blur(18px);
  @media (max-width: 700px) {
    min-width: 0;
    padding: 18px 2vw 18px 2vw;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const FilterBtn = styled.button`
  background: ${({ active, theme }) => (active ? theme.accent : theme.glass)};
  color: ${({ active, theme }) => (active ? '#fff' : theme.text)};
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ active, theme }) =>
    active ? `0 0 8px 0 ${theme.accent}` : 'none'};
  transition: background 0.2s, color 0.2s;
`;

const DateInput = styled.input`
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 1rem;
  font-family: inherit;
  margin-left: 8px;
`;

const TxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TxItem = styled.div`
  background: ${({ theme }) => theme.glass};
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 0 8px 0 ${({ theme }) => theme.accent2}22;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.text};
`;

const TxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
`;

const Status = styled.span`
  color: ${({ theme }) => theme.accent};
  font-weight: 600;
  font-size: 0.98rem;
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

// Main HistoryPage component
const HistoryPage = ({ wallet, notify, theme }) => {
  // State for filters
  const [type, setType] = useState('All');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtered transactions
  const filtered = DUMMY_TXS.filter(
    (tx) =>
      (type === 'All' || tx.type === type) &&
      (!date || tx.date === date)
  );

  // Simulate loading
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [type, date]);

  return (
    <Card>
      <FiltersRow>
        {TYPES.map((t) => (
          <FilterBtn
            key={t}
            active={type === t}
            onClick={() => setType(t)}
          >
            {t}
          </FilterBtn>
        ))}
        <DateInput
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </FiltersRow>
      <TxList>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ color: theme.accent2, textAlign: 'center', marginTop: 18 }}>No transactions found.</div>
        ) : (
          filtered.map((tx) => (
            <TxItem key={tx.id}>
              <TxHeader>
                <span>{tx.type}</span>
                <Status>{tx.status}</Status>
              </TxHeader>
              <div style={{ fontWeight: 500 }}>{tx.desc}</div>
              <div style={{ fontSize: '0.98rem', color: '#888', marginTop: 2 }}>{tx.date}</div>
            </TxItem>
          ))
        )}
      </TxList>
    </Card>
  );
};

export default HistoryPage; 