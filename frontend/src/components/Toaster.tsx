import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

interface ToasterProps {
  message: string;
  show: boolean;
  isError?: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(100%);
  }
`;

const ToastContainer = styled.div<{ visible: boolean; isError: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${(props) => (props.isError ? '#F6E0E0' : '#ccebd3')};
  color: black;
  padding: 12px 24px;
  border-radius: 8px;
  opacity: 0;
  animation: ${(props) => (props.visible ? fadeIn : fadeOut)} 0.5s forwards;
  z-index: 1000;
`;

const Toaster: React.FC<ToasterProps> = ({
  message,
  show,
  isError = false,
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return visible ? (
    <ToastContainer visible={visible} isError={isError}>
      {message}
    </ToastContainer>
  ) : null;
};

export default Toaster;
