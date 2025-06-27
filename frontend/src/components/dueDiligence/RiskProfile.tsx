import React from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import useRiskProfileWebsocket from '../../hooks/useRiskProfileWebsocket';
import Label from '../forms/Label';
import Skeleton from '../Skeleton';
import { H2, H4 } from '../Typography';

const Container = styled.div`
  display: flex;
  min-height: 700px;
  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;

  border-radius: var(--radius-small, 4px);
  border: 1px solid #ebebf1;
  background: var(--color-background-card, #fff);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const TwoColDiv = styled.div`
  display: flex;
  align-items: flex-start;
  align-content: flex-start;
  gap: 80px;
  align-self: stretch;
  flex-wrap: wrap;
`;

const OneColDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  flex: 1 0 0;
`;

const SubContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  flex: 1 0 0;
`;

const Title = styled.p`
  color: var(--Color-color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 22px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

interface IDictionaryContentProps {
  title: string;
  value?: Record<string, string>;
  pending: boolean;
}

const DictionaryContent: React.FC<IDictionaryContentProps> = ({
  title,
  value,
  pending,
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <H4>{title}:</H4>
      {value ? (
        <ul>
          {Object.entries(value).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      ) : pending ? (
        <Skeleton height={100} />
      ) : (
        <span>-</span>
      )}
    </div>
  );
};

const RiskProfile: React.FC = () => {
  const {
    state: { company, loading },
  } = useDueDiligenceContext();

  const { status, profile } = useRiskProfileWebsocket();

  return (
    <Container>
      <Title>AI Generated Risk Profile</Title>
      <SubContent>
        <H2>Company information</H2>
        <TwoColDiv>
          <OneColDiv>
            <Label
              textTitle="Industry"
              textContent={company?.industry ?? '-'}
              loading={loading}
            />
            <Label
              textTitle="SubIndustry"
              textContent={company?.details?.subindustry ?? '-'}
            />
            <Label
              textTitle="Company size"
              textContent={company?.details?.companySize ?? '-'}
            />
            <Label
              textTitle="Specializations"
              textContent={company?.details?.specializations?.join(', ') ?? '-'}
            />
          </OneColDiv>
          <OneColDiv>
            <Label
              textTitle="Product portfolio"
              textContent={
                company?.details?.productPortfolio?.join(', ') ?? '-'
              }
            />
            <Label
              textTitle="Services portfolio"
              textContent={
                company?.details?.servicePortfolio?.join(', ') ?? '-'
              }
            />
            <Label
              textTitle="Specific tools and technologies"
              textContent={company?.details?.specializations?.join(', ') ?? '-'}
            />
            <Label
              textTitle="Quality standards"
              textContent={
                company?.details?.qualityStandards?.join(', ') ?? '-'
              }
            />
          </OneColDiv>
        </TwoColDiv>
      </SubContent>
      <SubContent>
        <H2>Description</H2>
        {!profile?.description && status === 'PENDING' ? (
          <Skeleton height={150} />
        ) : (
          <p className="w-full">{profile?.description ?? '-'}</p>
        )}
      </SubContent>

      <SubContent>
        <H2>Risks and critical connections</H2>
        <div className="flex flex-1 flex-col gap-2 self-stretch">
          <DictionaryContent
            title={'Security risks'}
            value={profile?.security_risk}
            pending={status === 'PENDING'}
          />

          <DictionaryContent
            title={'Operational risks'}
            value={profile?.operational_risk}
            pending={status === 'PENDING'}
          />

          <DictionaryContent
            title={'Financial risks'}
            value={profile?.financial_risk}
            pending={status === 'PENDING'}
          />

          <DictionaryContent
            title={'Ties'}
            value={profile?.key_relationships}
            pending={status === 'PENDING'}
          />
        </div>
      </SubContent>
    </Container>
  );
};

export default RiskProfile;
