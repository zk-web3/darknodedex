import React from 'react';
import styled from 'styled-components';

// Top bar navigation links
const NAV_LINKS = [
  { key: 'home', label: 'Home' },
  { key: 'swap', label: 'Swap' },
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'faucet', label: 'Faucet' },
  { key: 'history', label: 'History' },
];

// Top bar wrapper
const Bar = styled.nav`
  position: sticky;
  top: 0;
  width: 100vw;
  z-index: 100;
  background: ${({ theme }) => theme.navBg};
  box-shadow: ${({ theme }) => theme.shadow};
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 72px;
  @media (max-width: 700px) {
    padding: 0 10px;
    height: 60px;
  }
`;

// Brand text
const Brand = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.accent};
  text-shadow: 0 0 16px ${({ theme }) => theme.accent}, 0 0 2px #fff;
  letter-spacing: 0.12em;
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
`;

// Single nav link
const NavLink = styled.button`
  background: none;
  border: none;
  color: ${({ active, theme }) => (active ? theme.navActive : theme.navText)};
  font-size: 1.1rem;
  font-family: inherit;
  font-weight: 700;
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
  font-weight: 700;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  margin-left: 18px;
  font-size: 1.08rem;
  box-shadow: 0 0 12px 0 ${({ theme }) => theme.accent};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.accent2};
  }
`;

// TopBar component
const TopBar = ({ page, setPage, onWalletClick }) => {
  return (
    <Bar>
      <Brand onClick={() => setPage('home')}>DarkNode</Brand>
      <Links>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.key}
            active={page === link.key}
            onClick={() => setPage(link.key)}
          >
            {link.label}
          </NavLink>
        ))}
        <WalletBtn onClick={onWalletClick}>Connect Wallet</WalletBtn>
      </Links>
    </Bar>
  );
};

export default TopBar; 