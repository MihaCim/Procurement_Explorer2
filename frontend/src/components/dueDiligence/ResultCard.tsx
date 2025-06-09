import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

const Layout = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;

  border-radius: 4px;
  border: 1px solid var(--stroke, #ebebf1);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const Header = styled.div`
  display: flex;
  padding: 16px;
  align-items: center;
  gap: 8px;
  align-self: stretch;

  border-radius: 4px 4px 0px 0px;
  border: 1px solid var(--stroke, #ebebf1);
  background: #fafafa;
`;

const Title = styled.h3`
  color: var(--color-text-primary, #292c3d);
  font-family: Poppins;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.15px;
`;

export interface IResultCardProps {
  title: string;
  additionalContent?: JSX.Element;
}

const ResultCard: React.FC<PropsWithChildren<IResultCardProps>> = ({
  title,
  children,
  additionalContent,
}) => {
  return (
    <Layout>
      <Header>
        <Title>{title}</Title>
        {additionalContent}
      </Header>
      {children}
    </Layout>
  );
};

export default ResultCard;
