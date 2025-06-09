import React from "react";
import styled from "styled-components";

const StyledInput = styled.input`
  font-size: 13px;
  padding: 8px 12px;
  min-width: 300px;
  border: 1px solid #a4aab4;
  border-radius: 4px;
  height: 40px;
`;

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <StyledInput {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}

export default DebouncedInput;
