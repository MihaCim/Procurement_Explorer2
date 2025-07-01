import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import AttachmentIcon from '../../assets/icons/attachment.svg?react';
import CrossIcon from '../../assets/icons/cross.svg?react';
import IconButton from '../commons/IconButton';
import { AttachmentTypo } from '../Typography';

const LinkTypo = styled.p`
  color: var(---color-primary, #014289);
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-decoration-line: underline;
  cursor: pointer;
`;

const DragAndDropContainer = styled.div`
  border-radius: var(--radius, 4px);
  border: 1px dashed var(--grey-2, #6d7276);
  background: var(--bg-card, #fff);
  align-self: stretch;

  /* Shadow / xs */
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  max-width: 357px;
  padding: 16px 12px;
`;

const FileListElement = styled.li`
  display: flex;
  align-items: center;
  width: fit-content;
`;

const GrayText = styled.p`
  color: #6d7276;
  text-align: center;
  font-family: Poppins;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 200% */
`;

interface DragAndDropUploadProps {
  onfilesChange?: (files: File[]) => void;
  accept?: string[];
  sizeLimit?: number;
}

const DragAndDropUpload: React.FC<DragAndDropUploadProps> = ({
  onfilesChange,
  accept,
  sizeLimit = 200,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const isInitialMount = useRef(true);

  const validateFile = useCallback(
    (file: File | null) => {
      return (
        file &&
        (!accept ||
          accept.includes(file.type) ||
          accept.includes(`.${file.name.split('.').pop()}`)) &&
        file.size <= sizeLimit * 1024 * 1024
      );
    },
    [accept, sizeLimit],
  );

  useEffect(() => {
    // Prevent onfilesChange from being called on the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (onfilesChange) {
      onfilesChange(files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const newFiles: File[] = [];

    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const file = event.dataTransfer.items[i].getAsFile();

        if (validateFile(file)) {
          newFiles.push(file!);
        }
      }
    } else {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];

        if (validateFile(file)) {
          newFiles.push(file);
        }
      }
    }

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleOpenFileExplorer = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept?.join(',') ?? '*';
    fileInput.multiple = true;
    fileInput.addEventListener('change', (event) => {
      const newFiles: File[] = [];
      const target = event.target as HTMLInputElement;
      const fileList = target.files;
      if (fileList) {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          if (validateFile(file)) {
            newFiles.push(file);
          }
        }
      }
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    });
    fileInput.click();
  };

  return (
    <div className="w-full flex items-center justify-center">
      <DragAndDropContainer onDrop={handleDrop} onDragOver={handleDragOver}>
        <div className="flex flex-col items-center justify-center gap-2 pl-5 pr-5">
          <div className="flex gap-1">
            <p>Drag and drop or</p>
            <button onClick={handleOpenFileExplorer} type="button">
              <LinkTypo>Choose file</LinkTypo>
            </button>
          </div>

          {files.length > 0 ? (
            <ul className="mt-1">
              {files.map((file, index) => (
                <FileListElement key={index}>
                  <div className="flex gap-1 items-center">
                    <AttachmentIcon height={16} width={16} />
                    <AttachmentTypo>{file.name}</AttachmentTypo>
                  </div>

                  <IconButton onClick={() => handleRemoveFile(index)}>
                    <CrossIcon height={16} width={16} />
                  </IconButton>
                </FileListElement>
              ))}
            </ul>
          ) : (
            <GrayText>No file attached</GrayText>
          )}
        </div>
      </DragAndDropContainer>
    </div>
  );
};

export default DragAndDropUpload;
