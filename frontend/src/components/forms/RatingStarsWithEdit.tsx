import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import Modal, { ModalActions } from '../modals/BaseModal';
import PrimaryButton from '../PrimaryButton';
import RatingStars, { RatingStarsStandalone } from '../RatingStars';
import { H2 } from '../Typography';

interface IRatingStarsWEditProps {
  currentValue: number;
  max: number;
  handleClose: (value: number) => void;
  name?: string;
  title?: string;
  invert?: boolean;
}

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  align-self: stretch;
`;

const StyledButton = styled.button`
  color:  #014289
  font-weight: 500;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
`;

const InputTitle = styled.div`
  color: #292c3d;

  font-style: normal;
  font-weight: 400;
`;

const RatingStarsWEdit: FC<IRatingStarsWEditProps> = ({
  currentValue,
  handleClose,
  max,
  invert,
  name,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const onConfirm = () => {
    setLoading(true);
    try {
      handleClose(value);
    } catch (e) {
      console.log('error');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) setValue(currentValue);
  }, [currentValue, isOpen]);

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span>{title}</span>
        <StyledButton onClick={() => setIsOpen(true)}>Edit</StyledButton>
      </div>
      <RatingStarsStandalone max={max} value={currentValue} invert={invert} />
      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <StyledContainer>
          <>
            <H2>Edit {title}</H2>
            <RatingStars
              max={max}
              value={currentValue}
              title={'Current value'}
              invert={invert}
              name={name}
            />
          </>
          <InputContainer>
            <InputTitle>New {title}</InputTitle>
            <RatingStars
              max={max}
              value={value}
              onChange={(value) => setValue(value)}
              invert={invert}
            />
          </InputContainer>
          <ModalActions>
            <PrimaryButton
              variant="outlined"
              btnProps={{ type: 'button' }}
              onClick={() => setIsOpen(false)}
            >
              Close
            </PrimaryButton>
            <PrimaryButton
              loading={loading}
              btnProps={{ type: 'button' }}
              onClick={onConfirm}
            >
              Confirm
            </PrimaryButton>
          </ModalActions>
        </StyledContainer>
      </Modal>
    </>
  );
};

export default RatingStarsWEdit;
