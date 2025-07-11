import React, { useEffect, useRef, useState } from 'react';

import { StyledContent, StyledTextArea } from './StyledComponents';

interface EditableParagraphProps {
  initialText: string;
  onSave?: (newText: string) => void;
}

const EditableParagraph: React.FC<EditableParagraphProps> = ({
  initialText,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(initialText);
  const [isHovered, setIsHovered] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [isEditing]);

  const handleParagraphClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onSave) {
      onSave(currentText);
    }
    setIsHovered(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textAreaRef.current?.blur();
    }

    if (e.key === 'Escape') {
      setCurrentText(initialText);
      textAreaRef.current?.blur();
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full"
    >
      {isEditing ? (
        <StyledTextArea
          ref={textAreaRef}
          value={currentText}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <StyledContent onClick={handleParagraphClick} $isHovered={isHovered}>
          {currentText}
        </StyledContent>
      )}
    </div>
  );
};

export default EditableParagraph;
