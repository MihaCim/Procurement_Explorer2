import { Navigate, Outlet } from 'react-router-dom';

import { CompanyProvider } from './context/CompanyProvider';
import { DueDiligenceProvider } from './context/DueDiligenceProvider';
import { ProcessingCompanyProvider } from './context/ProcessingCompanyProvider';
import DetailsBoundary from './errorBoundaries/AssetDetailsBoundary';
import RootBoundary from './errorBoundaries/RootBoundary';
import { Layout } from './layout';
import AddCompany from './pages/AddCompany';
import AddCompanyDetails from './pages/AddCompanyDetails';
import AgenticDD from './pages/AgenticDD';
import CompanyHistory from './pages/CompanyHistory';
import CompanySearchPage from './pages/CompanySearchPage';
import DueDiligencePage from './pages/DueDiligencePage';

const APP_ROUTES = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RootBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="companies" replace />,
      },
      {
        path: 'companies',
        element: (
          <CompanyProvider>
            <Outlet />
          </CompanyProvider>
        ),
        children: [
          {
            index: true,
            element: <CompanySearchPage />,
          },
          { path: 'list', element: <CompanyHistory /> },
        ],
      },
      {
        path: '/scraping',
        element: <ProcessingCompanyProvider />,
        children: [
          {
            index: true,
            element: <AddCompany />,
          },
          {
            path: 'details/:id',
            element: <AddCompanyDetails />,
          },
        ],
      },
      {
        path: '/due-diligence/:id',
        errorElement: <DetailsBoundary />,
        element: (
          <DueDiligenceProvider>
            <DueDiligencePage />
          </DueDiligenceProvider>
        ),
      },
      {
        path: '/wsclient',
        element: (
          <DueDiligenceProvider>
            <Outlet />
          </DueDiligenceProvider>
        ),
        children: [
          {
            path: ':id',
            element: <AgenticDD />,
          },
        ],
      },
    ],
  },
];

export default APP_ROUTES;
