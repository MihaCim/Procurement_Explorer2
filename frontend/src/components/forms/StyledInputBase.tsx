import React from 'react';
import styled from 'styled-components';

import CalendarIcon from '../../assets/icons/calendar.svg?react';

const StyledInputBase = styled.input<{
  $fullWidth?: boolean;
  $width?: number;
  $error?: boolean;
}>`
  max-width: ${(props) =>
    props.$fullWidth
      ? '100%'
      : props.$width
        ? `${props.$width}px`
        : 'var(--m-field-width, 384px)'};
  height: 40px;
  padding: 6px 16px;
  border-radius: 2px;
  border: ${(props) =>
    props.$error
      ? '1px solid rgb(239 68 68)'
      : '1px solid var(--stroke, #EBEBF1)'};
  background: var(--color-white, #fff);
  &:disabled {
    color: #434346;
    border-radius: 2px;
    border: 1px solid var(--stroke, #ebebf1);
    background: var(--color-white, #fff);
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

  border-radius: 2px;
  border: ${(props) =>
    props.$error
      ? '1px solid rgb(239 68 68)'
      : '1px solid var(--stroke, #EBEBF1)'};
  background: var(--color-white, #fff);
  &:disabled {
    color: #434346;
    border-radius: 2px;
    border: 1px solid var(--stroke, #ebebf1);
    background: var(--color-white, #fff);
  }
`;

export const StyledTextAreaBase = styled.textarea<{
  $fullWidth?: boolean;
  $width?: number;
  $error?: boolean;
}>`
  max-width: ${(props) =>
    props.$fullWidth
      ? '100%'
      : props.$width
        ? `${props.$width}px`
        : 'var(--m-field-width, 384px)'};
  min-height: 40px;
  resize: none;
  padding: 6px 16px;
  border-radius: 2px;
  border: ${(props) =>
    props.$error
      ? '1px solid rgb(239 68 68)'
      : '1px solid var(--stroke, #EBEBF1)'};
  background: var(--color-white, #fff);
  &:disabled {
    color: #434346;
    border-radius: 2px;
    border: 1px solid var(--stroke, #ebebf1);
    background: var(--color-white, #fff);
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
