import React from 'react';
import styled, { keyframes } from 'styled-components';

// Glowing animation for subtitle
const glow = keyframes`
  0% { text-shadow: 0 0 16px #00e0ff, 0 0 2px #fff; }
  50% { text-shadow: 0 0 32px #a259ff, 0 0 8px #00e0ff; }
  100% { text-shadow: 0 0 16px #00e0ff, 0 0 2px #fff; }
`;

// Hero section wrapper
const Hero = styled.section`
  min-height: 80vh;
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

// HomePage component
const HomePage = ({ onOpenApp }) => (
  <Hero>
    <GlassCard>
      <Title>DarkNode DEX</Title>
      <Subtitle>_New Age_ Swap Experience<br />Futuristic, Fast, and Secure</Subtitle>
      <OpenAppBtn onClick={onOpenApp}>Open App</OpenAppBtn>
    </GlassCard>
  </Hero>
);

export default HomePage; 