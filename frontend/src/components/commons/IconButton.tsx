import React, { CSSProperties, PropsWithChildren } from 'react';
import styled from 'styled-components';

interface IconButtonProps extends PropsWithChildren {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'outlined' | 'contained';
  style?: CSSProperties | undefined;
}

const Button = styled.button`
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  &:hover {
    background: #f3f3f8;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  cursor: pointer;
  justify-content: flex-end;
  align-items: center;
  border-radius: var(--radius-radius-small, 4px);
  background: var(--Color-color-primary, #014289);
  box-shadow: 0px 2px 12px 0px rgba(17, 27, 82, 0.15);
  color: #fff;
  gap: 8px;
  &:hover {
    background: var(--color-hover-primary, #003064);
  }
`;

const DefaultButton = styled.button`
  display: flex;
  cursor: pointer;

  justify-content: flex-end;
  align-items: center;
  background: #fff;
  color: var(--color-primary, #014289);
  gap: 8px;
  &:hover {
    background: var(--color-hover-secondary, #f3f3f8);
  }
`;

const IconButton: React.FC<IconButtonProps> = ({
  children,
  disabled = false,
  onClick,
  variant = undefined,
  style = undefined,
}) => {
  return variant === 'contained' ? (
    <PrimaryButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </PrimaryButton>
  ) : variant === 'outlined' ? (
    <DefaultButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </DefaultButton>
  ) : (
    <Button type="button" onClick={onClick} disabled={disabled} style={style}>
      {children}
    </Button>
  );
};

export default IconButton;
