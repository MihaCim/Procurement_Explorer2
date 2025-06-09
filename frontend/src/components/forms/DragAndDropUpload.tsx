import React, { useCallback, useEffect, useState } from 'react';
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
`;

const DragAndDropContainer = styled.div`
  display: flex;
  width: 354px;
  height: 40px;
  padding: 8px 77px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border: 1px dashed #a4aab4;
  background: #f9f9f9;
`;

const LabelTypo = styled.p`
  color: var(--color-text-primary, #212128);
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

const FileListElement = styled.li`
  display: flex;
  padding-bottom: 4px;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #d2d2d5;
  width: fit-content;
`;

const FileName = styled(AttachmentTypo)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* Adjust the max-width as needed */
`;

interface DragAndDropUploadProps {
  onfilesChange?: (files: File[]) => void;
  singleFile?: boolean;
  accept?: string[];
  sizeLimit?: number;
  label?: string;
}

const DragAndDropUpload: React.FC<DragAndDropUploadProps> = ({
  onfilesChange,
  singleFile = false,
  accept,
  sizeLimit = 200,
  label,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const validateFile = useCallback(
    (file: File | null) => {
      return (
        file &&
        (!accept || accept.includes(file.type)) &&
        file.size <= sizeLimit * 1024 * 1024
      );
    },
    [accept, sizeLimit],
  );

  useEffect(() => {
    if (onfilesChange) {
      onfilesChange(files);
    }
  }, [files, onfilesChange]);

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

    if (singleFile) {
      setFiles(newFiles.slice(0, 1));
    } else {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setFiles([]);
  };

  const handleOpenFileExplorer = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept?.join(',') ?? '*';
    fileInput.multiple = !singleFile;
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
      if (singleFile) {
        setFiles(newFiles.slice(0, 1));
      } else {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }
    });
    fileInput.click();
  };

  return (
    <div>
      {label && <LabelTypo>{label}</LabelTypo>}

      <DragAndDropContainer onDrop={handleDrop} onDragOver={handleDragOver}>
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex gap-1">
            {singleFile && files.length > 0 ? (
              <>
                <div className="flex gap-1">
                  <AttachmentIcon />
                  <FileName>{files[0].name}</FileName>
                </div>

                <IconButton onClick={handleRemoveFile}>
                  <CrossIcon />
                </IconButton>
              </>
            ) : (
              <>
                <p>Drag and drop or</p>
                <button onClick={handleOpenFileExplorer} type="button">
                  <LinkTypo>Choose file</LinkTypo>
                </button>
              </>
            )}
          </div>
        </div>
      </DragAndDropContainer>
      {files.length > 0 && !singleFile && (
        <ul className="mt-4">
          {files.map((file, index) => (
            <FileListElement key={index}>
              <div className="flex gap-1">
                <AttachmentIcon />
                <FileName>{file.name}</FileName>
              </div>

              <IconButton onClick={handleRemoveFile}>
                <CrossIcon />
              </IconButton>
            </FileListElement>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DragAndDropUpload;
