import { CompanyProcessingDetails } from './CompanyProcessingDetails';

export interface CompanyProcessing {
  id: number;
  Company_name: string;
  progress: string;
  added_timestamp?: Date;
  details?: CompanyProcessingDetails;
}
