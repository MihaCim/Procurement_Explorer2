import React, { createContext, useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { useMutation, useQuery } from '@tanstack/react-query';

import Toaster from '../components/Toaster';
import {
  CompanyProcessing,
  CompanyProcessingUpdate,
} from '../models/CompanyProcessing';
import { CompanyResult } from '../models/CompanyResult';
import useCompanyService from '../services/companyService';

interface ProcessingCompanyContextProps {
  state: IProcessingCompanyState;
  setProcessingCompanies: (companies: CompanyProcessing[]) => void;
  addNewCompany: (website: string) => void;
  acceptCompany: (
    processingCompany: CompanyProcessing,
  ) => Promise<CompanyResult>;
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
  const { addCompany, updateProcessingCompany, deleteProcessingCompany } =
    useCompanyService();
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
    mutationFn: (
      processingCompany: CompanyProcessing,
    ): Promise<CompanyResult> =>
      updateProcessingCompany(processingCompany.id, {
        id: processingCompany.id,
        progress: 'Accepted',
        status: 'accepted',
        website: 'test.url',
        details: {
          subindustry: processingCompany.details?.Subindustry.join('') || '',
          productPortfolio: processingCompany.details?.Products_portfolio || [],
          servicePortfolio: processingCompany.details?.Service_portfolio || [],
          specializations: processingCompany.details?.Specializations || [],
          companySize: processingCompany.details?.Company_size || '',
          qualityStandards: processingCompany.details?.Quality_standards || [],
          specific_tools_and_technologies:
            processingCompany.details?.Specific_tools_and_technologies || [],
        },
        contact_information: {
          data_contact: '',
          short_profile_contact: '',
        },
        products: [],
        added_timestamp: new Date().toISOString(),
        name: processingCompany.Company_name,
        industry: '',
        country: '',
        review_date: new Date().toISOString(),
        risk_level: 5,
      } as CompanyProcessingUpdate),
  });

  const acceptCompany = (
    processingCompany: CompanyProcessing,
  ): Promise<CompanyResult> => {
    return acceptCompanyMutation.mutateAsync(processingCompany);
  };

  const rejectCompanyMutation = useMutation({
    mutationKey: ['rejectCompany'],
    mutationFn: (companyId: number): Promise<CompanyResult> =>
      deleteProcessingCompany(companyId),
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
