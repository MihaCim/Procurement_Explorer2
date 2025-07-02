import React from 'react';
import styled from 'styled-components';

import AgenticFeedback from '../components/dueDiligence/AgenticFeedback';
import RiskProfile from '../components/dueDiligence/RiskProfile';
import StartNewAnalysisCard from '../components/dueDiligence/StartNewAnalysisCard';
import LoadingCard from '../components/LoadingCard';
import PageContainer from '../components/PageContainer';
import { useDueDiligenceContext } from '../context/DueDiligenceProvider';

const PageLayout = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1 0 0;
  align-self: stretch;
  height: 100%;
`;

const DueDiligencePage: React.FC = () => {
  const {
    state: { loadingCompany, profile },
  } = useDueDiligenceContext();

  return (
    <PageContainer id="due-diligence-page" className="h-full">
      {loadingCompany ? (
        <div className="w-full top-1/2 left-1/2">
          <LoadingCard text="Retrieving document structure" />
        </div>
      ) : (
        <PageLayout>
          {profile ? (
            <div className="flex flex-col self-stretch">
              <AgenticFeedback />
              <RiskProfile />
            </div>
          ) : (
            <StartNewAnalysisCard />
          )}
        </PageLayout>
      )}
    </PageContainer>
  );
};

export default DueDiligencePage;
