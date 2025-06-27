import React from 'react';
import styled from 'styled-components';

import AgenticFeedback from '../components/dueDiligence/AgenticFeedback';
import DueDiligenceSidePanel from '../components/dueDiligence/DueDiligenceSidePanel';
import GeneralInformation from '../components/dueDiligence/GeneralInformation';
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
`;

const DueDiligencePage: React.FC = () => {
  const {
    state: { loading, company, profile },
    export: { targetRef },
  } = useDueDiligenceContext();

  return (
    <PageContainer id="due-diligence-page">
      {loading ? (
        <div className="w-full top-1/2 left-1/2">
          <LoadingCard text="Retrieving document structure" />
        </div>
      ) : (
        <PageLayout ref={targetRef}>
          <div id="sidepanel" className="z-50 sticky top-4">
            <DueDiligenceSidePanel />
          </div>

          {company?.status === 'Available' && profile ? (
            <div className="flex flex-col gap-2">
              <AgenticFeedback />
              <GeneralInformation />
            </div>
          ) : company?.status === 'Pending' ? (
            <>Pending status...loading...connecting to WebSockets</>
          ) : (
            <StartNewAnalysisCard />
          )}
        </PageLayout>
      )}
    </PageContainer>
  );
};

export default DueDiligencePage;
