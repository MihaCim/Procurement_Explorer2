import styled from 'styled-components';

export const StyledTitle = styled.div`
  color: var(--Color-color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  word-break: break-word;
`;

export const StyledContent = styled.p<{ $isHovered?: boolean }>`
  color: var(--Color-color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  word-break: break-word;

  outline: ${({ $isHovered }) =>
    $isHovered
      ? '1px solid var(--Color-color-text-secondary, #121213)'
      : 'none'};
  padding: ${({ $isHovered }) => ($isHovered ? '4px 8px' : '0')};
  border-radius: ${({ $isHovered }) => ($isHovered ? '4px' : '0')};
  background-color: ${({ $isHovered }) =>
    $isHovered
      ? 'var(--Color-new-bg-card, rgba(255, 255, 255, 0.95))'
      : 'transparent'};
  transition: all 0.2s ease-in-out;
  cursor: ${({ $isHovered }) => ($isHovered ? 'pointer' : 'default')};
  box-shadow: ${({ $isHovered }) =>
    $isHovered ? '0px 1px 2px rgba(0, 0, 0, 0.1)' : 'none'};
`;

export const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 2px solid var(--Color-color-text-secondary, #121213);
  border-radius: 8px;
  font-family: Poppins, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;

  &:focus {
    outline: none;
    border-color: var(--Color-color-text-secondary, #121213);
    box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px;
    transition: all 0.2s ease-in-out;
  }
`;
