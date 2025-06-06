import React, { useState, useEffect, useMemo } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import DarkNodeLoading from './components/DarkNodeLoading';
import Navbar from './components/Navbar';
import SwapPage from './components/SwapPage';
import LiquidityPage from './components/LiquidityPage';
import FaucetPage from './components/FaucetPage';
import HistoryPage from './components/HistoryPage';
import Notifications from './components/Notifications';

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
  skeleton: 'rgba(255,255,255,0.08)',
  toastSuccess: '#00e0ff',
  toastError: '#ff3b6e',
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
  skeleton: 'rgba(0,0,0,0.06)',
  toastSuccess: '#00b4d8',
  toastError: '#ff3b6e',
};

// Dummy wallet connect logic
const shortenAddress = (addr) => addr.slice(0, 6) + '...' + addr.slice(-4);

function App() {
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('swap');
  const [wallet, setWallet] = useState(null); // null or address string
  const [notifications, setNotifications] = useState([]);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Theme object memoized
  const themeObj = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);

  // Notification helpers
  const notify = (type, message) => {
    setNotifications((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), type, message },
    ]);
  };
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Wallet connect placeholder
  const handleWalletConnect = () => {
    if (wallet) setWallet(null);
    else setWallet('0xA1b2C3d4E5f6A7b8C9d0E1F2a3B4C5D6e7F8a9B0');
  };

  // Page render
  let content;
  if (page === 'swap')
    content = <SwapPage wallet={wallet} notify={notify} theme={themeObj} />;
  else if (page === 'liquidity')
    content = <LiquidityPage wallet={wallet} notify={notify} theme={themeObj} />;
  else if (page === 'faucet')
    content = <FaucetPage wallet={wallet} notify={notify} theme={themeObj} />;
  else if (page === 'history')
    content = <HistoryPage wallet={wallet} notify={notify} theme={themeObj} />;

  return (
    <ThemeProvider theme={themeObj}>
      <GlobalStyle />
      {loading ? (
        <DarkNodeLoading />
      ) : (
        <>
          <Navbar
            page={page}
            setPage={setPage}
            theme={theme}
            setTheme={setTheme}
            wallet={wallet}
            onWalletConnect={handleWalletConnect}
            shortenAddress={shortenAddress}
          />
          <MainContent>
            {content}
          </MainContent>
          <Notifications
            notifications={notifications}
            removeNotification={removeNotification}
          />
        </>
      )}
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