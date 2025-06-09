import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const ContentCardStyled = styled.div`
  display: flex;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  gap: 32px;
  flex: 1 0 0;
  border-radius: var(--radius-small, 4px);
  border: 1px solid var(--stroke, #ebebf1);
  background: var(--background-card, #fff);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const ContentCard: React.FC<PropsWithChildren> = ({ children }) => {
  return <ContentCardStyled>{children}</ContentCardStyled>;
};

export default ContentCard;
