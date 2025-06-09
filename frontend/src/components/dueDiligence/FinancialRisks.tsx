import React from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import Skeleton from '../Skeleton';
import { H2 } from '../Typography';
import KeyIndividuals from './KeyIndividuals';
import ResultCard from './ResultCard';
import RiskStatusContent from './RiskStatusContent';
import RatingStars from '../RatingStars';

const FinancialRisksLayout = styled.div`
  display: flex;
  padding: 24px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 18px;
  align-self: stretch;
  border-radius: var(--radius-radius-small, 4px);
  border: 1px solid #ebebf1;
  background: var(--Color-background-card, #fff);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const FinancialRisks: React.FC = () => {
  const {
    state: { loading, risk_level },
  } = useDueDiligenceContext();

  return loading ? (
    <FinancialRisksLayout>
      <H2>Due diligence results</H2>
      <ResultCard title="Key individuals">
        <Skeleton height={150} />
      </ResultCard>
      <ResultCard title="Risk status">
        <Skeleton height={350} />
      </ResultCard>
    </FinancialRisksLayout>
  ) : (
    <FinancialRisksLayout>
      <H2>Due diligence results</H2>

      <ResultCard title="Key individuals">
        <KeyIndividuals />
      </ResultCard>
      <ResultCard
        title="Risk status"
        additionalContent={<RatingStars max={5} value={risk_level} invert />}
      >
        <RiskStatusContent />
      </ResultCard>
    </FinancialRisksLayout>
  );
};

export default FinancialRisks;
