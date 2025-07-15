import React from 'react';
import styled from 'styled-components';

export interface IRiskLevelProps {
  level: number;
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

const LabelInfo = styled.label`
  color: var(--Color-color-text-primary, #292c3d);
  font-family: Poppins;
  font-size: 13px;
  font-style: italic;
  font-weight: 300;
  line-height: normal;
`;

const RiskLevel: React.FC<IRiskLevelProps> = ({ level }) => {
  return (
    <div className="flex gap-1 items-center">
      <label>Risk Level:</label>

      <div className="flex flex-row gap-[5px]">
        {Array.from({ length: 5 }, (_, index) => (
          <Bullet key={index} level={level > index ? level : 0} />
        ))}
      </div>

      <LabelInfo>
        {level === 0
          ? '(None)'
          : level === 1
            ? '(Low)'
            : level === 2
              ? '(Medium)'
              : level === 3
                ? '(High)'
                : level === 4
                  ? '(Very high)'
                  : '(Critical)'}
      </LabelInfo>
    </div>
  );
};

export default RiskLevel;
