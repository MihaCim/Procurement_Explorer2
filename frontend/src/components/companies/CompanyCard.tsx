import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import moment from 'moment';
// Register the English locale before using getName or getNames
import React from 'react';
import styled from 'styled-components';

import { Company } from '../../models/Company';
import TruncatedParagraph from '../commons/TuncatedParagraph';
import StatusChip from '../dueDiligence/StatusChip';
import { H2 } from '../Typography';

countries.registerLocale(enLocale);

export interface ICompanyCardProps extends Company {
  risk_level?: number;
}

const Card = styled.a<{ $disabled: boolean }>`
  display: flex;
  max-width: 400px;
  padding: 20px 32px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};

  border-radius: 4px;
  border: 1px solid var(--Stroke, #ebebf1);
  background: #fff;

  /* new shadow */
  box-shadow: 1px 2px 7px 2px rgba(70, 72, 80, 0.07);

  &:hover {
    border-radius: 4px;
    border: 1px solid #8ca5d7;
    background: #f0f3f8;

    /* new shadow */
    box-shadow: 1px 2px 7px 2px rgba(70, 72, 80, 0.07);
  }
`;

const Info = styled(TruncatedParagraph)`
  color: var(--color-text-primary, #292c3d);
  font-family: Lato;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const InfoLight = styled.p`
  color: var(--grey-2, #69696f);
  font-family: Lato;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const CompanyCard: React.FC<ICompanyCardProps> = ({
  id,
  name,
  dd_status,
  country,
  industry,
  review_date,
}) => {
  return (
    <Card $disabled={!id} href={`/due-diligence/${id}`}>
      <div className="flex flex-1 flex-col gap-1 self-stretch">
        <div className="flex justify-between gap-1">
          <H2>{name}</H2>
          <StatusChip status={dd_status} />
        </div>

        <Info>{countries.getName(country, 'en') ?? '-'}</Info>
        <Info>{industry}</Info>
      </div>

      <div>
        <InfoLight>
          Last revision: {moment(review_date).format('MMM DD, YYYY')}
        </InfoLight>
      </div>
    </Card>
  );
};

export default CompanyCard;
