import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';

import SearchIcon from '../../assets/icons/search.svg?react';

interface SearchButtonProps extends PropsWithChildren {
  onClick: () => void;
}

const Button = styled.button`
  display: flex;
  padding: 8px 12px;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 0px 4px 4px 0px;
  background: var(--color-primary, #014289);
  &:hover {
    background: #003064;
  }
`;

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <Button type="button" onClick={onClick}>
      <SearchIcon />
    </Button>
  );
};

export default SearchButton;
