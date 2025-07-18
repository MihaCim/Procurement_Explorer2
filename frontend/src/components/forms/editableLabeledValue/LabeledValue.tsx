import Skeleton from '../../Skeleton';
import EditableParagraph from './EditableParagraph';
import { StyledContent, StyledTitle } from './StyledComponents';

interface ILabelProps {
  textTitle: string;
  textContent: string;
  loading?: boolean;
  editable?: boolean;
  onSave?: (newText: string) => void;
}

const LabeledValue = ({
  textTitle,
  textContent,
  loading,
  editable,
  onSave,
}: ILabelProps) => {
  return (
    <div className="flex-col w-full">
      <StyledTitle> {textTitle}</StyledTitle>
      {loading ? (
        <Skeleton />
      ) : editable ? (
        <EditableParagraph
          initialText={
            String(textContent).trim() === ''
              ? 'No content'
              : String(textContent)
          }
          onSave={onSave}
        />
      ) : (
        <StyledContent> {textContent}</StyledContent>
      )}
    </div>
  );
};

export default LabeledValue;
