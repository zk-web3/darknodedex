import React from 'react';
import styled from 'styled-components';

// Card container for glassmorphism
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

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  margin-bottom: 8px;
  text-align: center;
`;

const Info = styled.div`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
  margin-bottom: 12px;
`;

const ClaimBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  font-weight: 700;
  font-size: 1.2rem;
  border: none;
  border-radius: 12px;
  padding: 16px 0;
  margin-top: 10px;
  box-shadow: 0 0 16px 0 ${({ theme }) => theme.accent}55;
  cursor: not-allowed;
  opacity: 0.7;
`;

// Main FaucetPage component (no data, just UI)
const FaucetPage = () => {
  return (
    <Card>
      <Title>Faucet</Title>
      <Info>Connect your wallet to claim test tokens.</Info>
      <ClaimBtn disabled>Claim 100 USDC</ClaimBtn>
    </Card>
  );
};

export default FaucetPage; 