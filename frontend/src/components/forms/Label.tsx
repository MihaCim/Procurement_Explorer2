import styled from 'styled-components';

import Skeleton from '../Skeleton';

interface ILabelProps {
  textTitle: string;
  textContent: string;
  loading?: boolean;
}

const StyledTitle = styled.div`
  color: var(--Color-color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  word-break: break-word;
`;

const StyledContent = styled.div`
  color: var(--Color-color-text-secondary, #121213);
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
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
