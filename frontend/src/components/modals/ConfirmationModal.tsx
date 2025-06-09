import { PropsWithChildren } from "react";

import { Modal, ModalActions, PrimaryButton } from "..";
import { H1 } from "../Typography";

export interface ConfirmationModalProps extends PropsWithChildren {
  isOpen: boolean;
  loading?: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onRequestClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal = ({
  isOpen,
  onRequestClose,
  onConfirm,
  loading = false,
  title,
  cancelText = 'No',
  confirmText = 'Yes',
  children,
}: ConfirmationModalProps) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="w-full">
        <div className="mb-20">
          <H1 className="mb-10">{title}</H1>
          <div>{children}</div>
        </div>

        <ModalActions>
          <PrimaryButton
            variant="outlined"
            btnProps={{ type: 'button' }}
            onClick={onRequestClose}
          >
            {cancelText}
          </PrimaryButton>
          <PrimaryButton
            loading={loading}
            btnProps={{ type: 'button' }}
            onClick={onConfirm}
          >
            {confirmText}
          </PrimaryButton>
        </ModalActions>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
