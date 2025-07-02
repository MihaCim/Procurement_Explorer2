import React, { useMemo } from 'react';
import styled from 'styled-components';

import AcceptIcon from '../../assets/icons/accept.svg?react';
import ExpandIcon from '../../assets/icons/expand.svg?react';
import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import { DueDiligenceLog } from '../../models/DueDiligenceProfile';
import BtnLink from '../BtnLink';
import { CircularProgress } from '../CircularProgress';

const Bar = styled.div`
  display: flex;
  padding: 8px 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;

  border-radius: var(--radius-radius-small, 4px) var(--radius-radius-small, 4px)
    0px 0px;
  border: 1px solid var(--stroke, #ebebf1);
  background: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  flex-direction: column;
`;

const AnimatedContent = styled.div<{ $expanded: boolean }>`
  max-height: ${(props) => (props.$expanded ? '800px' : '0')};
  opacity: ${(props) => (props.$expanded ? 1 : 0)};
  overflow-y: scroll;
  overflow-x: hidden;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const AgentWorkflowTitle = styled.h3`
  color: var(--Color-color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 17px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.17px;
`;

const LinkTypo = styled.p`
  color: var(--test-color, #073599);
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px; /* 123.077% */
  letter-spacing: -0.13px;
  text-decoration: none;
  text-decoration-line: none !important;

  &:hover {
    text-decoration: underline;
    underline-offset: 2px;
    text-decoration-color: #014289;
    cursor: pointer;
  }
`;

const FeedbackText = styled.p`
  color: #333;
  font-family: Poppins;
  font-size: 13px;
  font-weight: 400;
  line-height: 19px;
  letter-spacing: -0.13px;
  word-break: break-word;
  white-space: normal;
`;

const AgentFeedbackContainer = styled.div`
  display: flex;
  padding: 12px 0px;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  align-self: stretch;

  border-bottom: 1px solid var(--stroke, #ebebf1);

  /* shadow thinking */
  box-shadow: 1px 1px 10px 0px rgba(73, 76, 91, 0.03) inset;
`;

const AgentFeedback = (feedback: DueDiligenceLog) => {
  return (
    <AgentFeedbackContainer>
      <FeebackTypo>{feedback['agent']}</FeebackTypo>
      <FeedbackText>{feedback['message']}</FeedbackText>
    </AgentFeedbackContainer>
  );
};

const AgenticFeedback: React.FC = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const {
    state: { logs, profile },
  } = useDueDiligenceContext();

  const currentFeedback = useMemo(() => {
    return logs && logs.length > 0 ? logs[logs.length - 1] : null;
  }, [logs]);

  return (
    <Bar>
      <div className="flex justify-between items-center gap-3 w-full">
        {isExpanded ? (
          <AgentWorkflowTitle>Agent Workflow</AgentWorkflowTitle>
        ) : (
          <div className="flex items-center">
            {profile?.status === 'finished' ? (
              <AcceptIcon />
            ) : (
              <CircularProgress size={24} borderWidth={2} />
            )}
            <div className="flex flex-1">
              {currentFeedback ? (
                <FeebackTypo>
                  {`${currentFeedback['agent']}: ${currentFeedback['message']}`}
                </FeebackTypo>
              ) : (
                <FeebackTypo>Initialisation...</FeebackTypo>
              )}
            </div>
          </div>
        )}
        <BtnLink
          className="flex gap-1"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <ExpandIcon />
          <LinkTypo>
            {isExpanded ? 'Hide agent workflow' : 'Show agent workflow'}
          </LinkTypo>
        </BtnLink>
      </div>

      <AnimatedContent $expanded={isExpanded}>
        <div className="flex flex-col self-stretch">
          {logs.map((log, i) => (
            <AgentFeedback key={`logs_${i}`} {...log} />
          ))}
        </div>
      </AnimatedContent>
    </Bar>
  );
};

export default AgenticFeedback;
