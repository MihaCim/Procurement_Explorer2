import React from "react";
import styled from "styled-components";

export interface IHeaderButton {
  children: React.ReactNode;
  btnProps?: React.ButtonHTMLAttributes<HTMLDivElement>;
}

const HeaderButtonDefault = styled.div`
  display: flex;
  color: var(--color-text-primary, #292c3d);
  font-size: 14px;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-radius-small, 4px);
  &:hover {
    background: #efeff2;
  }
  & > a.active {
    background: #efeff2;
    color: var(--color-primary, #014289);
    font-weight: 500;
  }
`;

const HeaderButton = ({ btnProps, children }: IHeaderButton) => {
  return <HeaderButtonDefault {...btnProps}>{children}</HeaderButtonDefault>;
};

export default HeaderButton;
