import React, { useEffect, useState } from 'react';

import { TextField } from '../forms';
import PrimaryButton from '../PrimaryButton';
import { H1 } from '../Typography';
import BaseModal, { ModalActions, ModalContent } from './BaseModal';

export interface IStartGatheringInfoModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: (url: string) => void;
}

const StartGatheringInfoModal: React.FC<IStartGatheringInfoModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
}) => {
  const [url, setUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset the URL when the modal opens
      setUrl('');
    }
  }, [isOpen]);

  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      labelledby={'Start gathering information'}
      describedby={'Start gathering information'}
    >
      <ModalContent className="w-full">
        <H1 className="mb-8">Start gathering information</H1>
        <div>
          <p>
            To start gathering information, please insert the url of the company
            you're examining.
          </p>
          <TextField
            label="Company URL"
            value={url}
            onChange={(e) => {
              // Validate URL format
              const urlPattern = new RegExp(
                '^(https?:\\/\\/)?' + // protocol
                  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                  '((\\d{1,3}\\.){3}\\d{1,3})|' + // OR ip (v4) address
                  'localhost)' + // OR localhost
                  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                  '(\\#[-a-z\\d_]*)?$', // fragment locator
                'i',
              );
              if (!urlPattern.test(e.currentTarget.value)) {
                setError('Please enter a valid URL.');
              } else {
                setError(null);
              }
              setUrl(e.currentTarget.value);
            }}
            name="url"
            error={error ?? undefined}
            onEnter={() => onConfirm(url)}
          />
        </div>

        <ModalActions>
          <PrimaryButton
            variant="outlined"
            btnProps={{ type: 'button' }}
            onClick={onRequestClose}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            btnProps={{ type: 'button', disabled: !url || !!error }}
            onClick={() => onConfirm(url)}
          >
            Start
          </PrimaryButton>
        </ModalActions>
      </ModalContent>
    </BaseModal>
  );
};

export default StartGatheringInfoModal;
