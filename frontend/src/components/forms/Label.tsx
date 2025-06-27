import styled from 'styled-components';

import Skeleton from '../Skeleton';

interface ILabelProps {
  textTitle: string;
  textContent: string;
  loading?: boolean;
}

const StyledTitle = styled.div`
  color: var(--color-text-primary, #292c3d);
  font-size: 13px;
  font-weight: 400;
`;

const StyledContent = styled.div`
  color: var(--color-text-secondary, #121213);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  word-break: break-word;
`;

const Label = ({ textTitle, textContent, loading }: ILabelProps) => {
  return (
    <div className="flex-col">
      <StyledTitle> {textTitle}</StyledTitle>
      {loading ? <Skeleton /> : <StyledContent> {textContent}</StyledContent>}
    </div>
  );
};

export default Label;
