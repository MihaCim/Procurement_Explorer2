import React from 'react';
import styled, { keyframes } from 'styled-components';

const SkeletonAnimation = keyframes`
0% {
  background-color: hsl(200, 5%, 80%);
}
100% {
  background-color: hsl(200, 20%, 95%);
}
  `;

const SkeletonRectangular = styled.div<{ height: string }>`
  width: 100%;
  height: ${(props) => props.height};
  border-radius: 4px;
  animation: ${SkeletonAnimation} 1s linear infinite alternate;
`;
const Skeleton: React.FC<{ height?: number }> = ({ height = 20 }) => {
  return <SkeletonRectangular height={`${height}px`} />;
};

export default Skeleton;
