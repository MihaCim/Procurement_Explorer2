import React, { createContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@tanstack/react-query';

import Toaster from '../components/Toaster';
import { CompanyProcessing } from '../models/CompanyProcessing';
import { CompanyResult } from '../models/CompanyResult';
import useCompanyService from '../services/companyService';

interface ProcessingCompanyContextProps {
  state: IProcessingCompanyState;
  setProcessingCompanies: (companies: CompanyProcessing[]) => void;
  addNewCompany: (website: string) => void;
  acceptCompany: (companyId: number) => Promise<CompanyResult>;
  rejectCompany: (companyId: number) => Promise<CompanyResult>;
}
export interface IProcessingCompanyState {
  processingCompanies: CompanyProcessing[];
  selectedProcessingCompany?: CompanyProcessing;
  loading: boolean;
  updating: boolean;
}
const ProcessingCompanyContext = createContext(
  {} as ProcessingCompanyContextProps,
);

export const ProcessingCompanyProvider: React.FC = () => {
  const [selectedProcessingCompany, setSelectedProcessingCompany] = useState<
    CompanyProcessing | undefined
  >();
  const {
    addCompany,
    acceptCompany: acceptCompanyService,
    rejectCompany: rejectCompanyService,
  } = useCompanyService();
  const { id } = useParams();

  const [processingCompanies, setProcessingCompanies] = useState<
    CompanyProcessing[]
  >([]);
  const { getProcessingCompanies } = useCompanyService();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['processingCompanies'],
    queryFn: async () => await getProcessingCompanies(),
    refetchInterval: 5000,
    enabled: !!getProcessingCompanies,
  });

  useEffect(() => {
    if (data) setProcessingCompanies(data);
  }, [data]);

  useEffect(() => {
    if (id) {
      setSelectedProcessingCompany(
        processingCompanies.find((company) => company.id === Number(id)),
      );
    }
  }, [id, processingCompanies]);

  const addCompanyMutation = useMutation({
    mutationKey: ['addCompany'],
    mutationFn: (website: string) => addCompany(website),
  });

  const addNewCompany = (website: string) => {
    addCompanyMutation.mutate(website);
  };

  const acceptCompanyMutation = useMutation({
    mutationKey: ['acceptCompany'],
    mutationFn: (companyId: number): Promise<CompanyResult> =>
      acceptCompanyService(companyId),
  });

  const acceptCompany = (companyId: number): Promise<CompanyResult> => {
    return acceptCompanyMutation.mutateAsync(companyId);
  };

  const rejectCompanyMutation = useMutation({
    mutationKey: ['rejectCompany'],
    mutationFn: (companyId: number): Promise<CompanyResult> =>
      rejectCompanyService(companyId),
  });

  const rejectCompany = (companyId: number): Promise<CompanyResult> => {
    return rejectCompanyMutation.mutateAsync(companyId);
  };

  return (
    <>
      <Toaster
        message="Something went wrong!"
        show={isError}
        isError={isError}
      />
      <ProcessingCompanyContext.Provider
        value={{
          state: {
            processingCompanies: processingCompanies ?? [],
            selectedProcessingCompany: selectedProcessingCompany,
            loading: isLoading ?? false,
            updating:
              acceptCompanyMutation.isPending ||
              rejectCompanyMutation.isPending,
          },
          setProcessingCompanies,
          addNewCompany,
          acceptCompany,
          rejectCompany,
        }}
      >
        <Outlet />
      </ProcessingCompanyContext.Provider>
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProcessingCompanyContext = () =>
  React.useContext(ProcessingCompanyContext);
