import styled from 'styled-components';
import Modal, { ModalActions } from '../modals/Modal';
import Label from './Label';
import StyledInputBase from './StyledInputBase';
import { useEffect, useState } from 'react';
import { H2 } from '../Typography';
import PrimaryButton from '../PrimaryButton';

interface IEditModalProps {
  handleClose: (value: any) => void;
  currentValue: any;
  valueName: string;
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

const EditModalText: React.FC<IEditModalProps> = ({
  handleClose,
  currentValue,
  valueName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
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
      <StyledButton type={'button'} onClick={() => setIsOpen(true)}>
        Edit
      </StyledButton>
      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <StyledContainer>
          <>
            <H2>Edit {valueName}</H2>
            <Label textTitle="Current value" textContent={currentValue} />
          </>
          <InputContainer>
            <InputTitle>New {valueName}</InputTitle>
            <StyledInputBase
              value={value}
              onChange={(e) => setValue(e.target.value)}
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

export default EditModalText;
