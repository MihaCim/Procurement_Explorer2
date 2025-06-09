import styled from "styled-components";

const TooltipText = styled.span`
  display: flex;
  z-index: 1000000;
  padding: 4px 10px;
  justify-content: center;
  align-items: flex-end;
  color: var(--color-white, #fff);
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.13px;

  border-radius: var(--radius-small, 4px);
  background: var(--color-text-primary, #292c3d);
`;

export default TooltipText;
