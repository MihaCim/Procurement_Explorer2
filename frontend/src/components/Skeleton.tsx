import React from 'react';
import styled, { keyframes } from 'styled-components';

const SkeletonAnimation = keyframes`
0% {
  background-color: hsla(200, 5%, 80%, 35%);
}
100% {
  background-color: hsla(200, 10%, 90%, 25%);
}
  `;

const SkeletonRectangular = styled.div<{ height: string }>`
  width: 100%;
  min-width: 200px;
  height: ${(props) => props.height};
  border-radius: 4px;
  animation: ${SkeletonAnimation} 1s linear infinite alternate;
`;
const Skeleton: React.FC<{ height?: number }> = ({ height = 20 }) => {
  return <SkeletonRectangular height={`${height}px`} />;
};

export default Skeleton;
