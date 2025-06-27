import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';

import ExpandIcon from '../../assets/icons/expand.svg?react';
import { useWebSocket } from '../../context/WebSocketContext';
import BtnLink from '../BtnLink';
import { CircularProgress } from '../CircularProgress';

const Bar = styled.div`
  display: flex;
  padding: 12px 16px 12px 12px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
  border-radius: var(--radius-small, 4px);
  border: 1px solid #e5eaf3;
  background: #fff;
  overflow: hidden;
  flex-direction: column;
`;

const AnimatedContent = styled.div<{ $expanded: boolean }>`
  max-height: ${(props) => (props.$expanded ? '400px' : '0')};
  opacity: ${(props) => (props.$expanded ? 1 : 0)};
  overflow: hidden;
  transition:
    max-height 0.4s ease,
    opacity 0.4s ease;
  width: 100%;
`;

const FeebackTypo = styled.p`
  color: #333;
  font-family: Poppins;
  font-size: 13px;
  font-weight: 400;
  line-height: 19px;
  letter-spacing: -0.13px;
`;

const LinkTypo = styled.p`
  font-family: Poppins;
  font-size: 14px;
  font-weight: 400;
  line-height: 19px;
  letter-spacing: -0.14px;

  &:hover {
    text-decoration: underline;
    underline-offset: 2px;
    text-decoration-color: #014289;
    cursor: pointer;
  }
`;

const AgenticFeedback: React.FC = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { subscribe, unsubscribe } = useWebSocket();
  const currentFeedback = {
    type: 'chat',
    data: 'Evelyn Fields (Documentation Specialist): OK !',
  };

  const chatListener = useCallback((payload: unknown) => {
    console.log('chat payload received in feedback:', payload);
  }, []);

  useEffect(() => {
    subscribe('chat', chatListener);
    return () => {
      unsubscribe('chat', chatListener);
    };
  }, [chatListener, subscribe, unsubscribe]);

  return (
    <Bar>
      <div className="flex justify-end items-center gap-3 w-full">
        <CircularProgress size={24} borderWidth={2} />
        <div className="flex flex-1">
          <FeebackTypo>{currentFeedback?.data ?? '-'}</FeebackTypo>
        </div>
        <BtnLink
          className="flex gap-1"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <ExpandIcon />
          <LinkTypo>{isExpanded ? 'Collapse' : 'View Agent workflow'}</LinkTypo>
        </BtnLink>
      </div>

      <AnimatedContent $expanded={isExpanded}>
        <div className="mt-4 p-2 border-t border-gray-200 text-sm text-gray-700">
          <p>This is where the agent workflow or extra content appears.</p>
        </div>
      </AnimatedContent>
    </Bar>
  );
};

export default AgenticFeedback;
