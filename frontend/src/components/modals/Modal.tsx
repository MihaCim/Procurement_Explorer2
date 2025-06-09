import React, { useEffect } from 'react';
import ReactModal, { Props } from 'react-modal';
import styled from 'styled-components';

ReactModal.setAppElement('#root');

const modalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: 'none',
    border: 'none',
    overflow: 'visible',
  },
  overlay: { zIndex: 1000 },
};

const ModalContainer = styled.div`
  display: flex;
  padding: 32px 48px;
  min-width: 688px;
  max-width: 80vw;

  font-size: 14px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 12px;
  background: var(--color-white, #fff);

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

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

const Modal = (
  props: Props & { overflow?: boolean; size?: 'sm' | 'm' | 'l' },
) => {
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.keyCode === 27 && props.onRequestClose) {
        props.onRequestClose({} as unknown as React.MouseEvent);
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [props]);

  return (
    <ReactModal style={modalStyle} {...props} role={'modal'}>
      <ModalContainer
        style={{
          overflow: props.overflow ? 'scroll' : undefined,
          maxWidth:
            props.size === 'sm' ? '40vw' : props.size === 'm' ? '65vw' : '80vw',
        }}
      >
        {props.children}
      </ModalContainer>
    </ReactModal>
  );
};

export default Modal;
