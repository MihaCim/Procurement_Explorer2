import LoadingIconfixed from '../assets/icons/loading.svg?react';
import styled from 'styled-components';

const LoadingIcon = styled(LoadingIconfixed)`
  animation: spin 1s linear infinite;

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default LoadingIcon;
