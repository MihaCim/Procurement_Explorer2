import {
  DueDiligenceCreationResult,
  DueDiligenceProfile,
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
  public async getDueDiligenceProfile(
    id: string,
    cached: boolean,
    saved: boolean,
  ): Promise<DueDiligenceResult> {
    return new APIService().get(
      `/due-diligence/profile?company_url=${id}&cached=${cached}&saved=${saved}`,
    );
  }

  public async startDueDiligenceProfile(
    company_url: string,
  ): Promise<DueDiligenceCreationResult> {
    return new APIService().post(
      `/due-diligence/start?company_url=${company_url}`,
      {},
    );
  }

  public async deleteDueDiligenceProfile(
    id: string,
    cached: boolean,
    saved: boolean,
  ): Promise<DueDiligenceCreationResult> {
    return new APIService().delete(
      `/due-diligence/profile?company_url=${id}&cached=${cached}&saved=${saved}`,
    );
  }

  public async updateDueDiligenceProfile(
    profile: DueDiligenceProfile,
  ): Promise<DueDiligenceCreationResult> {
    return new APIService().put(`/due-diligence/profile`, profile);
  }
}

class FakeDDService {
  public async getDueDiligenceProfile(
    id: string,
    cached: boolean,
    saved: boolean,
  ): Promise<DueDiligenceResult> {
    console.log('FAKE getDueDiligenceProfile CALLED', id, cached, saved);
    return Promise.resolve({
      ...EDDA_PROFILE,
      logs: EDDA_LOGS,
      errors: [],
      lastUpdated: new Date(),
      started: new Date(),
    });
  }

  public async deleteDueDiligenceProfile(
    id: string,
    cached: boolean,
    saved: boolean,
  ): Promise<DueDiligenceCreationResult> {
    console.log('FAKE deleteDueDiligenceProfile CALLED', id, cached, saved);
    return Promise.resolve({ msg: 'done', status: 'ok' });
  }

  public async startDueDiligenceProfile(
    company_url: string,
  ): Promise<DueDiligenceCreationResult> {
    console.log('FAKE startDueDiligenceProfile CALLED', company_url);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return Promise.resolve({ msg: 'done', status: 'ok' });
  }

  public async updateDueDiligenceProfile(
    profile: DueDiligenceProfile,
  ): Promise<DueDiligenceCreationResult> {
    console.log('FAKE updateDueDiligenceProfile CALLED', profile);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return Promise.resolve({ msg: 'done', status: 'ok' });
  }
}
