import styled from 'styled-components';

const TableCardContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--gap-y, 16px);
  align-self: stretch;
  border-radius: var(--radius-radius-small, 4px);
  border: 1px solid var(--color-stroke, #ebebf1);
  background: var(--background-card, #fff);
  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

export default TableCardContainer;
