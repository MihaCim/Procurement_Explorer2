import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface IButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: any) => void;
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'contained' | 'outlined' | 'reject' | 'neutral';
  startEndorment?: React.ReactNode;
  endEndorment?: React.ReactNode;
  btnProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const PrimaryContainedButton = styled.button`
  display: inline-flex;
  padding: 8px 10px;
  font-size: 14px;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-small, 4px);
  background: var(--color-primary, #014289);
  color: var(--color-white, #ffffff);
  box-shadow: 0px 2px 12px 0px rgba(17, 27, 82, 0.15);
  font-weight: 400;
  &:disabled {
    background: var(--color-disabled, #a8a9ab);
    box-shadow: none;
    &:hover {
      background: var(--color-disabled, #a8a9ab);
    }
  }
  &:hover {
    background: var(--color-hover-primary, #f3f3f8);
    box-shadow: none;
  }
  & > svg > path {
    fill: var(--color-white, #ffffff);
  }

  cursor: pointer;
`;

const PrimaryRejectButton = styled(PrimaryContainedButton)`
  background: var(--color-text-primary, #292c3d);
  color: var(--color-white, #ffffff);
  &:hover {
    background: var(--color-text-secondary, #121213);
  }
  & > svg > path {
    fill: var(--color-white, #ffffff);
  }
  cursor: pointer;
`;

const PrimaryOutlinedButton = styled(PrimaryContainedButton)`
  border: 1px solid var(--color-primary, #014289);
  background: var(--color-white, #ffffff);
  color: var(--color-primary, #014289);
  box-shadow: none;
  &:hover {
    background: var(--color-hover-secondary, #f3f3f8);
  }
  & > svg > path {
    fill: var(--color-primary, #014289);
  }
  cursor: pointer;
`;

const NeutralButton = styled(PrimaryOutlinedButton)`
  border-radius: var(--radius, 4px);
  border: 1px solid var(--grey-1, #44444a);
  background: var(--color-white, #ffffff);
  color: var(--grey-1, #44444a);
  box-shadow: none;
  &:hover {
    background: #efeff4;
  }
  & > svg > path {
    fill: var(--grey-1, #44444a);
  }
  cursor: pointer;
`;

const LoadingSpinnerAnimation = keyframes`
from {
  transform: rotate(0turn);
}

to {
  transform: rotate(1turn);
}`;

const Spinner = styled.div`
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${LoadingSpinnerAnimation} 1s ease infinite;
`;

const ButtonContent = ({
  children,
  startEndorment,
  endEndorment,
  loading = false,
}: IButtonProps) => (
  <>
    {loading ? <Spinner></Spinner> : startEndorment}
    <div className="px-2">{children}</div>
    {endEndorment}
  </>
);

const PrimaryButton = ({
  variant = 'contained',
  btnProps,
  ...props
}: IButtonProps) => {
  return variant === 'contained' ? (
    <PrimaryContainedButton
      onClick={props.onClick}
      type="button"
      {...btnProps}
      disabled={!!props.loading || btnProps?.disabled}
    >
      <ButtonContent {...props} />
    </PrimaryContainedButton>
  ) : variant === 'outlined' ? (
    <PrimaryOutlinedButton onClick={props.onClick} type="button" {...btnProps}>
      <ButtonContent {...props} />
    </PrimaryOutlinedButton>
  ) : variant === 'reject' ? (
    <PrimaryRejectButton onClick={props.onClick} type="button" {...btnProps}>
      <ButtonContent {...props} />
    </PrimaryRejectButton>
  ) : variant === 'neutral' ? (
    <NeutralButton
      onClick={props.onClick}
      type="button"
      {...btnProps}
      disabled={!!props.loading || btnProps?.disabled}
    >
      <ButtonContent {...props} />
    </NeutralButton>
  ) : null;
};

export default PrimaryButton;
