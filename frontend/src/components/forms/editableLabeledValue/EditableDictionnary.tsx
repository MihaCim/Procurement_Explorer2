import React, { useEffect, useRef, useState } from 'react';

// Define the props for the EditableDictionary component
interface EditableDictionaryProps {
  data: Record<string, unknown>; // The dictionary data to display and edit
  onSave: (newData: Record<string, unknown>) => void; // Callback to save the updated dictionary
  depth?: number; // Optional prop to track nesting depth for indentation
}

// Helper component for inline editable text (reused and adapted from previous logic)
interface InlineEditableTextProps {
  initialText: string;
  onSave: (newText: string) => void;
}

const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  initialText,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(initialText);
  const [isHovered, setIsHovered] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Effect to focus the textarea when entering editing mode
  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select(); // Select all text for easy editing
    }
  }, [isEditing]);

  // Handle click on the text to enter editing mode
  const handleTextClick = () => {
    setIsEditing(true);
  };

  // Handle changes in the textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
  };

  // Handle blur event from the textarea (when it loses focus)
  const handleBlur = () => {
    setIsEditing(false); // Exit editing mode
    onSave(currentText); // Save the current text
    setIsHovered(false); // Reset hover state
  };

  // Handle key down events for the textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If 'Enter' is pressed (and not 'Shift+Enter' for new line), blur the textarea to save
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line in textarea
      textAreaRef.current?.blur(); // Trigger blur to save
    }
    // If 'Escape' is pressed, revert to original text and exit editing
    if (e.key === 'Escape') {
      setCurrentText(initialText); // Revert to initial text
      textAreaRef.current?.blur(); // Trigger blur to exit editing
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full" // Ensure it takes full width within its container
    >
      {isEditing ? (
        <textarea
          ref={textAreaRef}
          value={currentText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full min-h-10 p-2 border-2 border-purple-500 rounded-lg font-sans text-sm leading-relaxed resize-y shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        />
      ) : (
        <p
          onClick={handleTextClick}
          className={`
            p-2 rounded-lg cursor-pointer font-sans text-sm leading-relaxed text-gray-700 bg-gray-50
            transition-all duration-200 shadow-sm
            ${isHovered ? 'outline-2 outline-purple-500 outline-offset-2 shadow-md' : ''}
            hover:-translate-y-0.5
          `}
        >
          {currentText}
        </p>
      )}
    </div>
  );
};

// Main EditableDictionary React component
const EditableDictionary: React.FC<EditableDictionaryProps> = ({
  data,
  onSave,
  depth = 0,
}) => {
  const [editableData, setEditableData] =
    useState<Record<string, unknown>>(data);

  // Function to handle saving individual string values
  const handleStringSave = (key: string, newValue: string) => {
    const updatedData = { ...editableData, [key]: newValue };
    setEditableData(updatedData);
    onSave(updatedData); // Propagate change up to the parent
  };

  // Function to handle saving nested dictionary values
  const handleNestedDictionarySave = (
    key: string,
    newNestedData: Record<string, unknown>,
  ) => {
    const updatedData = { ...editableData, [key]: newNestedData };
    setEditableData(updatedData);
    onSave(updatedData); // Propagate change up to the parent
  };

  // Calculate indentation based on depth
  const indentation = depth * 4; // Using Tailwind's spacing scale (e.g., pl-4, pl-8)

  return (
    <div style={{ paddingLeft: `${indentation}px` }} className="space-y-2">
      {Object.entries(editableData).map(([key, value]) => (
        <div key={key} className="flex items-start">
          <span className="font-semibold text-gray-800 w-32 flex-shrink-0 pt-2">
            {key}:
          </span>
          <div className="flex-grow">
            {typeof value === 'string' ? (
              // Render InlineEditableText for string values
              <InlineEditableText
                initialText={value}
                onSave={(newValue) => handleStringSave(key, newValue)}
              />
            ) : typeof value === 'object' &&
              value !== null &&
              !Array.isArray(value) ? (
              // Recursively render EditableDictionary for nested objects
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
