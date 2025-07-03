import React from 'react';
import styled from 'styled-components';

import NoProfileFoundIcon from '../../assets/icons/profile_not_found.svg?react';
import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import InitializationModal from '../modals/InitializationModal';
import StartGatheringInfoModal from '../modals/StartGatheringInfoModal';
import PrimaryButton from '../PrimaryButton';

const Container = styled.div`
  display: flex;
  padding: 80px 24px 16px 24px;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
  align-self: stretch;
  flew-grow: 1;
  max-height: 1000px;

  border-radius: var(--radius-radius-small, 4px);
  border: 1px solid #ebebf1;
  background: var(--Color-new-bg-card, rgba(255, 255, 255, 0.58));

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
  const {
    state: { company, loadingCompany, profile_initiating },
    startDueDiligence,
  } = useDueDiligenceContext();

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <>
      <Container>
        <InfoFrame>
          <NoProfileFoundIcon />
          <p>No information gathered yet</p>
        </InfoFrame>
        <PrimaryButton
          btnProps={{ disabled: !!loadingCompany }}
          onClick={() => {
            if (company?.website) startDueDiligence(company?.website);
            else setIsModalOpen(true);
          }}
        >
          Start gathering information
        </PrimaryButton>
      </Container>

      <StartGatheringInfoModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onConfirm={(url) => {
          setIsModalOpen(false);
          startDueDiligence(url);
        }}
      />

      <InitializationModal isOpen={profile_initiating} />
    </>
  );
};

export default StartNewAnalysisCard;
