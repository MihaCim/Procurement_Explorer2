import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import BtnLink from '../components/BtnLink';
import IconButton from '../components/commons/IconButton';
import { TextField } from '../components/forms';
import PageContainer from '../components/PageContainer';
import ProcessingStatus from '../components/ProcessingStatus';
import Table from '../components/tables/Table';
import TitleWithBack from '../components/TitleWithBack';
import { H2 } from '../components/Typography';
import { Company } from '../models/Company';
import { CompanyProcessing } from '../models/CompanyProcessing';
import { useProcessingCompanyContext } from '../context/ProcessingCompanyProvider';

const PageLayout = styled.div`
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  flex: 1 0 0;
  background: #fff;
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
  width: 100%;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  padding: 16px 24px;
  flex-direction: column;
  gap: 24px;
  background: #fff;
`;

const ProcessContainer = styled.div`
  display: flex;
  align-items: flex-start;
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
    const colHelper = createColumnHelper<Company>();
    return [
      {
        id: 'name',
        header: 'Company',
        accessorFn: (row) => row.Company_name,
        sortingFn: 'text',
        enableColumnFilter: false,
        size: 250,
      },
      {
        header: 'Status',
        cell: ({ row }) => <ProcessingStatus status={row.original.progress} />,
        sortingFn: 'text',
        enableColumnFilter: false,
      },
      colHelper.display({
        id: 'actions',
        enableGlobalFilter: false,
        cell: ({ row }) =>
          row.original.progress?.toLowerCase() !== 'in progress' && (
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
    ] as ColumnDef<CompanyProcessing>[];
  }, [navigate]);
  return (
    <PageContainer>
      <TitleWithBack label="Scraping" onClick={goBack} />
      {/* 
      {loading ? (
        <div className="w-full top-1/2 left-1/2">
          <LoadingCard text="Retrieving document structure" />
        </div>
      ) : ( */}
      <PageLayout>
        <Container>
          <H2>Start scraping</H2>
          <HeaderContainer>
            To start the website scraping, type site URL. and run
            <ProcessContainer>
              <TextField
                fullWidth
                name="website"
                placeholder="website.com"
                value={websiteUrl ?? ''}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                error={websiteError}
              />
              <IconButton
                variant="contained"
                onClick={handleProcessClick}
                disabled={!websiteUrl}
                style={{ height: '40px' }}
              >
                Process
              </IconButton>
            </ProcessContainer>
          </HeaderContainer>
        </Container>
        <Container>
          <H2>Scraping list</H2>
          <Table
            columns={columns}
            height={650}
            data={processingCompanies ?? []}
          />
        </Container>
      </PageLayout>
      {/* )} */}
    </PageContainer>
  );
};

export default AddCompany;
