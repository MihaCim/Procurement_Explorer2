import {
  Company,
  CompanyDetails,
  PaginatedCompanies,
  SearchByDocResponse,
} from '../models/Company';
import { CompanyProcessingStatus } from '../models/CompanyProcessingStatus';
import { CompanyResult } from '../models/CompanyResult';
import APIService from './apiService';

const useCompanyService = () => {
  return new CompanyService();
};

export default useCompanyService;

class CompanyService {
  public async getCompanies(): Promise<PaginatedCompanies> {
    return new APIService().get('/companies');
  }
  public async getCompanyById(id: number): Promise<CompanyDetails> {
    return new APIService().get(`/companies/id/${id}`);
  }
  public async getCompaniesByText(
    text: string,
    offset: number,
  ): Promise<PaginatedCompanies> {
    return new APIService().get(
      '/companies?query=' +
        encodeURI(text) +
        '&offset=' +
        encodeURI(String(offset)),
    );
  }
  public async getCompaniesByDescription(
    description: string,
  ): Promise<Company[]> {
    return new APIService().get(
      `/companies/similar?text=${encodeURI(description)}&n=10`,
    );
  }
  public async getCompaniesByFile(file: File): Promise<SearchByDocResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return new APIService().postMultipart(
      `/companies/by-document?k=10`,
      formData,
    );
  }
  public async getProcessingCompanies(): Promise<CompanyDetails[]> {
    return new APIService().get('/get/allAddedCompanies');
  }
  public async addCompany(
    websiteUrl: string,
  ): Promise<CompanyProcessingStatus> {
    return new APIService().post('/companies/add', { website: websiteUrl });
  }

  public async updateProcessingCompany(
    companyId: number,
    company: CompanyDetails,
  ): Promise<CompanyResult> {
    return new APIService().put(`/companies/${companyId}`, company);
  }
  public async deleteProcessingCompany(
    companyId: number,
  ): Promise<CompanyResult> {
    return new APIService().delete(`/companies/${companyId}`);
  }
}
