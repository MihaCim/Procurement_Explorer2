import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const StyledBtnLink = styled.button`
  color: var(--color-primary, #014289);
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  cursor: pointer;
`;
const BtnLink: React.FC<
  PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>
> = ({ children, ...props }) => {
  return <StyledBtnLink {...props}>{children}</StyledBtnLink>;
};

export default BtnLink;
