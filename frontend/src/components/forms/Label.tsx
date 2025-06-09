import styled from 'styled-components';

interface ILabelProps {
  textTitle: string;
  textContent: string;
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

const Label = ({ textTitle, textContent }: ILabelProps) => {
  return (
    <div className="flex-col">
      <StyledTitle> {textTitle}</StyledTitle>
      <StyledContent> {textContent}</StyledContent>
    </div>
  );
};

export default Label;
