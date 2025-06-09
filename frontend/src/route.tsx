import { CompanyProvider } from './context/CompanyProvider';
import { DueDiligenceProvider } from './context/DueDiligenceProvider';
import DetailsBoundary from './errorBoundaries/AssetDetailsBoundary';
import RootBoundary from './errorBoundaries/RootBoundary';
import { Layout } from './layout';
import AddCompany from './pages/AddCompany';
import AddCompanyDetails from './pages/AddCompanyDetails';
import DueDiligencePage from './pages/DueDiligencePage';
import { ProcessingCompanyProvider } from './context/ProcessingCompanyProvider';
import HomePage from './pages/HomePage';
const APP_ROUTES = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RootBoundary />,
    children: [
      {
        index: true,
        element: (
          <CompanyProvider>
            <HomePage />
          </CompanyProvider>
        ),
      },
      {
        path: '/add',
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
    ],
  },
];

export default APP_ROUTES;
