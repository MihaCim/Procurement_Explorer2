import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { ActionButtonsBar } from '../components/dueDiligence/ActionButtonsBar';
import AgenticFeedback from '../components/dueDiligence/AgenticFeedback';
import RestartLink from '../components/dueDiligence/RestartLink';
import RiskProfile from '../components/dueDiligence/RiskProfile';
import StartNewAnalysisCard from '../components/dueDiligence/StartNewAnalysisCard';
import StatusChip from '../components/dueDiligence/StatusChip';
import LoadingCard from '../components/LoadingCard';
import PageContainer from '../components/PageContainer';
import TitleWithBack from '../components/TitleWithBack';
import { useDueDiligenceContext } from '../context/DueDiligenceProvider';
import {
  isStatusGenerated,
  NOT_AVAILABLE_STATUS,
} from '../models/DueDiligenceProfile';

const PageLayout = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1 0 0;
  align-self: stretch;
  height: 100%;
  width: 100%;

  padding-bottom: 80px; /* Adjusted for sticky footer */
`;

const DueDiligencePage: React.FC = () => {
  const {
    state: { loadingCompany, profile, company, profile_initiating },
    startDueDiligence,
  } = useDueDiligenceContext();
  const navigate = useNavigate();

  console.log('DueDiligencePage rendered with profile:', profile);

  return (
    <PageContainer id="due-diligence-page" className="h-full">
      {loadingCompany ? (
        <div className="w-full top-1/2 left-1/2">
          <LoadingCard text="Retrieving document structure" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 h-full w-full">
          <div className="flex gap-2">
            <TitleWithBack
              label={
                profile?.name && profile?.name.trim().length > 0
                  ? profile.name
                  : 'Risk Profile'
              }
              onClick={() => navigate('/')}
            />
            <StatusChip
              status={profile?.status ?? company?.dd_status ?? 'not available'}
            />
            {isStatusGenerated(profile?.status) && profile?.url && (
              <RestartLink
                onConfirm={() => {
                  console.log('Restarting due diligence');
                  startDueDiligence(profile.url);
                }}
              >
                Restart process
              </RestartLink>
            )}
          </div>

          <PageLayout>
            {profile?.status &&
            profile?.status !== NOT_AVAILABLE_STATUS &&
            !profile_initiating ? (
              <div className="flex flex-col w-full">
                <AgenticFeedback />
                <RiskProfile />
                {isStatusGenerated(profile?.status) && <ActionButtonsBar />}
              </div>
            ) : (
              <StartNewAnalysisCard />
            )}
          </PageLayout>
        </div>
      )}
    </PageContainer>
  );
};

export default DueDiligencePage;
