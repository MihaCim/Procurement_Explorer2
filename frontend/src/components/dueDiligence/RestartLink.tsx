import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

import RedoIcon from '../../assets/icons/redo3.svg?react';
import RestartModal from '../modals/RestartModal';

const StyledBtnLink = styled.button`
  color: var(--color-primary, #014289);
  display: flex;
  align-items: center;
  gap: 3px;

  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 19px; /* 146.154% */
  letter-spacing: -0.13px;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
  white-space: nowrap;
  cursor: pointer;
`;

interface IRestartLinkProps {
  onConfirm: () => void;
}
const RestartLink: React.FC<
  PropsWithChildren<
    IRestartLinkProps &
      Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>
  >
> = ({ children, onConfirm, ...props }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  return (
    <>
      <StyledBtnLink {...props} onClick={() => setIsModalOpen(true)}>
        <RedoIcon />
        {children}
      </StyledBtnLink>
      <RestartModal
        isOpen={isModalOpen}
        title="Restart Risk Profile Analysis"
        onRequestClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setIsModalOpen(false);
          onConfirm();
        }}
      >
        Are you sure you want to restart the due diligence process ? This will
        reset all the data collected so far.
      </RestartModal>
    </>
  );
};

export default RestartLink;
