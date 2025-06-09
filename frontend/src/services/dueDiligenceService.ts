import { DueDiligenceProfile } from '../models/DueDiligenceProfile';
import APIService from './apiService';

const useDueDiligenceService = () => {
  return new DueDiligenceService();
};

export default useDueDiligenceService;

class DueDiligenceService {
  public async getDueDiligenceProfile(
    id: number,
  ): Promise<DueDiligenceProfile> {
    return new APIService().get(`/due-diligence/profile/${id}`);
  }

  public async updateDueDiligenceProfile(
    id: number,
    data: DueDiligenceProfile,
  ): Promise<DueDiligenceProfile> {
    return new APIService().put(`/due-diligence/profile/${id}`, data);
  }
}
