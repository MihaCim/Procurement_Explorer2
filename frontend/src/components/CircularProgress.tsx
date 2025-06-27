import styled from 'styled-components';

export const CircularProgress = styled.div<{
  size?: number;
  borderWidth?: number;
}>`
  width: ${(props) => props.size ?? 50}px;
  height: ${(props) => props.size ?? 50}px;
  border-radius: 50%;
  border: ${(props) => props.borderWidth ?? 4}px solid var(--bg-white, #ffff);
  border-top: ${(props) => props.borderWidth ?? 4}px solid
    var(--color-primary, #014289);
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
