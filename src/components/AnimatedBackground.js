import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for animated gradient movement
const move = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Animated, glassy background
const Bg = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(120deg, #0d0d0d 0%, #23272f 40%, #1a2a3a 70%, #00e0ff33 100%);
  background-size: 200% 200%;
  animation: ${move} 12s ease-in-out infinite;
  filter: blur(0.5px) brightness(1.08);
  opacity: 0.98;
  pointer-events: none;
`;

// Optional glass overlay for extra effect
const Glass = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1;
  background: linear-gradient(120deg, rgba(0,224,255,0.08) 0%, rgba(162,89,255,0.07) 100%);
  backdrop-filter: blur(8px);
  pointer-events: none;
`;

// AnimatedBackground component
const AnimatedBackground = () => (
  <>
    <Bg />
    <Glass />
  </>
);

export default AnimatedBackground; 