import React, { useCallback } from 'react';
import styled from 'styled-components';
import LoadingIcon from './LoadingIcon';

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
const StatusContent = styled.div`
  display: flex;
  padding: 3.873px 11.618px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 3.889px;
`;

interface IProcessingStatusProps {
  status: string;
}

const ProcessingStatus: React.FC<IProcessingStatusProps> = ({ status }) => {
  const getStatusBackground = useCallback((status: string): string => {
    const trimmedStatus = status.trim().toLowerCase();
    switch (trimmedStatus) {
      case 'in progress':
        return '#E7E7E7';
      case 'waiting for review':
        return '#E4EBF9';
      case 'accepted':
        return '#E6F4EA';
      case 'rejected':
        return '#F6E0E0';
      default:
        return '#E7E7E7';
    }
  }, []);

  return (
    <Container>
      <StatusContent
        style={{
          background: getStatusBackground(status),
        }}
      >
        {status.trim().toLowerCase() === 'in progress' && <LoadingIcon />}
        {status}
      </StatusContent>
    </Container>
  );
};

export default ProcessingStatus;
