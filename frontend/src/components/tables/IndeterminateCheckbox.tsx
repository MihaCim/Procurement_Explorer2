import React, { HTMLProps } from 'react';
import styled from 'styled-components';

const CustomCheckbox = styled.input`
  appearance: none;

  display: flex;
  width: 20px;
  height: 20px;
  padding: var(--gap-input-edit, 2px);
  align-items: center;
  gap: 10px;

  border: 2px solid #222; /* Customize the border color */
  border-radius: 50%;
  position: relative;
  cursor: pointer;

  /* Unchecked state */
  background-color: white;

  &:checked {
    background-color: #f4f5fa; /* Blue color for checked state */
    border-color: #002f86; /* Change border color on check */
  }

  &:checked::before {
    content: '';
    position: absolute;
    top: 3.5px;
    left: 3.5px;
    width: 10px;
    height: 10px;
    background-color: #002f86;
    border-radius: 50%;
  }
`;

export const IndeterminateCheckbox: React.FC<
  {
    indeterminate?: boolean;
  } & HTMLProps<HTMLInputElement>
> = ({ indeterminate, className = '', ...rest }) => {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, indeterminate]);

  return (
    <CustomCheckbox
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  );
};
