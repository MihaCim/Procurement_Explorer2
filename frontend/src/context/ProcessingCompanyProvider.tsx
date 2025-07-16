import React, { createContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@tanstack/react-query';

import Toaster from '../components/Toaster';
import { CompanyDetails } from '../models/Company';
import { CompanyResult } from '../models/CompanyResult';
import useCompanyService from '../services/companyService';

interface ProcessingCompanyContextProps {
  state: IProcessingCompanyState;
  setProcessingCompanies: (companies: CompanyDetails[]) => void;
  addNewCompany: (website: string) => void;
  acceptCompany: (processingCompany: CompanyDetails) => Promise<CompanyResult>;
  rejectCompany: (companyId: number) => Promise<CompanyResult>;
}
export interface IProcessingCompanyState {
  processingCompanies: CompanyDetails[];
  selectedProcessingCompany?: CompanyDetails;
  loading: boolean;
  updating: boolean;
}
const ProcessingCompanyContext = createContext(
  {} as ProcessingCompanyContextProps,
);

export const ProcessingCompanyProvider: React.FC = () => {
  const [selectedProcessingCompany, setSelectedProcessingCompany] = useState<
    CompanyDetails | undefined
  >();
  const { addCompany, updateProcessingCompany, deleteProcessingCompany } =
    useCompanyService();
  const { id } = useParams();

  const [processingCompanies, setProcessingCompanies] = useState<
    CompanyDetails[]
  >([]);
  const { getProcessingCompanies } = useCompanyService();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['processingCompanies'],
    queryFn: async () => await getProcessingCompanies(),
    refetchInterval: 3000,
    enabled: !!getProcessingCompanies,
  });

  useEffect(() => {
    if (data) setProcessingCompanies(data?.companies ?? []);
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
    onSuccess: () => {
      refetch();
      setSelectedProcessingCompany(undefined);
    },
  });

  const addNewCompany = (website: string) => {
    addCompanyMutation.mutate(website);
  };

  const acceptCompanyMutation = useMutation({
    mutationKey: ['acceptCompany'],
    mutationFn: (processingCompany: CompanyDetails): Promise<CompanyResult> =>
      updateProcessingCompany(processingCompany.id, {
        ...processingCompany,
        status: 'CONFIRMED',
      }),
    onSuccess: () => {
      refetch();
      setSelectedProcessingCompany(undefined);
    },
  });

  const acceptCompany = (
    processingCompany: CompanyDetails,
  ): Promise<CompanyResult> => {
    return acceptCompanyMutation.mutateAsync(processingCompany);
  };

  const rejectCompanyMutation = useMutation({
    mutationKey: ['rejectCompany'],
    mutationFn: (companyId: number): Promise<CompanyResult> =>
      deleteProcessingCompany(companyId),
    onSuccess: () => {
      refetch();
      setSelectedProcessingCompany(undefined);
    },
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
