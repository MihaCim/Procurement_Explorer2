import React, { useMemo } from 'react';
import styled from 'styled-components';

import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import { SecurityRisk } from '../../models/DueDiligenceProfile';
import Label from '../forms/Label';
import ResultCard from './ResultCard';
import { generateColorVector } from '../../utils/colorUtils';
import { RiskStatusColorsLight } from '../../Const';

export interface RiskProps {
  title: string;
  security_risk: SecurityRisk;
}

interface ContentStyleProps {
  $risklevel: string;
}

const Content = styled.div<ContentStyleProps>`
  display: flex;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
  background: ${({ $risklevel }) => $risklevel || '#e6f4ea'};
  overflow: auto;
`;

const Risks = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
  align-self: stretch;
`;

const RiskItem = styled.li`
  max-width: 250px;
  min-width: 200px;
  display: flex;
  height: 100%;
  align-self: stretch;
  align-items: flex-start;
  flex: 1 0 0;
`;

const RiskContent = styled.div`
  display: flex;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  flex: 1 0 0;
  align-self: stretch;

  background: #fff;
`;

const Risk: React.FC<RiskProps> = ({ title, security_risk }) => {
  return (
    <ResultCard title={title}>
      <RiskContent>
        <Label textTitle="Risk type" textContent={security_risk.level} />
        <Label textTitle="Details" textContent={security_risk.details} />
      </RiskContent>
    </ResultCard>
  );
};

const RiskStatusContent: React.FC = () => {
  const {
    state: { profile, risk_level },
  } = useDueDiligenceContext();
  if (!profile) return null;

  const defaultColorVector = useMemo(
    () => generateColorVector(5, RiskStatusColorsLight),
    [],
  );
  const color = defaultColorVector[5 - risk_level];

  return (
    <Content $risklevel={color}>
      {/* <p>{profile.risk_level}</p> We have no description of risk status here */}
      <Risks>
        <RiskItem>
          <Risk title="Security risk" security_risk={profile.security_risk} />
        </RiskItem>
        <RiskItem>
          <Risk title="Financial risk" security_risk={profile.financial_risk} />
        </RiskItem>
        <RiskItem>
          <Risk
            title="Operational risk"
            security_risk={profile.operational_risk}
          />
        </RiskItem>
        <RiskItem>
          <ResultCard title="Key relationships">
            <RiskContent>
              {profile.key_relationships.partners.map((partner) => (
                <div key={partner}>{partner}</div>
              ))}
            </RiskContent>
          </ResultCard>
        </RiskItem>
      </Risks>
    </Content>
  );
};

export default RiskStatusContent;
