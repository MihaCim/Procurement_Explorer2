import React from 'react';
import styled from 'styled-components';

import CalendarIcon from '../../assets/icons/calendar.svg?react';

const StyledInputBase = styled.input<{
  $fullWidth?: boolean;
  $error?: boolean;
}>`
  max-width: ${(props) =>
    props.$fullWidth ? '100%' : 'var(--m-field-width, 308px)'};
  height: 40px;
  padding: 6px 16px;
  border-radius: 5px;
  border: ${(props) =>
    props.$error
      ? '1px solid rgb(239 68 68)'
      : '1px solid var(--gris2, #999aa1)'};
  background: rgba(247, 252, 255, 0.45);
  &:disabled {
    color: #434346;
    border-radius: 5px;
    border: 1px solid #999aa1;
    background: rgba(193, 193, 193, 0.45);
  }
`;

const StyledDivBase = styled.div<{
  $fullWidth?: boolean;
  $error?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: ${(props) =>
    props.$fullWidth ? '100%' : 'var(--m-field-width, 308px)'};
  height: 40px;
  padding: 6px 16px;
  border-radius: 5px;
  border: ${(props) =>
    props.$error
      ? '1px solid rgb(239 68 68)'
      : '1px solid var(--gris2, #999aa1)'};
  background: rgba(247, 252, 255, 0.45);
  &:disabled {
    color: #434346;
    border-radius: 5px;
    border: 1px solid #999aa1;
    background: rgba(193, 193, 193, 0.45);
  }
`;

export const StyledTextAreaBase = styled.textarea<{
  $fullWidth?: boolean;
  $error?: boolean;
}>`
  max-width: ${(props) =>
    props.$fullWidth ? '100%' : 'var(--m-field-width, 308px)'};
  min-height: 40px;
  resize: none;
  padding: 6px 16px;
  border-radius: 5px;
  border: ${(props) =>
    props.$error
      ? '1px solid rgb(239 68 68)'
      : '1px solid var(--gris2, #999aa1)'};
  background: rgba(247, 252, 255, 0.45);
  &:disabled {
    color: #434346;
    border-radius: 5px;
    border: 1px solid #999aa1;
    background: rgba(193, 193, 193, 0.45);
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DateInput = React.forwardRef<HTMLInputElement, any>(
  (props, ref) => {
    return (
      <StyledDivBase>
        <input {...props} ref={ref} className="w-11/12 outline-none" />
        <CalendarIcon onClick={props.onClick} />
      </StyledDivBase>
    );
  },
);

export default StyledInputBase;
