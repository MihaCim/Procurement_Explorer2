import React, { useState } from "react";
import styled from "styled-components";

import SearchButton from "./commons/SearchButton";
import DragAndDropUpload from "./forms/DragAndDropUpload";
import Select from "./forms/Select";
import TextField from "./forms/TextField";

const SearchContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  width: 535px;
`;
interface SearchBarProps {
  onSearch: (
    searchType: SearchType,
    file: File | null,
    text: string,
    description: string,
  ) => void;
}
export enum SearchType {
  Document = 'Document',
  Description = 'Description',
  Text = 'Text',
}
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [selectedSearchType, setSelectedSearchType] = useState<string>(
    SearchType.Document,
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchDescription, setSearchDescription] = useState('');

  return (
    <SearchContainer>
      <Select
        name="select"
        value={selectedSearchType}
        onChange={(option) => {
          setSelectedSearchType(option);
        }}
        options={[SearchType.Document, SearchType.Description, SearchType.Text]}
      ></Select>
      {selectedSearchType === SearchType.Document && (
        <DragAndDropUpload
          singleFile
          onfilesChange={(files) => {
            setSelectedFile(files[0]);
          }}
        ></DragAndDropUpload>
      )}
      {selectedSearchType === SearchType.Text && (
        <TextField
          name="textSearch"
          fullWidth
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        ></TextField>
      )}
      {selectedSearchType === SearchType.Description && (
        <TextField
          name="descriptionSearch"
          fullWidth
          placeholder="I'm looking for a company that manufactures offices in Luxembourg"
          value={searchDescription}
          rows={3}
          onChange={(e) => setSearchDescription(e.target.value)}
        ></TextField>
      )}
      <div>
        <SearchButton
          onClick={() =>
            onSearch(
              selectedSearchType as SearchType,
              selectedFile,
              searchText,
              searchDescription,
            )
          }
        />
      </div>
    </SearchContainer>
  );
};

export default SearchBar;
