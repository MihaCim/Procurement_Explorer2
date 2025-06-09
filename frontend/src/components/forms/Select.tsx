import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import dropdownIcon from '../../assets/icons/dropdownIcon.svg';
import StyledInputBase from './StyledInputBase';

interface SelectProps {
  label?: string;
  options: readonly string[];
  error?: string;
  placeholder?: string;
  name: string;
  fullwidth?: boolean;
  value: string;
  onChange: (option: string) => void;
}

export const DropDownMenu = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  top: 100%;
  left: 0;
  right: 0;
  border: 1px solid #ebebf1;
  background: #fff;
  border-radius: 4px;
  padding: 0.3rem 0rem;
  color: var(--color-text-secondary, #121213);
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);

  z-index: 500;
  cursor: pointer;
  max-height: 200px;
  overflow-y: auto;
`;

export const DropDownItem = styled.button`
  transition: background-color 0.3s;
  text-align: start;
  width: 100%;
  padding: 4px 12px;
  &:hover {
    background-color: #f1f1f1;
  }
`;
export const DropDown = styled.div`
  position: relative;
  border-radius: var(--radius-radius-small, 4px) 0px 0px
    var(--radius-radius-small, 4px);
  background: #f3f4fc;
  display: flex;
  width: 132px;
  justify-content: flex-end;
  align-items: center;
`;

export const DropDownToggle = styled.div`
  cursor: pointer;

  background-image: url(${dropdownIcon});
  background-repeat: no-repeat;
  background-position: right 8px center;
`;

const StyledInputBaseDropdown = styled(StyledInputBase)`
  padding-right: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  white-space: nowrap;
  width: 100%;
`;

const Select: React.FC<SelectProps> = ({
  label,
  options,
  name,
  placeholder,
  onChange,
  value,
  error,
  fullwidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const dropdownPortal = isOpen
    ? ReactDOM.createPortal(
        <DropDownMenu>
          {options.map((option) => (
            <DropDownItem
              key={option}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </DropDownItem>
          ))}
        </DropDownMenu>,
        dropdownRef.current as Element,
      )
    : null;

  return (
    <div style={{ width: fullwidth ? '100%' : 'max-content' }}>
      {label && <label>{label}</label>}
      <DropDown ref={dropdownRef}>
        <DropDownToggle onClick={toggleDropdown}>
          <StyledInputBaseDropdown
            value={value}
            name={name}
            placeholder={placeholder}
            $fullWidth={fullwidth}
            readOnly
          />
        </DropDownToggle>
        {dropdownPortal}
        {error && <p>{error}</p>}
      </DropDown>
    </div>
  );
};

export default Select;
