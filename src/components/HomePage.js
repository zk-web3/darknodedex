import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// Glowing animation for subtitle
const glow = keyframes`
  0% { text-shadow: 0 0 16px #00e0ff, 0 0 2px #fff; }
  50% { text-shadow: 0 0 32px #a259ff, 0 0 8px #00e0ff; }
  100% { text-shadow: 0 0 16px #00e0ff, 0 0 2px #fff; }
`;

// Animated sliding line
const slide = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
`;

// Hero section wrapper
const Hero = styled.section`
  min-height: 60vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  padding-top: 80px;
  @media (max-width: 700px) {
    padding-top: 40px;
  }
`;

const Title = styled.h1`
  font-size: 3.8rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 32px #00e0ff, 0 0 2px #fff;
  letter-spacing: 0.12em;
  margin-bottom: 18px;
  font-family: 'Poppins', 'Inter', Arial, sans-serif;
  text-align: center;
  @media (max-width: 700px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #bfbfbf;
  margin-bottom: 38px;
  text-align: center;
  animation: ${glow} 2.5s infinite alternate;
  @media (max-width: 700px) {
    font-size: 1.1rem;
  }
`;

const GlassCard = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 32px;
  box-shadow: 0 0 48px 0 ${({ theme }) => theme.accent}33;
  padding: 48px 48px 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: ${({ theme }) => theme.border};
  backdrop-filter: blur(18px);
  margin-bottom: 32px;
  @media (max-width: 700px) {
    padding: 24px 8vw 18px 8vw;
    border-radius: 18px;
  }
`;

const OpenAppBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  font-weight: 800;
  font-size: 1.3rem;
  border: none;
  border-radius: 16px;
  padding: 20px 60px;
  margin-top: 32px;
  box-shadow: 0 0 24px 0 ${({ theme }) => theme.accent};
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  letter-spacing: 0.08em;
  &:hover {
    background: ${({ theme }) => theme.accent2};
    box-shadow: 0 0 32px 0 ${({ theme }) => theme.accent2};
  }
  @media (max-width: 700px) {
    font-size: 1.05rem;
    padding: 14px 28px;
    border-radius: 10px;
  }
`;

// Animated sliding line
const SlidingLine = styled.div`
  width: 220px;
  height: 4px;
  background: linear-gradient(90deg, #00e0ff 0%, #a259ff 100%);
  border-radius: 4px;
  margin: 32px auto 24px auto;
  animation: ${slide} 1.2s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 16px 0 #00e0ff99;
`;

// Chains section
const ChainsSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 48px;
  margin: 32px 0 0 0;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 18px;
    align-items: center;
  }
`;

const ChainCard = styled.div`
  background: ${({ theme }) => theme.glass};
  border-radius: 18px;
  box-shadow: 0 0 24px 0 ${({ theme }) => theme.accent}22;
  padding: 24px 38px;
  min-width: 220px;
  text-align: center;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.text};
  font-weight: 700;
  border: ${({ theme }) => theme.border};
  backdrop-filter: blur(10px);
`;

const ChainTitle = styled.div`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.accent2};
  margin-bottom: 8px;
  font-weight: 700;
`;

// Stats section
const StatsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
  margin: 48px 0 32px 0;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.glass};
  border-radius: 18px;
  box-shadow: 0 0 24px 0 ${({ theme }) => theme.accent2}22;
  padding: 28px 38px;
  min-width: 180px;
  text-align: center;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text};
  font-weight: 800;
  border: ${({ theme }) => theme.border};
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatLabel = styled.div`
  font-size: 1.05rem;
  color: ${({ theme }) => theme.accent};
  margin-top: 8px;
  font-weight: 600;
`;

// Footer
const Footer = styled.footer`
  width: 100vw;
  background: rgba(20,22,28,0.85);
  color: #bfbfbf;
  text-align: center;
  padding: 32px 0 18px 0;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  margin-top: 48px;
  box-shadow: 0 -2px 24px 0 #00e0ff11;
`;

// Glowing mouse cursor
const Cursor = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle, #00e0ff 60%, #a259ff 100%);
  box-shadow: 0 0 32px 8px #00e0ff99, 0 0 8px 2px #a259ff99;
  pointer-events: none;
  z-index: 99999;
  opacity: 0.7;
  transform: translate(-50%, -50%);
  transition: background 0.2s, box-shadow 0.2s;
`;

// HomePage component
const HomePage = ({ onOpenApp }) => {
  // Mouse cursor effect
  const cursorRef = useRef();
  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <Cursor ref={cursorRef} />
      <Hero>
        <GlassCard>
          <Title>DarkNode DEX</Title>
          <Subtitle>New Age Swap Experience<br />Futuristic, Fast, and Secure</Subtitle>
          <OpenAppBtn onClick={onOpenApp}>Open App</OpenAppBtn>
        </GlassCard>
        <SlidingLine />
        <ChainsSection>
          <ChainCard>
            <ChainTitle>Active Chains</ChainTitle>
            Building On Sepolia
          </ChainCard>
          <ChainCard>
            <ChainTitle>Ongoing Chains</ChainTitle>
            Building On Sepolia
          </ChainCard>
        </ChainsSection>
        <StatsSection>
          <StatCard>
            0
            <StatLabel>Liquidity</StatLabel>
          </StatCard>
          <StatCard>
            1
            <StatLabel>Active Chains</StatLabel>
          </StatCard>
          <StatCard>
            0
            <StatLabel>Liquidity Sources</StatLabel>
          </StatCard>
          <StatCard>
            0
            <StatLabel>Total Transactions</StatLabel>
          </StatCard>
          <StatCard>
            0
            <StatLabel>Total Volume</StatLabel>
          </StatCard>
        </StatsSection>
      </Hero>
      <Footer>
        2024 © DarkNode DEX. All rights reserved. | version: 1.0 - June '24
      </Footer>
    </>
  );
};

export default HomePage; 