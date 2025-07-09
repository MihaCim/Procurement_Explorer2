import React, { useMemo } from 'react';
import styled from 'styled-components';

import AcceptIcon from '../../assets/icons/accept.svg?react';
import ExpandIcon from '../../assets/icons/expand.svg?react';
import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import {
  DueDiligenceLog,
  isStatusGenerated,
} from '../../models/DueDiligenceProfile';
import BtnLink from '../BtnLink';
import { CircularProgress } from '../CircularProgress';

const Bar = styled.div`
  display: flex;
  padding: 8px 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  gap: 8px;
  min-height: 48px;

  border-radius: var(--radius-radius-small, 4px) var(--radius-radius-small, 4px)
    0px 0px;
  border: 1px solid var(--stroke, #ebebf1);
  background: rgba(255, 255, 255, 0.5);
  flex-direction: column;
`;

const AnimatedContent = styled.div<{ $expanded: boolean }>`
  max-height: ${(props) => (props.$expanded ? '700px' : '0')};
  opacity: ${(props) => (props.$expanded ? 1 : 0)};
  // overflow-y: scroll;
  scrollbar-width: thin;
  overflow: hidden;
  transition:
    max-height 0.4s ease,
    opacity 0.4s ease;
  width: 100%;

  ${(props) =>
    props.$expanded &&
    `
    overflow-y: auto; 
  `}
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
  color: var(--color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
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

  box-shadow: 1px 1px 10px 0px rgba(73, 76, 91, 0.03) inset;
`;

const parseLog = (
  log: string,
): { 'agent name': string; 'agent response': string } | null => {
  try {
    return JSON.parse(log);
  } catch (e) {
    console.warn('Error parsing log:', e);
    return { 'agent name': 'Unknown', 'agent response': log };
  }
};

const AgentFeedback: React.FC<{
  feedback: DueDiligenceLog;
  isCurrent: boolean;
  isFinished: boolean;
}> = ({ feedback, isCurrent, isFinished }) => {
  const log = parseLog(feedback['log']);
  if (!log) {
    return null;
  }

  return (
    <AgentFeedbackContainer>
      {isCurrent && isFinished ? (
        <div className="flex items-center gap-2">
          <AcceptIcon height={24} />
          <FeebackTypo>{log['agent name']}</FeebackTypo>
        </div>
      ) : isCurrent ? (
        <div className="flex items-center gap-2">
          <CircularProgress size={24} borderWidth={2} />
          <FeebackTypo>{log['agent name']}</FeebackTypo>
        </div>
      ) : (
        <FeebackTypo>{log['agent name']}</FeebackTypo>
      )}
      <FeedbackText>{log['agent response']}</FeedbackText>
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

  const currentLog = useMemo(() => {
    return currentFeedback ? parseLog(currentFeedback['log']) : null;
  }, [currentFeedback]);

  return (
    <Bar>
      <div className="flex justify-between items-center gap-3 w-full">
        <div className="flex items-center gap-2">
          {isStatusGenerated(profile?.status) ? (
            <AcceptIcon height={24} />
          ) : (
            <CircularProgress size={16} borderWidth={2} />
          )}
          <div className="flex flex-1">
            {currentLog ? (
              <FeebackTypo>
                {`${currentLog['agent name']}: ${currentLog['agent response']}`}
              </FeebackTypo>
            ) : (
              <FeebackTypo>Initialisation...</FeebackTypo>
            )}
          </div>
        </div>

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
        <div className="flex flex-col self-stretch gap-4">
          <div className="flex flex-col self-stretch gap-3">
            <AgentWorkflowTitle>Metadata</AgentWorkflowTitle>
            {profile?.metadata && Object.keys(profile.metadata).length > 0 ? (
              <div className="flex flex-col gap-2">
                {Object.entries(profile.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <p className="font-semibold">{key}:</p>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <FeedbackText>No metadata available</FeedbackText>
            )}
          </div>
          <div className="flex flex-col self-stretch">
            <AgentWorkflowTitle>Logs</AgentWorkflowTitle>
            {logs && logs.length === 0 ? (
              <FeedbackText>No logs available</FeedbackText>
            ) : (
              logs.map((log, i) => (
                <AgentFeedback
                  key={`logs_${i}`}
                  isCurrent={i === logs.length - 1}
                  isFinished={isStatusGenerated(profile?.status)}
                  feedback={log}
                />
              ))
            )}
          </div>
        </div>
      </AnimatedContent>
    </Bar>
  );
};

export default AgenticFeedback;
