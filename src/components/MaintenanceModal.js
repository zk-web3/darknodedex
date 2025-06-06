import React from 'react';
import styled from 'styled-components';

// Modal background overlay
const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Modal box
const ModalBox = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 18px;
  box-shadow: 0 0 32px 0 ${({ theme }) => theme.accent}55;
  padding: 38px 32px 28px 32px;
  min-width: 280px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: ${({ theme }) => theme.border};
  backdrop-filter: blur(16px);
`;

const Title = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  margin-bottom: 18px;
  text-align: center;
`;

const CloseBtn = styled.button`
  margin-top: 18px;
  background: ${({ theme }) => theme.accent};
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.08rem;
  box-shadow: 0 0 12px 0 ${({ theme }) => theme.accent};
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.accent2};
  }
`;

// MaintenanceModal component
const MaintenanceModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <Overlay>
      <ModalBox>
        <Title>The App Is Under Maintenance.</Title>
        <CloseBtn onClick={onClose}>Close</CloseBtn>
      </ModalBox>
    </Overlay>
  );
};

export default MaintenanceModal; 