import { Dummy } from '../models/dummy';
import APIService from './apiService';

const useDummyService = () => {
  if (import.meta.env.VITE_USE_API == '1') {
    return new DummyService();
  }
  return new FakeDummyService();
};

export default useDummyService;

class DummyService {
  public async getDummyList(): Promise<Dummy[]> {
    return new APIService().get('/dummy');
  }
}

class FakeDummyService extends DummyService {
  public getDummyList(): Promise<Dummy[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { name: 'Dummy 1', value: 'Value 1' },
          { name: 'Dummy 2', value: 'Value 2' },
          { name: 'Dummy 3', value: 'Value 3' },
        ]);
      }, 1000);
    });
  }
}
