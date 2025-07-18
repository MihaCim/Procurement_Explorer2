import React from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import { isStatusGenerated } from '../../models/DueDiligenceProfile';
import EditableParagraph from '../forms/editableLabeledValue/EditableParagraph';
import LabeledValue from '../forms/editableLabeledValue/LabeledValue';
import Skeleton from '../Skeleton';
import { H2 } from '../Typography';
import DictionaryContent from './DictionaryContent';
import RiskLevel from './RiskLevel';

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
    updateProfileKey,
    updateCompanyKey,
  } = useDueDiligenceContext();

  return (
    <Container>
      <div className="flex flex-col gap-4 w-full">
        <Title>Risk Profile : {profile?.url}</Title>
        {profile?.risk_level &&
        typeof profile.risk_level === 'number' &&
        !isNaN(profile.risk_level) ? (
          <div className="">
            <RiskLevel level={profile.risk_level} />{' '}
          </div>
        ) : null}
      </div>

      <SubContent>
        <H2>Company information</H2>

        <OneColDiv>
          <LabeledValue
            textTitle="Name"
            textContent={profile?.name ?? '-'}
            loading={!profile?.name && profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('name', value)}
          />
          <LabeledValue
            textTitle="Founder"
            textContent={profile?.founder ?? '-'}
            loading={!profile?.founder && profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('founder', value)}
          />
          <LabeledValue
            textTitle="Founded"
            textContent={profile?.founded ?? '-'}
            loading={!profile?.founded && profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('founded', value)}
          />
          <DictionaryContent
            title={'Address'}
            titleStyle="small"
            value={profile?.address}
            pending={!profile?.address && profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('address', value)}
          />
          {company && (
            <>
              <LabeledValue
                textTitle="Industry"
                textContent={company?.industry ?? '-'}
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) => updateCompanyKey('industry', value)}
              />
              <LabeledValue
                textTitle="SubIndustry"
                textContent={company?.details?.subindustry ?? '-'}
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) =>
                  updateCompanyKey('details.subindustry', value)
                }
              />
              <LabeledValue
                textTitle="Company size"
                textContent={company?.details?.companySize ?? '-'}
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) =>
                  updateCompanyKey('details.companySize', value)
                }
              />
              <LabeledValue
                textTitle="Specializations"
                textContent={
                  company?.details?.specializations?.join(', ') ?? '-'
                }
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) =>
                  updateCompanyKey(
                    'details.specializations',
                    value?.split(',') ?? [],
                  )
                }
              />

              <LabeledValue
                textTitle="Product portfolio"
                textContent={
                  company?.details?.productPortfolio?.join(', ') ?? '-'
                }
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) =>
                  updateCompanyKey(
                    'details.productPortfolio',
                    value?.split(',') ?? [],
                  )
                }
              />
              <LabeledValue
                textTitle="Services portfolio"
                textContent={
                  company?.details?.servicePortfolio?.join(', ') ?? '-'
                }
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) =>
                  updateCompanyKey(
                    'details.servicePortfolio',
                    value?.split(',') ?? [],
                  )
                }
              />
              <LabeledValue
                textTitle="Specific tools and technologies"
                textContent={
                  company?.details?.specific_tools_and_technologies?.join(
                    ', ',
                  ) ?? '-'
                }
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) =>
                  updateCompanyKey(
                    'details.specific_tools_and_technologies',
                    value?.split(',') ?? [],
                  )
                }
              />
              <LabeledValue
                textTitle="Quality standards"
                textContent={
                  company?.details?.qualityStandards?.join(', ') ?? '-'
                }
                loading={loadingCompany}
                editable={isStatusGenerated(profile?.status)}
                onSave={(value) =>
                  updateCompanyKey(
                    'details.qualityStandards',
                    value?.split(',') ?? [],
                  )
                }
              />
            </>
          )}
        </OneColDiv>
      </SubContent>
      <SubContent>
        <H2>Description</H2>
        {!profile?.description && profile?.status === 'running' ? (
          <Skeleton height={150} />
        ) : isStatusGenerated(profile?.status) ? (
          <EditableParagraph
            initialText={
              profile?.description && String(profile?.description).trim() === ''
                ? 'No content'
                : String(profile?.description)
            }
            onSave={(value) => updateProfileKey('description', value)}
          />
        ) : (
          <p className="w-full">{profile?.description ?? '-'}</p>
        )}
      </SubContent>

      <SubContent>
        <H2>Risks and critical connections</H2>
        <div className="flex flex-1 flex-col gap-10 self-stretch">
          <DictionaryContent
            title={'Security risks'}
            value={profile?.security_risk}
            pending={profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('security_risk', value)}
          />

          <DictionaryContent
            title={'Operational risks'}
            value={profile?.operational_risk}
            pending={profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('operational_risk', value)}
          />

          <DictionaryContent
            title={'Financial risks'}
            value={profile?.financial_risk}
            pending={profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('financial_risk', value)}
          />

          <DictionaryContent
            title={'Key individuals'}
            value={profile?.key_individuals}
            pending={profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('key_individuals', value)}
          />

          <DictionaryContent
            title={'Key relationships'}
            value={profile?.key_relationships}
            pending={profile?.status === 'running'}
            editable={isStatusGenerated(profile?.status)}
            onSave={(value) => updateProfileKey('key_relationships', value)}
          />
        </div>
      </SubContent>
    </Container>
  );
};

export default RiskProfile;
