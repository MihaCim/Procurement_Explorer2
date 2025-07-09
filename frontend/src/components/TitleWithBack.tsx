import React from 'react';
import styled from 'styled-components';

import BackIcon from '../assets/icons/back.svg?react';
import { TitleContainer } from './TitleContainer';
import { H1 } from './Typography';

interface ITitleWithBackProps {
  label: string;
  onClick?: () => void;
}
const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const TitleWithBack: React.FC<ITitleWithBackProps> = ({ label, onClick }) => {
  const goBack = () => {
    window.history.back();
  };
  return (
    <TitleContainer>
      <Button type="button" onClick={onClick ?? goBack}>
        <BackIcon />
        <H1>{label}</H1>
      </Button>
    </TitleContainer>
  );
};

export default TitleWithBack;
