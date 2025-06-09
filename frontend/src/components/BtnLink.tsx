import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

export interface IBtnLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const StyledBtnLink = styled.button`
  color: var(--Color-color-primary, #014289);
  font-family: Raleway;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;
const BtnLink: React.FC<PropsWithChildren<IBtnLinkProps>> = ({
  children,
  ...props
}) => {
  return <StyledBtnLink {...props}>{children}</StyledBtnLink>;
};

export default BtnLink;
