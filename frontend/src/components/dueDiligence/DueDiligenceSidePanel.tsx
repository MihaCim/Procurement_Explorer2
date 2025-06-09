import moment from 'moment';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import CycleSvg from '../../assets/icons/cycle.svg?react';
import GlobeSvg from '../../assets/icons/globe.svg?react';
import HomeSvg from '../../assets/icons/home.svg?react';
import LinkSvg from '../../assets/icons/link.svg?react';
import MailSvg from '../../assets/icons/tabler_mail.svg?react';
import Star from '../../assets/icons/star.svg?react';
import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import Label from '../forms/Label';
import PrimaryButton from '../PrimaryButton';
import Skeleton from '../Skeleton';
import { H2 } from '../Typography';
import Link from '../forms/Link';
import { LabelWTextEdit } from '../forms/LabelWEdit';
import RatingStarsWEdit from '../forms/RatingStarsWithEdit';
import { DueDiligenceProfile } from '../../models/DueDiligenceProfile';

const Panel = styled.div`
  display: flex;
  width: 300px;
  padding: 24px 8px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  border-radius: var(--radius-small, 4px);
  border: 1px solid #ebebf1;
  background: var(--background-card, #fff);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const PanelHeader = styled.div`
  display: flex;
  padding: 0px 8px;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
`;

const PanelTitleLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  align-self: stretch;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;

  align-items: flex-start;
  gap: var(--gap-form, 16px);
  align-self: stretch;
`;

const CardRow = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
`;

const CardRowLeft = styled.div`
  display: flex;
  width: 48px;
  padding: 15px 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CardRowRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 1px;
  text-overflow: ellipsis;
`;

const InfoTypo = styled.p`
  color: #71737d;

  /* Poppins regular */
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 19px; /* 135.714% */
  letter-spacing: -0.14px;
`;

const DueDiligenceSidePanel: React.FC = () => {
  const {
    state: { loading, profile, risk_level, updateProfile },
    export: { exportToPDF },
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

  const Update = (profile: DueDiligenceProfile) => {
    updateProfile(profile);
  };

  return loading ? (
    <Panel>
      <Skeleton height={400} />
    </Panel>
  ) : (
    <Panel>
      <PanelHeader>
        <PanelTitleLayout>
          <H2>{profile?.name}</H2>
          <InfoTypo>
            Last revision{' '}
            {moment(profile?.Last_revision).format('DD MMM YYYY, HH:mm:ss')}
          </InfoTypo>
        </PanelTitleLayout>
        <PrimaryButton variant="outlined" onClick={() => exportToPDF()}>
          Export
        </PrimaryButton>
      </PanelHeader>
      <CardContent>
        <CardRow>
          <CardRowLeft>
            <LinkSvg />
          </CardRowLeft>
          <CardRowRight>
            <Link
              textTitle="Website"
              textContent={profile?.url ?? '-'}
              href={profile?.url ?? '#'}
            />
          </CardRowRight>
        </CardRow>
        <CardRow>
          <CardRowLeft>
            <MailSvg />
          </CardRowLeft>
          <CardRowRight>
            <LabelWTextEdit
              textTitle="Email contact"
              textContent={emailJson?.email ?? '-'}
              currentValue={emailJson?.email ?? '-'}
              handleClose={(value) => {
                console.log("e",value);
                Update({ ...profile!, email: value })
              }}
            />
          </CardRowRight>
        </CardRow>
        <CardRow>
          <CardRowLeft>
            <HomeSvg />
          </CardRowLeft>
          <CardRowRight>
            <Label textTitle="Adress" textContent={fullAddress ?? '-'} />
          </CardRowRight>
        </CardRow>
        <CardRow>
          <CardRowLeft>
            <GlobeSvg />
          </CardRowLeft>
          <CardRowRight>
            <Label textTitle="Country" textContent={profile?.country ?? '-'} />
          </CardRowRight>
        </CardRow>
        <CardRow>
          <CardRowLeft>
            <CycleSvg />
          </CardRowLeft>
          <CardRowRight>
            <Label textTitle="Status" textContent={profile?.status ?? '-'} />
            {/* #NOTE Can't update since it's not mapped in the back
            <LabelWSelectEdit
              textTitle="Status"
              textContent={profile?.status ?? '-'}
              currentValue={profile?.status ?? '-'}
              handleClose={(value) => Update({ ...profile!, status: value })}
            /> */}
          </CardRowRight>
        </CardRow>
        <CardRow>
          <CardRowLeft>
            <Star />
          </CardRowLeft>
          <CardRowRight>
            <RatingStarsWEdit
              title="Risk Status"
              currentValue={risk_level}
              handleClose={(value) =>
                Update({ ...profile!, risk_level: value })
              }
              max={5}
              invert
            />
          </CardRowRight>
        </CardRow>
      </CardContent>
    </Panel>
  );
};

export default DueDiligenceSidePanel;
