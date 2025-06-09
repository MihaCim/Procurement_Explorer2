import styled from 'styled-components';

import ErrorIcon from '../assets/icons/error-outline.svg?react';

const AlertDiv = styled.div`
  display: flex;
  padding: 6px 16px;

  align-items: center;
  gap: 12px;
  align-self: stretch;
  border-radius: var(--radius-radius-small, 4px);
  background: var(
    --Light-Error-Shades-190p,
    linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.9) 100%
    ),
    #d32f2f
  );
`;

const AlertTypography = styled.span`
  color: var(--Light-Error-Shades-160p, #d32f2f);

  font-feature-settings:
    'clig' off,
    'liga' off;
  /* Typography/Body 2 */
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 143%; /* 20.02px */
  letter-spacing: 0.17px;
`;

interface AlertProps {
  message: string;
}

const Alert = ({ message }: AlertProps) => {
  return (
    <AlertDiv>
      <ErrorIcon />
      <AlertTypography>{message}</AlertTypography>
    </AlertDiv>
  );
};

export default Alert;
