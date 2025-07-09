import moment from 'moment';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';

import BtnLink from '../components/BtnLink';
import PageContainer from '../components/PageContainer';
import Table from '../components/tables/Table';
import TableCardContainer from '../components/tables/TableCardContainer';
import { useCompanyContext } from '../context/CompanyProvider';
import { Company } from '../models/Company';
import useCompanyService from '../services/companyService';

const ClearBtnLink = styled.button`
  overflow: hidden;
  color: var(--Color-color-primary, #014289);
  text-align: right;
  text-overflow: ellipsis;
  font-family: Poppins;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
  cursor: 'pointer';
`;

const CompanyHistory: React.FC = () => {
  const navigate = useNavigate();
  const { getCompanies } = useCompanyService();

  const {
    state: { companies, loading: searchLoading },
    searchCompany: setCompanies,
  } = useCompanyContext();

  const {
    data,
    isLoading: loading,
    isRefetching,
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => getCompanies(),
    enabled: !!getCompanies,
  });

  useEffect(() => {
    setCompanies('');
  }, [data, setCompanies, isRefetching]);

  const columns = useMemo(() => {
    const colHelper = createColumnHelper<Company>();

    return [
      {
        id: 'name',
        header: 'Company Name',
        accessorFn: (row) => row.name,
        sortingFn: 'text',
      },
      {
        header: 'Status',
        accessorFn: (row) => row.status,
        sortingFn: 'text',
        meta: {
          filterVariant: 'select',
        },

        // use custom filter function directly
        filterFn: (row, columnId, filterValue) => {
          const values = filterValue.split(',');
          return values.includes(row.getValue(columnId));
        },
      },
      {
        id: 'lastRevision',
        header: 'Last Revision',
        accessorFn: (row) => {
          const date = new Date(row.review_date);
          return moment(date).format('MMM D, YYYY');
        },
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.review_date);
          const dateB = new Date(rowB.original.review_date);
          return dateA > dateB ? 1 : -1;
        },
      },
      {
        id: 'country',
        header: 'Country',
        accessorFn: (row) => row.country,
        sortingFn: 'text',
      },
      {
        id: 'industry',
        header: 'Industry',
        accessorFn: (row) => row.industry,
        sortingFn: 'text',
      },
      colHelper.display({
        id: 'actions',
        header: ({ table }) => (
          <div
            onClick={() => table.resetColumnFilters()}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <ClearBtnLink>Clear all filters</ClearBtnLink>
          </div>
        ),
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <>
            {row.original.status === 'Available' ? (
              <div className="flex items-center justify-center gap-6 self-stretch">
                <BtnLink
                  onClick={() => {
                    navigate(`/due-diligence/${row.original.id}`);
                    console.log('Start due diligence', row);
                  }}
                >
                  View
                </BtnLink>
              </div>
            ) : null}
          </>
        ),
        size: 200,
      }),
    ] as ColumnDef<Company>[];
  }, [navigate]);

  return (
    <PageContainer>
      <TableCardContainer>
        <Table
          columns={columns}
          height={600}
          data={companies ?? []}
          loading={loading || searchLoading}
        />
      </TableCardContainer>
    </PageContainer>
  );
};

export default CompanyHistory;
