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
  border-radius: 50%;
  &:hover {
    background: var(--color-hover-primary, #003064);
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const ContainedButton = styled.button`
  display: flex;

  padding: 8px 18px 8px 10px;
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

const OutlinedButton = styled.button`
  display: flex;

  padding: 8px 18px 8px 10px;
  justify-content: flex-end;
  align-items: center;
  border-radius: var(--radius-radius-small, 4px);
  border: 1px solid var(--color-primary, #014289);
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
    <ContainedButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </ContainedButton>
  ) : variant === 'outlined' ? (
    <OutlinedButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </OutlinedButton>
  ) : (
    <Button type="button" onClick={onClick} disabled={disabled} style={style}>
      {children}
    </Button>
  );
};

export default IconButton;
