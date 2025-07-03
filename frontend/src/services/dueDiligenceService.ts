import {
  DueDiligenceCreationResult,
  DueDiligenceResult,
} from '../models/DueDiligenceProfile';
import { EDDA_LOGS, EDDA_PROFILE } from '../models/fake';
import APIService from './apiService';

const useDueDiligenceService = () => {
  return import.meta.env.VITE_USE_API === '1'
    ? new DueDiligenceService()
    : new FakeDDService();
};

export default useDueDiligenceService;

class DueDiligenceService {
  public async getDueDiligenceProfile(id: string): Promise<DueDiligenceResult> {
    return new APIService().get(`/due-diligence/profile?company_url=${id}`);
  }

  public async startDueDiligenceProfile(
    company_url: string,
  ): Promise<DueDiligenceCreationResult> {
    return new APIService().post(
      `/due-diligence/start?company_url=${company_url}`,
      {},
    );
  }
}

class FakeDDService {
  public async getDueDiligenceProfile(id: string): Promise<DueDiligenceResult> {
    console.log('FAKE getDueDiligenceProfile CALLED', id);
    return Promise.resolve({
      ...EDDA_PROFILE,
      logs: EDDA_LOGS,
      errors: [],
      lastUpdated: new Date(),
      started: new Date(),
    });
  }

  public async startDueDiligenceProfile(
    company_url: string,
  ): Promise<DueDiligenceCreationResult> {
    console.log('FAKE startDueDiligenceProfile CALLED', company_url);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return Promise.resolve({ msg: 'done', status: 'ok' });
  }
}
