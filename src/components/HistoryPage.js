import React from 'react';
import styled from 'styled-components';

// Card container for glassmorphism
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

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  margin-bottom: 8px;
  text-align: center;
`;

const Empty = styled.div`
  color: ${({ theme }) => theme.accent2};
  text-align: center;
  margin-top: 18px;
  font-size: 1.1rem;
`;

// Main HistoryPage component (no data, just UI)
const HistoryPage = () => {
  return (
    <Card>
      <Title>History</Title>
      <Empty>No transactions found.</Empty>
    </Card>
  );
};

export default HistoryPage; 