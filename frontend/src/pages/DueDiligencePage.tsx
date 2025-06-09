import React from 'react';
import styled from 'styled-components';

import DueDiligenceSidePanel from '../components/dueDiligence/DueDiligenceSidePanel';
import FinancialRisks from '../components/dueDiligence/FinancialRisks';
import GeneralInformation from '../components/dueDiligence/GeneralInformation';
import LoadingCard from '../components/LoadingCard';
import PageContainer from '../components/PageContainer';
import TitleWithBack from '../components/TitleWithBack';
import { useDueDiligenceContext } from '../context/DueDiligenceProvider';
const PageLayout = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1 0 0;
  align-self: stretch;
`;

const DetailLayout = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`;

const DueDiligencePage: React.FC = () => {
  const {
    state: { loading },
    export: { targetRef },
  } = useDueDiligenceContext();

  return (
    <PageContainer id="due-diligence-page">
      <TitleWithBack label="Due Diligence" />

      {loading ? (
        <div className="w-full top-1/2 left-1/2">
          <LoadingCard text="Retrieving document structure" />
        </div>
      ) : (
        <PageLayout ref={targetRef}>
          <div id="sidepanel" className="z-50 sticky top-4">
            <DueDiligenceSidePanel />
          </div>
          <DetailLayout>
            <GeneralInformation />
            <FinancialRisks />
          </DetailLayout>
        </PageLayout>
      )}
    </PageContainer>
  );
};

export default DueDiligencePage;
