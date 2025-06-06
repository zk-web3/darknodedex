import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// Dummy claim state
const CLAIM_LIMIT = 1;

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

// Progress bar animation
const progressAnim = keyframes`
  0% { width: 0; }
  100% { width: 100%; }
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.skeleton};
  border-radius: 6px;
  overflow: hidden;
  margin-top: 18px;
`;
const Progress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00e0ff 0%, #a259ff 100%);
  border-radius: 6px;
  animation: ${progressAnim} 1.2s linear;
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

// Main FaucetPage component
const FaucetPage = ({ wallet, notify, theme }) => {
  // Dummy state for claim
  const [claimed, setClaimed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);

  // Handle claim
  const handleClaim = () => {
    setLoading(true);
    setProgress(true);
    setTimeout(() => {
      setLoading(false);
      setProgress(false);
      setClaimed((c) => c + 1);
      notify('success', 'Faucet claimed! 100 Test USDC sent.');
    }, 1200);
  };

  return (
    <Card>
      <Title>Faucet</Title>
      {!wallet ? (
        <Info>Connect your wallet to claim test tokens.</Info>
      ) : claimed >= CLAIM_LIMIT ? (
        <Info style={{ color: theme.toastError }}>
          Faucet claim limit reached. Try again later.
        </Info>
      ) : (
        <Info>Get 100 Test USDC for development and testing.</Info>
      )}
      <ClaimBtn
        onClick={handleClaim}
        disabled={!wallet || claimed >= CLAIM_LIMIT || loading}
      >
        {loading ? <Skeleton /> : claimed >= CLAIM_LIMIT ? 'Claimed' : 'Claim 100 USDC'}
      </ClaimBtn>
      {progress && (
        <ProgressBar>
          <Progress />
        </ProgressBar>
      )}
    </Card>
  );
};

export default FaucetPage; 