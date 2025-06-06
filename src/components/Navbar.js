import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';

// Navigation links
const NAV_LINKS = [
  { key: 'swap', label: 'Swap' },
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'faucet', label: 'Faucet' },
  { key: 'history', label: 'History' },
];

// Navbar wrapper
const NavBar = styled.nav`
  position: sticky;
  top: 0;
  width: 100vw;
  z-index: 100;
  background: ${({ theme }) => theme.navBg};
  box-shadow: ${({ theme }) => theme.shadow};
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 68px;
  @media (max-width: 700px) {
    padding: 0 12px;
  }
`;

// Brand
const Brand = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  text-shadow: 0 0 12px ${({ theme }) => theme.accent}, 0 0 2px #fff;
  letter-spacing: 0.08em;
  font-family: 'Poppins', 'Inter', Arial, sans-serif;
  cursor: pointer;
`;

// Nav links container
const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  @media (max-width: 900px) {
    gap: 16px;
  }
  @media (max-width: 700px) {
    display: none;
  }
`;

// Single nav link
const NavLink = styled.button`
  background: none;
  border: none;
  color: ${({ active, theme }) => (active ? theme.navActive : theme.navText)};
  font-size: 1.1rem;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: ${({ active, theme }) =>
    active ? `0 0 8px 0 ${theme.accent}` : 'none'};
  transition: color 0.2s, box-shadow 0.2s;
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
`;

// Wallet connect button
const WalletBtn = styled.button`
  background: ${({ theme }) => theme.accent};
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  margin-left: 18px;
  font-size: 1rem;
  box-shadow: 0 0 8px 0 ${({ theme }) => theme.accent};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.accent2};
  }
`;

// Theme toggle button
const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  font-size: 1.5rem;
  margin-left: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
`;

// Hamburger menu for mobile
const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  font-size: 2rem;
  margin-left: 18px;
  cursor: pointer;
  @media (max-width: 700px) {
    display: block;
  }
`;

// Mobile nav overlay
const MobileNav = styled.div`
  display: ${({ open }) => (open ? 'flex' : 'none')};
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; right: 0;
  background: ${({ theme }) => theme.navBg};
  box-shadow: ${({ theme }) => theme.shadow};
  z-index: 200;
  padding: 24px 0 12px 0;
  align-items: center;
  gap: 18px;
  @media (min-width: 701px) {
    display: none;
  }
`;

// Navbar component
const Navbar = ({ page, setPage, theme, setTheme, wallet, onWalletConnect, shortenAddress }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle nav link click
  const handleNav = (key) => {
    setPage(key);
    setMobileOpen(false);
  };

  return (
    <NavBar>
      <Brand onClick={() => setPage('swap')}>DarkNode</Brand>
      <Links>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.key}
            active={page === link.key}
            onClick={() => handleNav(link.key)}
          >
            {link.label}
          </NavLink>
        ))}
      </Links>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ThemeToggle
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </ThemeToggle>
        <WalletBtn onClick={onWalletConnect}>
          {wallet ? shortenAddress(wallet) : 'Connect Wallet'}
        </WalletBtn>
        <Hamburger onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <FiX /> : <FiMenu />}
        </Hamburger>
      </div>
      <MobileNav open={mobileOpen}>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.key}
            active={page === link.key}
            onClick={() => handleNav(link.key)}
            style={{ fontSize: '1.3rem', width: '100%' }}
          >
            {link.label}
          </NavLink>
        ))}
        <WalletBtn onClick={onWalletConnect} style={{ width: '90%' }}>
          {wallet ? shortenAddress(wallet) : 'Connect Wallet'}
        </WalletBtn>
        <ThemeToggle
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{ alignSelf: 'center' }}
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </ThemeToggle>
      </MobileNav>
    </NavBar>
  );
};

export default Navbar; 