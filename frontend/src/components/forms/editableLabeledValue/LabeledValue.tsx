import Skeleton from '../../Skeleton';
import EditableParagraph from './EditableParagraph';
import { StyledContent, StyledTitle } from './StyledComponents';

interface ILabelProps {
  textTitle: string;
  textContent: string;
  loading?: boolean;
  editable?: boolean;
}

const LabeledValue = ({
  textTitle,
  textContent,
  loading,
  editable,
}: ILabelProps) => {
  return (
    <div className="flex-col">
      <StyledTitle> {textTitle}</StyledTitle>
      {loading ? (
        <Skeleton />
      ) : editable ? (
        <EditableParagraph initialText={textContent} />
      ) : (
        <StyledContent> {textContent}</StyledContent>
      )}
    </div>
  );
};

export default LabeledValue;
