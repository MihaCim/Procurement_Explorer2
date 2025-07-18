/* eslint-disable @typescript-eslint/no-explicit-any */
import { linkifyText } from '../../utils/linkyfy';
import EditableDictionary from '../forms/editableLabeledValue/EditableDictionnary';
import EditableParagraph from '../forms/editableLabeledValue/EditableParagraph';
import Skeleton from '../Skeleton';
import { H3, H4 } from '../Typography';

interface IDictionaryContentProps {
  title: string;
  value: unknown;
  pending: boolean;
  renderingStyle?: 'readonlylist' | 'tab';
  editable?: boolean;
  onSave?: (newData: any) => void;
  maxDepth?: number;
  titleStyle?: 'default' | 'small';
}

const EmptyState: React.FC = () => <span>None</span>;
const LoadingState: React.FC = () => <Skeleton height={100} />;

const MAX_DEPTH_DEFAULT = 5;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  if (proto === null) {
    return true;
  }

  return proto.constructor === Object;
}

const RenderSubDictionary: React.FC<{
  content: Record<string, unknown>;
  depth: number;
  maxDepth?: number;
}> = ({ content, depth, maxDepth = MAX_DEPTH_DEFAULT }) => {
  if (depth > maxDepth) {
    return <span style={{ color: 'gray' }}>[Max Depth Exceeded]</span>;
  }

  const entries = Object.entries(content);

  if (entries.length === 0) {
    return <span>None</span>;
  }

  return (
    <ul>
      {entries.map(([key, value]) => (
        <li key={key}>
          {key}:{' '}
          {value === undefined ||
          value === null ||
          String(value).trim() === '' ? (
            'None'
          ) : isPlainObject(value) ? (
            <RenderSubDictionary
              content={value}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ) : (
            linkifyText(String(value))
          )}
        </li>
      ))}
    </ul>
  );
};

const DictionaryContent: React.FC<IDictionaryContentProps> = ({
  title,
  value,
  pending,
  editable = false,
  renderingStyle = 'tab',
  titleStyle = 'default',
  maxDepth = MAX_DEPTH_DEFAULT,
  onSave,
}) => {
  const renderContent = () => {
    if (pending && (!value || Object.keys(value).length === 0)) {
      return <LoadingState />;
    }

    if (typeof value === 'string') {
      return value ? (
        <EditableParagraph
          initialText={
            String(value).trim() === '' ? 'No content' : String(value)
          }
          isEditable={editable}
          pending={pending}
        />
      ) : (
        <EmptyState />
      );
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return (
        <EditableParagraph
          initialText={
            String(value).trim() === '' ? 'No content' : String(value)
          }
          isEditable={editable}
          pending={pending}
        />
      );
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <ul>
          {value.map((item, index) => (
            <li key={index}>
              <EditableParagraph initialText={item} isEditable={editable} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState />
      );
    }

    if (isPlainObject(value)) {
      return Object.keys(value).length > 0 ? (
        renderingStyle === 'readonlylist' ? (
          <RenderSubDictionary content={value} depth={0} maxDepth={maxDepth} />
        ) : (
          <EditableDictionary
            data={value}
            onSave={onSave}
            editable={editable}
            pending={pending}
          />
        )
      ) : (
        <EmptyState />
      );
    }

    return <EmptyState />;
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      {titleStyle === 'small' ? <H4>{title}</H4> : <H3>{title}</H3>}
      {renderContent()}
    </div>
  );
};

export default DictionaryContent;
