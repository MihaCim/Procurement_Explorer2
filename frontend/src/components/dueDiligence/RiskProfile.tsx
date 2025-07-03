import React from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
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

  border: 1px solid var(--stroke, #ebebf1);
  background: rgba(255, 255, 255, 0.5);
`;

const TwoColDiv = styled.div`
  display: flex;
  align-items: flex-start;
  align-content: flex-start;
  column-gap: 80px;
  row-gap: 12px;
  align-self: stretch;
  flex-wrap: wrap;
`;

const OneColDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  flex: 1 0 45%;
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

const MAX_DEPTH = 3;

interface IDictionaryContentProps {
  title: string;
  value?: Record<string, unknown>;
  pending: boolean;
}

function isRecordStringUnknown(
  value: unknown,
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  return proto.constructor === Object;
}

const renderSubDictionnary = (
  content: Record<string, unknown>,
  depth: number,
) => {
  if (depth > MAX_DEPTH) {
    return <span style={{ color: 'gray' }}>[Max Depth Exceeded]</span>;
  }
  if (Object.keys(content).length === 0) {
    return <span>None</span>; // Display "None" for empty objects
  }

  return (
    <ul>
      {Object.entries(content).map(([key, value]) => (
        <li key={key}>
          {key}:{' '}
          {!value
            ? 'None'
            : isRecordStringUnknown(value)
              ? renderSubDictionnary(value, depth + 1)
              : String(value).trim() === ''
                ? 'None'
                : String(value)}
        </li>
      ))}
    </ul>
  );
};

const DictionaryContent: React.FC<IDictionaryContentProps> = ({
  title,
  value,
  pending,
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <H4>{title}:</H4>
      {value && Object.keys(value).length >= 0 ? (
        renderSubDictionnary(value, 0)
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
    state: { company, loadingCompany, profile },
  } = useDueDiligenceContext();

  return (
    <Container>
      <Title>Risk Profile : {profile?.url}</Title>
      {company && (
        <SubContent>
          <H2>Company information</H2>
          <TwoColDiv>
            <OneColDiv>
              <Label
                textTitle="Name"
                textContent={profile?.company_name ?? '-'}
                loading={profile?.status === 'running'}
              />
              <Label
                textTitle="Industry"
                textContent={company?.industry ?? '-'}
                loading={loadingCompany}
              />
              <Label
                textTitle="SubIndustry"
                textContent={company?.details?.subindustry ?? '-'}
                loading={loadingCompany}
              />
              <Label
                textTitle="Company size"
                textContent={company?.details?.companySize ?? '-'}
                loading={loadingCompany}
              />
              <Label
                textTitle="Specializations"
                textContent={
                  company?.details?.specializations?.join(', ') ?? '-'
                }
                loading={loadingCompany}
              />
            </OneColDiv>
            <OneColDiv>
              <Label
                textTitle="Adress"
                textContent={
                  profile?.address
                    ? Object.values(profile.address).join(' ')
                    : '-'
                }
                loading={profile?.status === 'running'}
              />
              <Label
                textTitle="Product portfolio"
                textContent={
                  company?.details?.productPortfolio?.join(', ') ?? '-'
                }
                loading={loadingCompany}
              />
              <Label
                textTitle="Services portfolio"
                textContent={
                  company?.details?.servicePortfolio?.join(', ') ?? '-'
                }
                loading={loadingCompany}
              />
              <Label
                textTitle="Specific tools and technologies"
                textContent={
                  company?.details?.specializations?.join(', ') ?? '-'
                }
                loading={loadingCompany}
              />
              <Label
                textTitle="Quality standards"
                textContent={
                  company?.details?.qualityStandards?.join(', ') ?? '-'
                }
                loading={loadingCompany}
              />
            </OneColDiv>
          </TwoColDiv>
        </SubContent>
      )}
      <SubContent>
        <H2>Description</H2>
        {!profile?.description && profile?.status === 'running' ? (
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
            value={profile?.security_risks}
            pending={profile?.status === 'running'}
          />

          <DictionaryContent
            title={'Operational risks'}
            value={profile?.operational_risks}
            pending={profile?.status === 'running'}
          />

          <DictionaryContent
            title={'Financial risks'}
            value={profile?.financial_risks}
            pending={profile?.status === 'running'}
          />

          <DictionaryContent
            title={'Key individuals'}
            value={profile?.key_individuals}
            pending={profile?.status === 'running'}
          />

          <DictionaryContent
            title={'Key relationships'}
            value={profile?.key_relationships}
            pending={profile?.status === 'running'}
          />
        </div>
      </SubContent>
    </Container>
  );
};

export default RiskProfile;
