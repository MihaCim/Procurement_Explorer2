/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import styled from 'styled-components';

import EditableParagraph from './EditableParagraph';

interface EditableDictionaryProps {
  data: any;
  onSave?: (newData: any) => void;
  editable?: boolean;
  depth?: number;
  pending?: boolean;
}

const DictionaryContainer = styled.div<{ $depth?: number }>`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  border-bottom: ${(props) =>
    props.$depth === 0 ? '1px solid #c6c7c9' : 'none'};
  padding-bottom: ${(props) => (props.$depth === 0 ? '4px' : '2px')};
`;

const DictionaryKey = styled.span`
  font-weight: 400;
  font-size: 0.875rem;
  width: 13rem;
  flex-shrink: 0;
`;

const EditableDictionary: React.FC<EditableDictionaryProps> = ({
  data,
  onSave,
  editable = false,
  pending = false,
  depth = 0,
}) => {
  const [editableData, setEditableData] = useState<any>(data);

  const handleStringSave = (key: string, newValue: string) => {
    const updatedData = { ...editableData, [key]: newValue };
    setEditableData(updatedData);
    if (onSave) onSave(updatedData);
  };

  const handleNestedDictionarySave = (
    key: string,
    newNestedData: Record<string, unknown>,
  ) => {
    const updatedData = { ...editableData, [key]: newNestedData };
    setEditableData(updatedData);
    if (onSave) onSave(updatedData);
  };

  const indentation = depth * 4;

  return (
    <div style={{ paddingLeft: `${indentation}px` }} className="space-y-2">
      {Object.entries(editableData).map(([key, value]) => (
        <DictionaryContainer key={key} $depth={depth}>
          <DictionaryKey>{key}</DictionaryKey>
          <div className="flex-grow">
            {typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) ? (
              <EditableDictionary
                data={value as Record<string, unknown>}
                onSave={(newNestedData) =>
                  handleNestedDictionarySave(key, newNestedData)
                }
                depth={depth + 1}
                editable={editable}
                pending={pending}
              />
            ) : (
              <EditableParagraph
                initialText={
                  String(value).trim() === '' ? 'No content' : String(value)
                }
                onSave={(newValue) => handleStringSave(key, newValue)}
                isEditable={editable}
                pending={pending}
              />
            )}
          </div>
        </DictionaryContainer>
      ))}
    </div>
  );
};

export default EditableDictionary;
