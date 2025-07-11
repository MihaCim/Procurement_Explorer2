/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import EditableParagraph from './EditableParagraph';

interface EditableDictionaryProps {
  data: any;
  onSave: (newData: any) => void;
  depth?: number;
}

const EditableDictionary: React.FC<EditableDictionaryProps> = ({
  data,
  onSave,
  depth = 0,
}) => {
  const [editableData, setEditableData] = useState<any>(data);

  const handleStringSave = (key: string, newValue: string) => {
    const updatedData = { ...editableData, [key]: newValue };
    setEditableData(updatedData);
    onSave(updatedData); // Propagate change up to the parent
  };

  const handleNestedDictionarySave = (
    key: string,
    newNestedData: Record<string, unknown>,
  ) => {
    const updatedData = { ...editableData, [key]: newNestedData };
    setEditableData(updatedData);
    onSave(updatedData); // Propagate change up to the parent
  };

  const indentation = depth * 4;

  return (
    <div style={{ paddingLeft: `${indentation}px` }} className="space-y-2">
      {Object.entries(editableData).map(([key, value]) => (
        <div key={key} className="flex items-start">
          <span className="font-semibold text-sm text-gray-700 w-32 flex-shrink-0">
            {key}
          </span>
          <div className="flex-grow">
            {typeof value === 'string' ? (
              <EditableParagraph
                initialText={value}
                onSave={(newValue) => handleStringSave(key, newValue)}
              />
            ) : typeof value === 'object' &&
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
              // Fallback for other types (e.g., numbers, booleans, arrays - display as string)
              <p className="p-2 rounded-lg text-gray-700 bg-gray-50 shadow-sm">
                {String(value)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EditableDictionary;
