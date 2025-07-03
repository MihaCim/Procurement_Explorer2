import { ComponentType, PropsWithChildren } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

const ModalSafeForReact18 = Modal as unknown as ComponentType<
  ReactModal['props']
>;
Modal.setAppElement('#root');

const modalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    overflow: 'visible',
    background: 'var(--color-white, #ffffff)',
  },
  overlay: { zIndex: 1000, background: 'rgba(0, 0, 0, 0.5)' },
};

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  align-items: flex-start;
  gap: var(--gap-form-top, 32px);
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: var(--between-btn, 32px);
  align-self: stretch;
`;

const BaseModal = (
  props: PropsWithChildren<{
    isOpen: boolean;
    onRequestClose: () => void;
    labelledby: string;
    describedby: string;
    overflow?: boolean;
    size?: 'sm' | 'm' | 'l';
  }>,
) => {
  return (
    <ModalSafeForReact18
      style={modalStyle}
      {...props}
      //a11y
      role={'modal'}
      shouldReturnFocusAfterClose={true}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={true}
      aria={{
        modal: true,
        labelledby: props.labelledby,
        describedby: props.describedby,
      }}
    >
      <>{props.children}</>
    </ModalSafeForReact18>
  );
};

export default BaseModal;
