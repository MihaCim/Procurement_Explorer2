export interface Company {
  id: number;
  name: string;
  progress: string;
  status: string;
  review_date: Date;
  country: string;
  industry: string;
}

export interface DetailedCompany {
  id: number;
  name: string;
  website: string;
  status: string;
  industry: string;
  country: string;
  review_date: string;
  products: string[];
  contact_information: ContactInformation;
  risk_level: number;
  added_timestamp: string;
  details: Details;
}

export interface ContactInformation {
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}

export interface Details {
  subindustry: string;
  productPortfolio: string[];
  servicePortfolio: string[];
  specializations: string[];
  companySize: string;
  qualityStandards: string[];
}
