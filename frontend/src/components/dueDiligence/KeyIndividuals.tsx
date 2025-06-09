import React from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';

const Content = styled.div`
  display: flex;
  direction: column;
  padding: 24px 16px;
  align-items: center;
  gap: 24px;
  align-self: stretch;
`;

const NormalText = styled.p``;

const BoldText = styled.p`
  font-weight: bold;
`;

const LightText = styled.p`
  font-weight: 300;
`;

const KeyIndividuals: React.FC = () => {
  const {
    state: { profile },
  } = useDueDiligenceContext();

  return (
    <Content>
      {profile?.key_individuals &&
        Object.keys(profile.key_individuals).map((value) => {
          const [name, ...description] =
            profile?.key_individuals[value].split(' - ');

          return (
            <div key={value}>
              <NormalText>{value}</NormalText>
              <BoldText>{name}</BoldText>
              <LightText>{description.join(' - ')}</LightText>
            </div>
          );
        })}
    </Content>
  );
};

export default KeyIndividuals;
