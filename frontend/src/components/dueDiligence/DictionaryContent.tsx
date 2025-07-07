import Skeleton from '../Skeleton';
import { H4 } from '../Typography';

interface IDictionaryContentProps {
  title: string;
  value: unknown;
  pending: boolean;
  maxDepth?: number;
}

const EmptyState: React.FC = () => <span>-</span>;
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
            String(value)
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
  maxDepth = MAX_DEPTH_DEFAULT,
}) => {
  const renderContent = () => {
    if (pending) {
      return <LoadingState />;
    }

    if (typeof value === 'string') {
      return value ? <span>{value}</span> : <EmptyState />;
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <ul>
          {value.map((item, index) => (
            <li key={index}>{String(item)}</li>
          ))}
        </ul>
      ) : (
        <EmptyState />
      );
    }

    if (isPlainObject(value)) {
      return Object.keys(value).length > 0 ? (
        <RenderSubDictionary content={value} depth={0} maxDepth={maxDepth} />
      ) : (
        <EmptyState />
      );
    }

    return <EmptyState />;
  };

  return (
    <div className="flex flex-1 flex-col">
      <H4>{title}:</H4>
      {renderContent()}
    </div>
  );
};

export default DictionaryContent;
