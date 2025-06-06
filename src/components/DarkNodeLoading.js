import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for the sweeping light ray
const sweep = keyframes`
  0% { left: -60%; }
  100% { left: 120%; }
`;

// Wrapper for centering
const Wrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(90deg, #0d0d0d 0%, #23272f 60%, #bfbfbf 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Glowing DarkNode text
const Title = styled.h1`
  font-size: 4rem;
  color: #fff;
  text-shadow: 0 0 16px #00e0ff, 0 0 32px #00e0ff, 0 0 2px #fff;
  letter-spacing: 0.1em;
  margin-bottom: 36px;
  font-family: 'Poppins', 'Inter', Arial, sans-serif;
  font-weight: 700;
`;

// Light ray container
const RayContainer = styled.div`
  position: relative;
  width: 340px;
  height: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 24px 0 #00e0ff33;
`;

// Sweeping ray
const Ray = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, rgba(255,255,255,0.0) 0%, #fff 50%, rgba(0,224,255,0.7) 100%);
  filter: blur(2px);
  border-radius: 8px;
  animation: ${sweep} 1.6s cubic-bezier(0.4,0,0.2,1) infinite;
`;

// Loading component
const DarkNodeLoading = () => (
  <Wrapper>
    <Title>DarkNode</Title>
    <RayContainer>
      <Ray />
    </RayContainer>
  </Wrapper>
);

export default DarkNodeLoading; 