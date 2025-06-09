import React from 'react';
import styled from 'styled-components';

import { CircularProgress } from './CircularProgress';

export interface ILoadingCardProps {
  text: string;
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 20px;
  border-radius: var(--radius-small, 4px);
  border: 1px solid #ebebf1;
  background: var(--background-card, #fff);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const LoadingText = styled.p`
  margin-top: 10px;
`;

const LoadingCard: React.FC<ILoadingCardProps> = ({ text }) => {
  return (
    <>
      <ContentContainer>
        <CircularProgress />
        <LoadingText>{text}</LoadingText>
      </ContentContainer>
    </>
  );
};

export default LoadingCard;
