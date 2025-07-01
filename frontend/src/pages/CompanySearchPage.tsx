import React, { useState } from 'react';
import styled from 'styled-components';

import SearchIcon from '../assets/icons/search.svg?react';
import IconButton from '../components/commons/IconButton';
import CompaniesGrid from '../components/companies/CompaniesGrid';
import { SegmentedControl, TextField } from '../components/forms';
import DragAndDropUpload from '../components/forms/DragAndDropUpload';
import PageContainer from '../components/PageContainer';
import { LargeFontH1 } from '../components/Typography';
import { useCompanyContext } from '../context/CompanyProvider';

const Content = styled.div<{ $loaded: boolean }>`
  display: flex;
  padding: ${(props) => (props.$loaded ? '24px' : '148px 24px 24px 24px')};
  flex-direction: column;
  align-items: center;
  gap: 32px;
  flex: 1 0 0;
  align-self: stretch;
`;

const SearchIconButtonContainer = styled.div`
  position: absolute;
  bottom: -1px;
  right: 10px;
`;

const StyledSearchIcon = styled(SearchIcon)<{ $disabled: boolean }>`
  rect {
    fill: ${(props) =>
      props.$disabled ? 'var(--color-disabled, #A8A9AB)' : ''};

    stroke: ${(props) => (props.$disabled ? 'transparent' : '')};
  }
`;

interface CompanySearchPageState {
  option?: string;
  searchTerm: string;
}

const CompanySearchPage: React.FC = () => {
  const [searchState, setSearchState] = useState<CompanySearchPageState>({
    searchTerm: '',
  });

  const {
    state,
    resetSearchState,
    searchCompany,
    searchCompanyByDescription,
    searchCompanyByFile,
  } = useCompanyContext();

  return (
    <PageContainer>
      <Content $loaded={state.firstLoaded}>
        <div className="flex flex-col gap-2 items-center self-stretch">
          <LargeFontH1>Search for a company</LargeFontH1>
        </div>
        <div className="flex flex-col gap-4 items-center self-stretch">
          <SegmentedControl
            options={['Text', 'Description', 'Document']}
            value={searchState?.option}
            onChange={(newVal) => {
              setSearchState((prev) => ({
                ...prev,
                option: newVal,
                searchTerm: '',
              }));
            }}
          />
          {searchState.option === 'Description' ? (
            <div className="flex relative w-full max-w-[620px]">
              <TextField
                name="text_input"
                value={searchState.searchTerm}
                onChange={(ev) => {
                  setSearchState((prev) => ({
                    ...prev,
                    searchTerm: ev.target.value,
                  }));
                }}
                onEnter={() => {
                  searchCompanyByDescription(searchState.searchTerm);
                }}
                rows={4}
                fullWidth
                placeholder="Search"
              />
              <SearchIconButtonContainer>
                <IconButton
                  onClick={() => {
                    searchCompanyByDescription(searchState.searchTerm);
                  }}
                  disabled={!searchState.searchTerm}
                >
                  <StyledSearchIcon
                    $disabled={!searchState.searchTerm}
                    aria-disabled={!searchState.searchTerm}
                  />
                </IconButton>
              </SearchIconButtonContainer>
            </div>
          ) : searchState.option === 'Document' ? (
            <DragAndDropUpload
              accept={['application/pdf']}
              onfilesChange={(files) => {
                if (!files || files.length !== 1) resetSearchState();
                else {
                  searchCompanyByFile(files[0]);
                }
              }}
            />
          ) : (
            <div className="flex relative">
              <TextField
                name="text_input"
                value={searchState.searchTerm}
                onChange={(ev) => {
                  setSearchState((prev) => ({
                    ...prev,
                    searchTerm: ev.target.value,
                  }));
                }}
                onEnter={() => {
                  if (searchState.searchTerm)
                    searchCompany(searchState.searchTerm);
                }}
                placeholder="Search"
              />
              <SearchIconButtonContainer>
                <IconButton
                  onClick={() => {
                    searchCompany(searchState.searchTerm);
                  }}
                  disabled={!searchState.searchTerm}
                >
                  <StyledSearchIcon
                    $disabled={!searchState.searchTerm}
                    aria-disabled={!searchState.searchTerm}
                  />
                </IconButton>
              </SearchIconButtonContainer>
            </div>
          )}
        </div>
        <CompaniesGrid />
      </Content>
    </PageContainer>
  );
};

export default CompanySearchPage;
