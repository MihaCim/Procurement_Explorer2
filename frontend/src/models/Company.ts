export interface Company {
  id: number;
  name: string;
  progress: string;
  status: string;
  dd_status: string;
  review_date: Date;
  country: string;
  industry: string;
}

export interface PaginatedCompanies {
  total: number;
  offset: number;
  limit: number;
  companies: Company[];
}

export interface SearchByDocResponse {
  companies_list: Company[];
  document_profile: unknown;
}

export interface CompanyDetails {
  id: number;
  name: string;
  website: string;
  status: string;
  dd_status: string;
  industry: string;
  country: string;
  review_date: string;
  products: string[];
  contact_information: Record<string, string>;
  risk_level: number;
  added_timestamp: string;
  details: Details;
  company_profile: string;
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
