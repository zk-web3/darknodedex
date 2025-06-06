import React, { useState, useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import TopBar from './components/TopBar';
import AnimatedBackground from './components/AnimatedBackground';
import MaintenanceModal from './components/MaintenanceModal';
import HomePage from './components/HomePage';
import SwapPage from './components/SwapPage';
import LiquidityPage from './components/LiquidityPage';
import FaucetPage from './components/FaucetPage';
import HistoryPage from './components/HistoryPage';

// Global Styles with font and background gradient
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Poppins', 'Inter', Arial, sans-serif;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: background 0.5s, color 0.5s;
    min-height: 100vh;
    overflow-x: hidden;
  }
`;

// Theme definitions
const darkTheme = {
  background: 'linear-gradient(90deg, #0d0d0d 0%, #23272f 60%, #bfbfbf 100%)',
  card: 'rgba(30,34,40,0.7)',
  glass: 'rgba(40,44,54,0.5)',
  text: '#f8fafd',
  accent: '#00e0ff',
  accent2: '#a259ff',
  navBg: 'rgba(20,22,28,0.85)',
  navText: '#f8fafd',
  navActive: '#00e0ff',
  shadow: '0 8px 32px 0 rgba(0,224,255,0.15)',
  border: '1.5px solid rgba(0,224,255,0.15)',
  inputBg: 'rgba(30,34,40,0.8)',
};

const lightTheme = {
  background: 'linear-gradient(90deg, #bfbfbf 0%, #e6e6e6 100%)',
  card: 'rgba(255,255,255,0.7)',
  glass: 'rgba(255,255,255,0.5)',
  text: '#23272f',
  accent: '#00b4d8',
  accent2: '#a259ff',
  navBg: 'rgba(255,255,255,0.85)',
  navText: '#23272f',
  navActive: '#00b4d8',
  shadow: '0 8px 32px 0 rgba(0,180,216,0.10)',
  border: '1.5px solid rgba(0,180,216,0.10)',
  inputBg: 'rgba(255,255,255,0.8)',
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [page, setPage] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);

  // Theme object memoized
  const themeObj = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);

  // Navigation handler
  const handleNav = (key) => {
    setPage(key);
  };

  // Wallet connect handler (shows modal)
  const handleWalletClick = () => {
    setModalOpen(true);
  };

  // HomePage open app handler
  const handleOpenApp = () => {
    setPage('swap');
  };

  // Page render
  let content;
  if (page === 'home')
    content = <HomePage onOpenApp={handleOpenApp} />;
  else if (page === 'swap')
    content = <SwapPage />;
  else if (page === 'liquidity')
    content = <LiquidityPage />;
  else if (page === 'faucet')
    content = <FaucetPage />;
  else if (page === 'history')
    content = <HistoryPage />;

  return (
    <ThemeProvider theme={themeObj}>
      <GlobalStyle />
      <AnimatedBackground />
      <TopBar page={page} setPage={handleNav} onWalletClick={handleWalletClick} />
      <MainContent>
        {content}
      </MainContent>
      <MaintenanceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </ThemeProvider>
  );
}

// Main content wrapper with glassmorphism
const MainContent = styled.main`
  min-height: 90vh;
  padding: 32px 0 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
`;

export default App; 