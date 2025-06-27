import React from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import Label from '../forms/Label';
import Skeleton from '../Skeleton';
import { H2 } from '../Typography';

const GeneralInfoLayout = styled.div`
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
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
  gap: 24px;
  flex: 1 0 0;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  flex: 1 0 0;
`;

const GeneralInformation: React.FC = () => {
  const {
    state: { company, loading, profile },
  } = useDueDiligenceContext();

  return loading ? (
    <GeneralInfoLayout>
      <div className="w-full flex-1">
        <H2>General informations</H2>
      </div>
      <TwoColDiv>
        <OneColDiv>
          <Skeleton height={300} />
        </OneColDiv>
        <OneColDiv>
          <Skeleton height={300} />
        </OneColDiv>
      </TwoColDiv>
      <Details>
        <Skeleton height={300} />
      </Details>
    </GeneralInfoLayout>
  ) : (
    <GeneralInfoLayout>
      <H2>Company information</H2>
      <TwoColDiv>
        <OneColDiv>
          <Label textTitle="Industry" textContent={company?.industry ?? '-'} />
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
            textContent={company?.details?.productPortfolio?.join(', ') ?? '-'}
          />
          <Label
            textTitle="Services portfolio"
            textContent={company?.details?.servicePortfolio?.join(', ') ?? '-'}
          />
          <Label
            textTitle="Specific tools and technologies"
            textContent={company?.details?.specializations?.join(', ') ?? '-'}
          />
          <Label
            textTitle="Quality standards"
            textContent={company?.details?.qualityStandards?.join(', ') ?? '-'}
          />
        </OneColDiv>
      </TwoColDiv>
      <Details>
        <Label
          textTitle="Company profile"
          textContent={profile?.description ?? '-'}
        />
      </Details>
    </GeneralInfoLayout>
  );
};

export default GeneralInformation;
