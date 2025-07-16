import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import NoResultIcon from '../../assets/search_no_result.svg?react';
import { useCompanyContext } from '../../context/CompanyProvider';
import BtnLink from '../BtnLink';
import Skeleton from '../Skeleton';
import { H2 } from '../Typography';
import CompanyCard from './CompanyCard';

const MediumText = styled.p`
  color: var(--Color-color-text-primary, #292c3d);
  text-align: center;
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.16px;
`;

const CompaniesGrid: React.FC = () => {
  const {
    state: { firstLoaded, loaded, loading, hasMore, companies },
    fetchMore,
  } = useCompanyContext();

  const navigate = useNavigate();

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        {firstLoaded && (
          <>
            <div className="w-full flex flex-col gap-3">
              <H2>Results</H2>
              {!loading && loaded && companies.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <NoResultIcon />
                  <MediumText>Nothing matched your search.</MediumText>
                  <MediumText>Adjust your input, or</MediumText>
                  <BtnLink onClick={() => navigate('/add')}>
                    Add a new company
                  </BtnLink>
                </div>
              ) : (
                <p>
                  Didn't find the company that you are looking for ? You can{' '}
                  <BtnLink onClick={() => navigate('/add')}>
                    add a new company.
                  </BtnLink>
                </p>
              )}
            </div>

            {(companies.length > 0 || loading) && (
              <InfiniteScroll
                dataLength={companies.length}
                next={fetchMore}
                hasMore={hasMore}
                scrollableTarget={'scrollablelayout'}
                loader={
                  <div
                    className="w-full grid gap-3 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]"
                    style={{ marginTop: '1rem' }}
                  >
                    {Array.from(Array(4).keys()).map((i) => (
                      <Skeleton key={`loader-${i}`} height={200} />
                    ))}
                  </div>
                }
                scrollThreshold="200px"
              >
                <div
                  className="w-full grid
            gap-3
            grid-cols-[repeat(auto-fit,minmax(400px,1fr))]"
                >
                  {companies.map((company, i) => (
                    <CompanyCard key={`${company.id}-${i}`} {...company} />
                  ))}
                </div>
              </InfiniteScroll>
            )}
          </>
        )}
        {loading && companies.length === 0 && (
          <div
            className="w-full grid gap-3 grid-cols-[repeat(auto-fit,minmax(400px,1fr))]"
            style={{ minHeight: '300px' }}
          >
            {Array.from(Array(8).keys()).map((i) => (
              <Skeleton key={i} height={200} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CompaniesGrid;
