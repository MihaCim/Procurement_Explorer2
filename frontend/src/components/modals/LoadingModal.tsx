import React from "react";
import styled from "styled-components";

import { CircularProgress } from "../CircularProgress";

export interface ILoadingModalProps {
  isOpen: boolean;
  text: string;
}

const ModalContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
`;

const LoadingText = styled.p`
  margin-top: 10px;
`;

const LoadingModal: React.FC<ILoadingModalProps> = ({ isOpen, text }) => {
  return (
    <>
      {isOpen && (
        <ModalContainer>
          <ContentContainer>
            <CircularProgress />
            <LoadingText>{text}</LoadingText>
          </ContentContainer>
        </ModalContainer>
      )}
    </>
  );
};

export default LoadingModal;
