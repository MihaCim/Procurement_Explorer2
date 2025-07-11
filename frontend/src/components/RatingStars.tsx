import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { generateColorVector } from '../utils/colorUtils';
import { RiskStatusColors } from '../Const';

const Star: FC<{ color: string }> = ({ color }) => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.4256 11.1267C15.1881 11.3568 15.0791 11.6896 15.1331 12.0159L15.9481 16.5259C16.0168 16.9082 15.8555 17.295 15.5356 17.5159C15.2221 17.7451 14.805 17.7726 14.4631 17.5892L10.4031 15.4717C10.262 15.3966 10.1052 15.3562 9.9448 15.3517H9.69639C9.61022 15.3645 9.52589 15.392 9.44889 15.4342L5.38805 17.5617C5.1873 17.6626 4.95997 17.6983 4.73722 17.6626C4.19455 17.5599 3.83247 17.0429 3.92139 16.4975L4.73722 11.9875C4.7913 11.6584 4.68222 11.3238 4.4448 11.0901L1.13472 7.88175C0.857888 7.61316 0.761638 7.20983 0.888138 6.84591C1.01097 6.48291 1.32447 6.218 1.70305 6.15841L6.25889 5.4975C6.60539 5.46175 6.90972 5.25092 7.06555 4.93925L9.07305 0.823415C9.12072 0.731748 9.18214 0.647415 9.25639 0.575915L9.33889 0.511748C9.38197 0.464081 9.43147 0.424665 9.48647 0.392581L9.58639 0.355915L9.74222 0.291748H10.1281C10.4728 0.327498 10.7762 0.533748 10.9348 0.841748L12.9689 4.93925C13.1156 5.239 13.4006 5.44708 13.7297 5.4975L18.2856 6.15841C18.6706 6.21342 18.9923 6.47925 19.1197 6.84591C19.2398 7.2135 19.1362 7.61683 18.8539 7.88175L15.4256 11.1267Z"
      fill={color}
    />
  </svg>
);

const RatingInputContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const RatingInput = styled.div<{ $ReadOnly?: boolean }>`
  cursor: ${({ $ReadOnly }) => ($ReadOnly ? 'cursor' : 'pointer')};
`;

export const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface IRatingStarsProps {
  value: number;
  max: number;
  onChange?: (value: number) => void;
  name?: string;
  title?: string;
  invert?: boolean;
}

export const RatingStarsStandalone: FC<IRatingStarsProps> = ({
  value,
  max,
  onChange,
  name,
  title,
  invert,
}) => {
  const defaultColorVector = useMemo(
    () => generateColorVector(max, RiskStatusColors),
    [max],
  );

  if (!invert) {
    const color = defaultColorVector[value - 1];
    return (
      <RatingInputContainer>
        {name && <input type="number" hidden value={value} name={name} />}
        {Array.from({ length: max }, (_, index) => (
          <RatingInput
            $ReadOnly={!onChange}
            key={index}
            onClick={onChange ? () => onChange(index + 1) : undefined}
          >
            <Star color={index < value ? color : '#ccc'} />
          </RatingInput>
        ))}
      </RatingInputContainer>
    );
  } else {
    const color = defaultColorVector[max - value];
    return (
      <RatingContainer>
        <span>{title}</span>
        <RatingInputContainer>
          {name && <input type="number" hidden value={value} name={name} />}
          {Array.from({ length: max }, (_, index) => (
            <RatingInput
              $ReadOnly={!onChange}
              key={index}
              onClick={onChange ? () => onChange(max - index) : undefined}
            >
              <Star color={index <= max - value ? color : '#ccc'} />
            </RatingInput>
          ))}
        </RatingInputContainer>
      </RatingContainer>
    );
  }
};

const RatingStars: FC<IRatingStarsProps> = ({
  value,
  max,
  onChange,
  name,
  title,
  invert,
}) => {
  return (
    <RatingContainer>
      <span>{title}</span>
      <RatingStarsStandalone
        value={value}
        max={max}
        onChange={onChange}
        name={name}
        invert={invert}
      />
    </RatingContainer>
  );
};

export default RatingStars;
