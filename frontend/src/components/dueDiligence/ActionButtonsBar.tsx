import React from 'react';
import styled from 'styled-components';

import ConfirmedIcon from '../../assets/icons/check.svg?react';
import DeleteIcon from '../../assets/icons/delete.svg?react';
import { useDueDiligenceContext } from '../../context/DueDiligenceProvider';
import DeleteModal from '../modals/DeleteModal';
import PrimaryButton from '../PrimaryButton';

const ActionBarContainer = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;

  padding: 15px 20px;
  display: flex;
  gap: 10px;

  border-radius: 0px 0px 4px 4px;
  border: 1px solid var(--stroke, #ebebf1);
  background: var(--Color-new-bg-card, rgba(255, 255, 255, 0.95));

  /* Bottom bar */
  box-shadow: 0px -1px 4px 0px rgba(217, 218, 224, 0.25);

  z-index: 1000;

  @supports not (position: sticky) {
    position: fixed;
  }
`;

export const ActionButtonsBar: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const { deleteProfile } = useDueDiligenceContext();
  const handleDelete = () => {
    deleteProfile()
      .then(() => {
        setDeleteModalOpen(false);
      })
      .catch((error) => {
        console.error('Error deleting profile:', error);
      });
  };

  const handleConfirm = () => {
    alert('Mark as Confirmed action!');
  };

  return (
    <>
      <ActionBarContainer>
        <div className="flex flex-1 self-stretch w-full h-full relative items-center justify-center">
          <div className="absolute left-0">
            <PrimaryButton
              startEndorment={<DeleteIcon />}
              variant="neutralWithoutBorder"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </PrimaryButton>
          </div>
          <div className="flex gap-2">
            <PrimaryButton
              btnProps={{ type: 'button', disabled: true }}
              startEndorment={<ConfirmedIcon />}
              onClick={handleConfirm}
            >
              Mark as Confirmed
            </PrimaryButton>
          </div>
        </div>
      </ActionBarContainer>
      <DeleteModal
        title="Are you sure you want to delete ?"
        isOpen={deleteModalOpen}
        onRequestClose={() => {
          setDeleteModalOpen(false);
        }}
        onConfirm={handleDelete}
      >
        If you confirm, you won't be able to find this report.
      </DeleteModal>
    </>
  );
};
