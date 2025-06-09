import styled from 'styled-components';
import EditModalText from './EditModalText';
import EditModalSelect from './EditModalSelect';

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

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-self: stretch;
`;

interface ILabelWEditProps {
  textTitle: string;
  textContent: string;
  currentValue: any;
  handleClose: (value: any) => void;
}

export const LabelWTextEdit = ({
  textTitle,
  textContent,
  currentValue,
  handleClose,
}: ILabelWEditProps) => {
  return (
    <div className="flex-col">
      <TitleContainer>
        <StyledTitle> {textTitle}</StyledTitle>
        <EditModalText
          valueName={textTitle}
          currentValue={currentValue}
          handleClose={handleClose}
        />
      </TitleContainer>
      <StyledContent> {textContent}</StyledContent>
    </div>
  );
};

export const LabelWSelectEdit = ({
  textTitle,
  textContent,
  currentValue,
  handleClose,
}: ILabelWEditProps) => {
  return (
    <div className="flex-col">
      <TitleContainer>
        <StyledTitle> {textTitle}</StyledTitle>
        <EditModalSelect
          valueName={textTitle}
          currentValue={currentValue}
          handleClose={handleClose}
        />
      </TitleContainer>
      <StyledContent> {textContent}</StyledContent>
    </div>
  );
};
