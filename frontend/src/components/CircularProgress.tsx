import styled from "styled-components";

export const CircularProgress = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px solid var(--bg-white, #ffff);
  border-top: 4px solid var(--color-primary, #014289);
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
