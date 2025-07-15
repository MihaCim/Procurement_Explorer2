import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { PrimaryButton } from '../components';
import BtnLink from '../components/BtnLink';
import { TextField } from '../components/forms';
import PageContainer from '../components/PageContainer';
import ProcessingStatus from '../components/ProcessingStatus';
import Table from '../components/tables/Table';
import TitleWithBack from '../components/TitleWithBack';
import { H2 } from '../components/Typography';
import { useProcessingCompanyContext } from '../context/ProcessingCompanyProvider';
import { CompanyDetails } from '../models/CompanyProcessing';

const PageLayout = styled.div`
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  flex: 1 0 0;
  width: 100%;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  padding: 16px 24px;
  flex-direction: column;
  gap: 12px;
`;

const ProcessContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 400px;
`;

const AddCompany: React.FC = () => {
  const {
    state: { processingCompanies },
    addNewCompany,
  } = useProcessingCompanyContext();

  const [websiteUrl, setWebsiteUrl] = useState<string | undefined>();
  const [websiteError, setWebsiteError] = useState<string | undefined>();

  const navigate = useNavigate();

  const isValidUrl = (url: string): boolean => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // optional protocol
        '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})$', // domain name
      'i',
    );
    return !!urlPattern.test(url);
  };

  const goBack = () => {
    navigate('/');
  };

  const handleProcessClick = () => {
    if (websiteUrl && isValidUrl(websiteUrl)) {
      addNewCompany(websiteUrl);
      setWebsiteError(undefined);
      setWebsiteUrl(undefined);
    } else {
      setWebsiteError('Please enter a valid URL');
    }
  };

  const columns = useMemo(() => {
    const colHelper = createColumnHelper<CompanyDetails>();
    return [
      {
        id: 'name',
        header: 'Company',
        accessorFn: (row) => row.name,
        sortingFn: 'text',
        enableColumnFilter: false,
        size: 250,
      },
      {
        header: 'Status',
        cell: ({ row }) => <ProcessingStatus status={row.original.status} />,
        sortingFn: 'text',
        enableColumnFilter: false,
      },
      colHelper.display({
        id: 'actions',
        enableGlobalFilter: false,
        cell: ({ row }) =>
          row.original.status?.toLowerCase() !== 'in progress' && (
            <div className="flex items-center justify-center gap-6 self-stretch">
              <BtnLink
                onClick={() => {
                  navigate(`details/${row.original.id}`);
                }}
              >
                View details
              </BtnLink>
            </div>
          ),
        size: 200,
      }),
    ] as ColumnDef<CompanyDetails>[];
  }, [navigate]);
  return (
    <PageContainer>
      <TitleWithBack label="Add company" onClick={goBack} />
      <PageLayout>
        <Container>
          <HeaderContainer>
            To start type a company site URL. and run
            <ProcessContainer>
              <TextField
                fullWidth
                name="website"
                placeholder="website.com"
                value={websiteUrl ?? ''}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                error={websiteError}
              />
              <PrimaryButton
                onClick={handleProcessClick}
                btnProps={{ disabled: !websiteUrl }}
              >
                Process
              </PrimaryButton>
            </ProcessContainer>
          </HeaderContainer>
        </Container>
        <Container>
          <H2>Added company list</H2>
          <Table
            columns={columns}
            height={650}
            // minHeight={480}
            data={processingCompanies ?? []}
          />
        </Container>
      </PageLayout>
      {/* )} */}
    </PageContainer>
  );
};

export default AddCompany;
