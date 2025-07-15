import { CompanyProcessingDetails } from './CompanyProcessingDetails';

export interface CompanyProcessing {
  id: number;
  Company_name: string;
  progress: string;
  added_timestamp?: Date;
  details?: CompanyProcessingDetails;
}

export interface CompanyDetails {
  id: number;
  name: string;
  website: string;
  status: string;
  industry: string;
  country: string;
  review_date: string;
  products: string[];
  contact_information: Record<string, string>;
  risk_level: number;
  added_timestamp: string;
  details: Details;
}

export interface Details {
  subindustry: string;
  productPortfolio: string[];
  servicePortfolio: string[];
  specializations: string[];
  companySize: string;
  qualityStandards: string[];
  specific_tools_and_technologies: string[];
}
