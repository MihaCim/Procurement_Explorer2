import React from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import Label from '../forms/Label';
import Skeleton from '../Skeleton';
import { H2 } from '../Typography';
import DictionaryContent from './DictionaryContent';

const Container = styled.div`
  display: flex;

  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;

  border: 1px solid var(--stroke, #ebebf1);
  background: rgba(255, 255, 255, 0.5);
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

const RiskProfile: React.FC = () => {
  const {
    state: { company, loadingCompany, profile },
  } = useDueDiligenceContext();

  return (
    <Container>
      <Title>Risk Profile : {profile?.url}</Title>
      <SubContent>
        <H2>Company information</H2>

        <OneColDiv>
          <Label
            textTitle="Name"
            textContent={profile?.name ?? '-'}
            loading={!profile?.name && profile?.status === 'running'}
          />
          <Label
            textTitle="Founder"
            textContent={profile?.founder ?? '-'}
            loading={!profile?.founder && profile?.status === 'running'}
          />
          <Label
            textTitle="Founded"
            textContent={profile?.founded ?? '-'}
            loading={!profile?.founded && profile?.status === 'running'}
          />
          <Label
            textTitle="Address"
            textContent={
              profile?.address
                ? typeof profile.address === 'string'
                  ? profile.address
                  : Object.values(profile.address).join(' ').trim() !== ''
                    ? Object.values(profile.address).join(' ')
                    : '-'
                : '-'
            }
            loading={!profile?.address && profile?.status === 'running'}
          />
          {company && (
            <>
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
            </>
          )}
        </OneColDiv>
      </SubContent>
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
            value={profile?.security_risk}
            pending={profile?.status === 'running'}
          />

          <DictionaryContent
            title={'Operational risks'}
            value={profile?.operational_risk}
            pending={profile?.status === 'running'}
          />

          <DictionaryContent
            title={'Financial risks'}
            value={profile?.financial_risk}
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

          <DictionaryContent
            title={'Risk level'}
            value={profile?.risk_level}
            pending={profile?.status === 'running'}
          />
        </div>
      </SubContent>
    </Container>
  );
};

export default RiskProfile;
