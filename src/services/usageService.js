import api from './api';

export const usageService = {
  list: (page = 1) =>
    api.get('/usage', { params: { page } }),
};
