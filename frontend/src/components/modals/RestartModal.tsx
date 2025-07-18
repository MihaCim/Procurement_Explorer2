import { PropsWithChildren } from 'react';

import { ModalActions, PrimaryButton } from '../';
import { H1 } from '../Typography';
import BaseModal from './BaseModal';

export interface ConfirmationModalProps extends PropsWithChildren {
  isOpen: boolean;
  loading?: boolean;
  title?: string;
  onRequestClose: () => void;
  onConfirm: () => void;
}

const RestartModal = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading = false,
  title,
  children,
}: ConfirmationModalProps) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      labelledby={'Restart Modal'}
      describedby={'Restart Confirmation Modal'}
    >
      <div className="w-full">
        <div className="mb-20">
          <H1 className="mb-10">{title}</H1>
          <div>{children}</div>
        </div>

        <ModalActions>
          <PrimaryButton
            variant="neutral"
            btnProps={{ type: 'button' }}
            onClick={onRequestClose}
          >
            No, cancel
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            loading={loading}
            btnProps={{ type: 'button' }}
            onClick={onConfirm}
          >
            Yes, restart
          </PrimaryButton>
        </ModalActions>
      </div>
    </BaseModal>
  );
};

export default RestartModal;
