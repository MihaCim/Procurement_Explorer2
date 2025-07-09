import React, { createContext, ReactNode, useCallback, useState } from 'react';

import { Company } from '../models/Company';
import useCompanyService from '../services/companyService';

interface CompanyContextProps {
  state: ICompanyState;
  resetSearchState: () => void;
  searchCompany: (text: string, newSearch?: boolean) => void;
  searchCompanyByDescription: (text: string) => void;
  searchCompanyByFile: (file: File) => void;
  fetchMore: () => void;
}

export type SearchType = 'text' | 'description' | 'file' | null;

interface CompanySearch {
  hasMore: boolean;
  companies: Company[];
  currentOffset: number;
  lastSearchText: string | null;
  lastSearchType: SearchType;
  totalCompanies: number;
  documentProfile: string | null;
}

export interface ICompanyState {
  companies: Company[];
  selectedCompany?: Company;
  loading: boolean;
  firstLoaded: boolean;
  loaded: boolean;
  hasMore: boolean;
  lastSearchType: SearchType;
  documentProfile: string | null;
}

const CompanyContext = createContext({} as CompanyContextProps);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { getCompaniesByText, getCompaniesByDescription, getCompaniesByFile } =
    useCompanyService();

  const [companySearch, setCompanySearch] = useState<CompanySearch>({
    companies: [],
    hasMore: false,
    currentOffset: 0,
    lastSearchText: null,
    lastSearchType: null,
    totalCompanies: 0,
    documentProfile: null,
  });
  const [currentTextSearchQuery, setCurrentTextSearchQuery] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);

  const setCompanies = useCallback((companies: Company[]) => {
    setCompanySearch((prev) => ({ ...prev, companies }));
  }, []);

  const resetSearchState = useCallback(() => {
    setCompanies([]);
    setCompanySearch({
      companies: [],
      hasMore: false,
      currentOffset: 0,
      lastSearchText: null,
      lastSearchType: null,
      totalCompanies: 0,
      documentProfile: null,
    });
    setLoaded(false);
  }, [setCompanies]);

  const searchCompany = useCallback(
    (text: string, newSearch: boolean = true) => {
      if (newSearch) {
        resetSearchState(); // Reset for a brand new search
        setCurrentTextSearchQuery(text); // Store the text for subsequent fetches
      }
      setIsLoading(true);
      const offsetToUse = newSearch ? 0 : companySearch.currentOffset;

      getCompaniesByText(text, offsetToUse)
        .then((data) => {
          setCompanySearch((prev) => ({
            hasMore: offsetToUse + data.limit < data.total,
            companies: newSearch
              ? data.companies
              : [...prev.companies, ...data.companies],
            currentOffset: offsetToUse + data.limit,
            lastSearchText: text,
            lastSearchType: 'text',
            totalCompanies: data.total,
            documentProfile: null,
          }));
          setFirstLoaded(true);
          setLoaded(true);
        })
        .finally(() => setIsLoading(false));
    },
    [companySearch.currentOffset, getCompaniesByText, resetSearchState],
  );

  const searchCompanyByDescription = useCallback(
    (text: string) => {
      setIsLoading(true);
      resetSearchState();
      setCurrentTextSearchQuery(null);

      getCompaniesByDescription(text)
        .then((data) => {
          setCompanySearch({
            hasMore: false, // No pagination for this type
            companies: data,
            currentOffset: 0,
            lastSearchText: null,
            lastSearchType: 'description',
            totalCompanies: data.length,
            documentProfile: null,
          });
          setFirstLoaded(true);
          setLoaded(true);
        })
        .finally(() => setIsLoading(false));
    },
    [getCompaniesByDescription, resetSearchState],
  );

  const searchCompanyByFile = useCallback(
    (file: File) => {
      resetSearchState();
      setCurrentTextSearchQuery(null);
      setIsLoading(true);

      getCompaniesByFile(file)
        .then((data) => {
          setCompanySearch({
            hasMore: false, // No pagination for this type
            companies: data?.companies_list ?? [],
            currentOffset: 0,
            lastSearchText: null,
            lastSearchType: 'file',
            totalCompanies: data?.companies_list.length ?? 0,
            documentProfile: (data?.document_profile as string) ?? null,
          });

          setFirstLoaded(true);
          setLoaded(true);
        })
        .finally(() => setIsLoading(false));
    },
    [getCompaniesByFile, resetSearchState],
  );

  const fetchMore = useCallback(() => {
    // Only fetch more if the last search was a 'text' search and there's more data
    if (
      companySearch.lastSearchType === 'text' &&
      companySearch.hasMore &&
      currentTextSearchQuery
    ) {
      // Call searchCompany with newSearch set to false to append data
      searchCompany(currentTextSearchQuery, false);
    }
  }, [
    companySearch.lastSearchType,
    companySearch.hasMore,
    currentTextSearchQuery,
    searchCompany,
  ]);

  return (
    <CompanyContext.Provider
      value={{
        state: {
          firstLoaded,
          loaded,
          companies: companySearch.companies,
          selectedCompany: undefined,
          loading: isLoading,
          hasMore: companySearch.hasMore,
          lastSearchType: companySearch.lastSearchType,
          documentProfile: companySearch.documentProfile,
        },
        resetSearchState,
        searchCompany,
        searchCompanyByDescription,
        searchCompanyByFile,
        fetchMore,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCompanyContext = () => React.useContext(CompanyContext);
