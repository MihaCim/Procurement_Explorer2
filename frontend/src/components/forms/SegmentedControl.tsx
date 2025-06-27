import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

interface ISegmentedControlProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
}

const Container = styled.div`
  position: relative;
  display: flex;
  border: 1px solid var(--color-primary, #014289);
  border-radius: 9999px;
  background-color: transparent;
  padding: 4px;
  width: fit-content;
`;

const OptionButton = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 400;
  border: none;
  background: none;
  color: ${({ $active }) =>
    $active ? '#ffffff' : 'var(--color-primary, #014289)'};
  cursor: pointer;
  transition: color 0.3s ease;
`;

const Slider = styled.div<{
  width: number;
  $left: number;
}>`
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 9999px;
  background-color: var(--color-primary, #014289);
  transition: all 0.3s ease;
  z-index: 0;
  width: ${({ width }) => width}px;
  left: ${({ $left }) => $left}px;
`;

const SegmentedControl: React.FC<ISegmentedControlProps> = ({
  options,
  value,
  onChange,
}) => {
  const selectedIndex = useMemo(
    () => (value ? options.indexOf(value) : 0),
    [options, value],
  );

  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0 });
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleOptionChange = useCallback(
    (option: string) => {
      onChange(option);
    },
    [onChange],
  );

  useEffect(() => {
    const button = buttonRefs.current[selectedIndex];
    if (button) {
      setSliderStyle({
        width: button.offsetWidth,
        left: button.offsetLeft,
      });
    }
  }, [selectedIndex]);

  return (
    <Container>
      <Slider width={sliderStyle.width} $left={sliderStyle.left} />
      {options.map((label, i) => (
        <OptionButton
          key={label}
          $active={i === selectedIndex}
          onClick={() => handleOptionChange(label)}
          ref={(el) => {
            if (el) buttonRefs.current[i] = el;
          }}
        >
          {label}
        </OptionButton>
      ))}
    </Container>
  );
};

export default SegmentedControl;
