import React from 'react';
import styled from 'styled-components';

import ConfirmedIcon from '../../assets/icons/confirmed.svg?react';
import LoadingIcon from '../LoadingIcon';

export interface IStatusChipProps {
  status: string;
}

const StatusChipContainer = styled.div<{ color: string }>`
  display: flex;
  padding: 5px 8px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  background: ${(props) => props.color};
  height: fit-content;
`;

const StatusText = styled.span`
  display: flex;
  padding: 0px 4px;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const statusMap: Record<string, string> = {
  Available: 'Generated',
  'Not Available': 'New',
  running: 'Running',
  confirmed: 'Confirmed',
  finished: 'Generated',
};

const colorMap: Record<string, string> = {
  Generated: '#DAE5FC',
  New: '#F1E6FF',
  Running: '#DAE5FC',
  Confirmed: '#E0F6E6',
};

const iconMap: Record<string, React.ReactElement> = {
  Generated: <ConfirmedIcon />,
  Running: <LoadingIcon />,
};

const StatusChip: React.FC<IStatusChipProps> = ({ status }) => {
  const displayStatus =
    statusMap[status.trim().toLocaleLowerCase()] || 'unknown';

  const Icon = iconMap[displayStatus] || undefined;

  return (
    <StatusChipContainer color={colorMap[displayStatus] || '#E7E7E7'}>
      {Icon}
      <StatusText>{displayStatus}</StatusText>
    </StatusChipContainer>
  );
};

export default StatusChip;
