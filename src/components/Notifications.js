import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Slide-in animation for toasts
const slideIn = keyframes`
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Toasts container (bottom right)
const ToastContainer = styled.div`
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 700px) {
    right: 8px;
    bottom: 8px;
  }
`;

// Single toast
const Toast = styled.div`
  min-width: 220px;
  max-width: 340px;
  padding: 18px 28px 18px 18px;
  border-radius: 14px;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  box-shadow: 0 2px 24px 0 ${({ type, theme }) =>
    type === 'success' ? theme.toastSuccess : theme.toastError}44;
  border-left: 5px solid ${({ type, theme }) =>
    type === 'success' ? theme.toastSuccess : theme.toastError};
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${slideIn} 0.4s cubic-bezier(0.4,0,0.2,1);
  backdrop-filter: blur(8px);
  position: relative;
`;

// Close button
const CloseBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

// Icon for toast
const Icon = styled.span`
  font-size: 1.3rem;
  margin-right: 4px;
`;

// Notifications component
const Notifications = ({ notifications, removeNotification }) => {
  useEffect(() => {
    // Auto-dismiss after 3.5s
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  return (
    <ToastContainer>
      {notifications.map((n) => (
        <Toast key={n.id} type={n.type}>
          <Icon>{n.type === 'success' ? '✔️' : '⚠️'}</Icon>
          {n.message}
          <CloseBtn onClick={() => removeNotification(n.id)}>&times;</CloseBtn>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default Notifications; 