import React from 'react';
import styled from 'styled-components';

import { CircularProgress } from '../CircularProgress';
import BaseModal from './BaseModal';

export interface IInitializatioModalProps {
  isOpen: boolean;
}

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  align-self: stretch;
`;

const InitializatioText = styled.h4`
  color: var(--color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.18px;
`;

const InitializationModal: React.FC<IInitializatioModalProps> = ({
  isOpen,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={() => {}}
      labelledby={'Initialisation Modal'}
      describedby={'Initializing document'}
    >
      <ContentContainer>
        <CircularProgress />
        <InitializatioText>Initializing document</InitializatioText>
        <p>
          Please wait while the document is being prepared. This may take a few
          minutes.
        </p>
      </ContentContainer>
    </BaseModal>
  );
};

export default InitializationModal;
