import styled, { keyframes } from "styled-components";

const Loader = styled.div`
  width: 500px;
  margin: 0 auto;
  border-radius: 10px;
  border: 4px solid transparent;
  position: relative;
  padding: 1.5px 1px;
  ::before {
    content: "";
    position: absolute;
    top: -4px;
    right: -4px;
    bottom: -4px;
    left: -4px;
  }
`;

const LoadingAnim = keyframes`
  0% {
    left:0%;
    right:100%;
    width:0%;
  }
  10% {
    left:0%;
    right:75%;
    width:20%;
  }
  90% {
    right:0%;
    left:75%;
    width:20%;
  }
  100% {
    left:100%;
    right:0%;
    width:0%;
  }
  `;

const LoaderBar = styled.div`
  position: absolute;
  border-radius: 10px;
  top: 0;
  right: 100%;
  bottom: 0;
  left: 0;
  background: var(--color-primary, #014289);
  width: 0;
  animation: ${LoadingAnim} 1.5s linear infinite;
`;

const Progress = () => (
  <Loader>
    <LoaderBar></LoaderBar>
  </Loader>
);

export default Progress;
