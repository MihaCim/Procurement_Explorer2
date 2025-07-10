import StyledInputBase, { StyledTextAreaBase } from './StyledInputBase';

export interface TextFieldProps {
  label?: string;
  name: string;
  value: string | number;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  error?: string;
  pattern?: string;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  width?: number;
  rows?: number;
  type?: 'text' | 'number' | 'date' | 'email' | 'password';
  readonly?: boolean;
  onEnter?: () => void;
}

const TextField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows,
  pattern,
  title,
  type = 'text',
  disabled = false,
  fullWidth = false,
  readonly = false,
  onEnter,
  width,
}: TextFieldProps) => {
  return (
    <div
      className="flex flex-col"
      style={{
        width: fullWidth ? '100%' : undefined,
        gap: label ? '2px' : '0px',
      }}
    >
      <label htmlFor={name}>{label}</label>
      {rows ? (
        <StyledTextAreaBase
          id={name}
          placeholder={placeholder}
          name={name}
          value={value}
          title={title}
          rows={rows}
          disabled={disabled}
          onChange={onChange}
          $width={width}
          $fullWidth={fullWidth}
          $error={!!error}
          readOnly={readonly}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter' && onEnter) {
              ev.preventDefault();
              onEnter();
            }
          }}
        />
      ) : (
        <StyledInputBase
          type={type}
          id={name}
          title={title}
          placeholder={placeholder}
          pattern={pattern}
          name={name}
          value={value}
          disabled={disabled}
          autoComplete="off"
          $fullWidth={fullWidth}
          $width={width}
          $error={!!error}
          onChange={onChange}
          readOnly={readonly}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter' && onEnter) {
              onEnter();
            }
          }}
        />
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default TextField;
