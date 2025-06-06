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

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AmountInput = styled.input`
  flex: 1;
  font-size: 1.5rem;
  font-weight: 600;
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  outline: none;
  box-shadow: 0 0 0 1.5px ${({ theme }) => theme.accent}33;
  transition: box-shadow 0.2s;
  &:focus {
    box-shadow: 0 0 0 2.5px ${({ theme }) => theme.accent};
  }
`;

const TokenSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.glass};
  color: ${({ theme }) => theme.text};
  border: ${({ theme }) => theme.border};
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 10px 16px;
  cursor: pointer;
  box-shadow: 0 0 8px 0 ${({ theme }) => theme.accent}22;
  transition: border 0.2s, box-shadow 0.2s;
  &:hover {
    border: 1.5px solid ${({ theme }) => theme.accent};
    box-shadow: 0 0 12px 0 ${({ theme }) => theme.accent}55;
  }
`;

const SwapIcon = styled.div`
  align-self: center;
  font-size: 2.1rem;
  color: ${({ theme }) => theme.accent};
  margin: 0 0 0 0;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.accent2}; }
`;

const SwapBtn = styled.button`
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
`;

// Main SwapPage component (no data, just UI)
const SwapPage = () => {
  return (
    <Card>
      {/* From token */}
      <Section>
        <Label>From</Label>
        <InputRow>
          <AmountInput type="number" min="0" placeholder="0.0" />
          <TokenSelector>Select Token</TokenSelector>
        </InputRow>
      </Section>
      {/* Swap icon */}
      <SwapIcon>⇅</SwapIcon>
      {/* To token */}
      <Section>
        <Label>To</Label>
        <InputRow>
          <AmountInput type="number" min="0" placeholder="0.0" disabled />
          <TokenSelector>Select Token</TokenSelector>
        </InputRow>
      </Section>
      {/* Swap button */}
      <SwapBtn>Swap</SwapBtn>
    </Card>
  );
};

export default SwapPage; 