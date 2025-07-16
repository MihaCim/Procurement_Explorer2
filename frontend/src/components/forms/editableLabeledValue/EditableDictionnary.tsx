/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import EditableParagraph from './EditableParagraph';

interface EditableDictionaryProps {
  data: any;
  onSave?: (newData: any) => void;
  editable?: boolean;
  depth?: number;
}

const EditableDictionary: React.FC<EditableDictionaryProps> = ({
  data,
  onSave,
  editable = false,
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
        <div key={key} className="flex items-center">
          <span className="font-semibold text-sm text-gray-700 w-32 flex-shrink-0">
            {key}
          </span>
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
              />
            ) : (
              <EditableParagraph
                initialText={String(value)}
                onSave={(newValue) => handleStringSave(key, newValue)}
                isEditable={editable}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EditableDictionary;
