import React from 'react';
import styled from 'styled-components';

import NoProfileFoundIcon from '../../assets/icons/profile_not_found.svg?react';
import PrimaryButton from '../PrimaryButton';

const Container = styled.div`
  display: flex;
  padding: 80px 24px 16px 24px;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
  align-self: stretch;

  border-radius: var(--radius-radius-small, 4px);
  border: 1px solid #ebebf1;
  background: var(--Color-background-card, #fff);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const InfoFrame = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StartNewAnalysisCard: React.FC = () => {
  return (
    <Container>
      <InfoFrame>
        <NoProfileFoundIcon />
        <p>No due diligence started yet</p>
      </InfoFrame>
      <PrimaryButton onClick={() => {}}>Start due diligence</PrimaryButton>
    </Container>
  );
};

export default StartNewAnalysisCard;
