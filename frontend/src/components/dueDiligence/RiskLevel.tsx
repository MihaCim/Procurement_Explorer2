import React from 'react';
import styled from 'styled-components';

import RiskLevelIcon from '../../assets/icons/risk-level.svg?react';

export interface IRiskLevelProps {
  level: 1 | 2 | 3 | 4 | 5;
}

const Bullet = styled.div<{ level: number }>`
  background-color: ${({ level }) => {
    const colors = [
      '#D9D9D9',
      '#127437',
      '#94B900',
      '#CD9F06',
      '#BE6C2D',
      '#9E1919',
    ];
    return colors[level];
  }};
  border-radius: 12px;
  width: 12px;
  height: 12px;
`;

const RiskLevel: React.FC<IRiskLevelProps> = ({ level }) => {
  return (
    <div className="flex gap-1 items-center">
      <RiskLevelIcon />
      <div className="flex flex-col gap-0.5">
        <label>Risk Level</label>
        <div className="flex flex-row gap-[6px]">
          {Array.from({ length: 5 }, (_, index) => (
            <Bullet key={index} level={level > index ? level : 0} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskLevel;
