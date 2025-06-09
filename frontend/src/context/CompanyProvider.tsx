import React, { createContext, ReactNode, useState } from 'react';
import { Company } from '../models/Company';
import useCompanyService from '../services/companyService';

interface CompanyContextProps {
  state: ICompanyState;
  setCompanies: (companies: Company[]) => void;
  searchCompany: (text: string) => void;
  searchCompanyByDescription: (text: string) => void;
  searchCompanyByFile: (file: File) => void;
}
export interface ICompanyState {
  companies: Company[];
  selectedCompany?: Company;
  loading: boolean;
}
const CompanyContext = createContext({} as CompanyContextProps);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { getCompaniesByText, getCompaniesByDescription, getCompaniesByFile } =
    useCompanyService();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchCompany = (text: string) => {
    setIsLoading(true);
    getCompaniesByText(text)
      .then((data) => {
        setCompanies(data);
      })
      .finally(() => setIsLoading(false));
  };
  const searchCompanyByDescription = (text: string) => {
    setIsLoading(true);
    getCompaniesByDescription(text)
      .then((data) => {
        setCompanies(data);
      })
      .finally(() => setIsLoading(false));
  };
  const searchCompanyByFile = (file: File) => {
    setIsLoading(true);
    getCompaniesByFile(file)
      .then((data) => {
        setCompanies(data);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <CompanyContext.Provider
      value={{
        state: {
          companies: companies ?? [],
          selectedCompany: undefined,
          loading: isLoading ?? false,
        },
        setCompanies,
        searchCompany,
        searchCompanyByDescription,
        searchCompanyByFile,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCompanyContext = () => React.useContext(CompanyContext);
