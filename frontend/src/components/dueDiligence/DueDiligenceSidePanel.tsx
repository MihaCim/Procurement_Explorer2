import React, { useMemo } from 'react';
import styled from 'styled-components';

import CycleSvg from '../../assets/icons/cycle.svg?react';
import GlobeSvg from '../../assets/icons/globe.svg?react';
import HomeSvg from '../../assets/icons/home.svg?react';
import LinkSvg from '../../assets/icons/link.svg?react';
import Star from '../../assets/icons/star.svg?react';
import MailSvg from '../../assets/icons/tabler_mail.svg?react';
import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import Label from '../forms/Label';
import { LabelWTextEdit } from '../forms/LabelWEdit';
import Link from '../forms/Link';
import RatingStarsWEdit from '../forms/RatingStarsWithEdit';
import Skeleton from '../Skeleton';
import { H2 } from '../Typography';

const Panel = styled.div`
  display: flex;
  width: 260px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;

  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
`;

const RowLeft = styled.div`
  display: flex;
  width: 48px;
  padding: 15px 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const RowRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 1px;
  text-overflow: ellipsis;
  flex: 1 0 0;
`;

const CompanyTitle = styled.div`
  display: flex;
  min-height: 55px;
  padding-bottom: 4px;
  align-items: center;
  gap: 6px;
  align-self: stretch;
`;

const DueDiligenceSidePanel: React.FC = () => {
  const {
    state: { loading, profile, company, risk_level },
  } = useDueDiligenceContext();

  const emailJson = useMemo(
    () =>
      profile?.email
        ? (JSON.parse(profile.email.replace(/(?!^)'/g, '"')) as {
            email: string;
          })
        : null,
    [profile],
  ); // Should be corrected in backend to return a valid JSON

  const fullAddress = useMemo(() => {
    if (!profile?.address) return '';

    const { street = '', city = '', state = '', zip = '' } = profile.address;
    return [street, city, state, zip].filter(Boolean).join(', ');
  }, [profile]);

  // const Update = (profile: DueDiligenceProfile) => {
  //   // updateProfile(profile);
  // };

  return loading ? (
    <Panel>
      <Skeleton height={400} />
    </Panel>
  ) : (
    <Panel>
      <CompanyTitle>
        <H2>{company?.name ?? '-'}</H2>
      </CompanyTitle>
      <CardContent>
        <Row>
          <RowLeft>
            <LinkSvg />
          </RowLeft>
          <RowRight>
            <Link
              textTitle="Website"
              textContent={profile?.url ?? '-'}
              href={profile?.url ?? '#'}
            />
          </RowRight>
        </Row>
        <Row>
          <RowLeft>
            <MailSvg />
          </RowLeft>
          <RowRight>
            <LabelWTextEdit
              textTitle="Email contact"
              textContent={emailJson?.email ?? '-'}
              currentValue={emailJson?.email ?? '-'}
              handleClose={(value) => {
                console.log('e', value);
                // Update({ ...profile!, email: value });
              }}
            />
          </RowRight>
        </Row>
        <Row>
          <RowLeft>
            <HomeSvg />
          </RowLeft>
          <RowRight>
            <Label textTitle="Adress" textContent={fullAddress ?? '-'} />
          </RowRight>
        </Row>
        <Row>
          <RowLeft>
            <GlobeSvg />
          </RowLeft>
          <RowRight>
            <Label textTitle="Country" textContent={profile?.country ?? '-'} />
          </RowRight>
        </Row>
        <Row>
          <RowLeft>
            <CycleSvg />
          </RowLeft>
          <RowRight>
            <Label textTitle="Status" textContent={profile?.status ?? '-'} />
            {/* #NOTE Can't update since it's not mapped in the back
            <LabelWSelectEdit
              textTitle="Status"
              textContent={profile?.status ?? '-'}
              currentValue={profile?.status ?? '-'}
              handleClose={(value) => Update({ ...profile!, status: value })}
            /> */}
          </RowRight>
        </Row>
        <Row>
          <RowLeft>
            <Star />
          </RowLeft>
          <RowRight>
            <RatingStarsWEdit
              title="Risk Status"
              currentValue={risk_level}
              handleClose={
                () => {}
                // Update({ ...profile!, risk_level: value })
              }
              max={5}
              invert
            />
          </RowRight>
        </Row>
      </CardContent>
    </Panel>
  );
};

export default DueDiligenceSidePanel;
