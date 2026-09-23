import api from './api';

export const adminService = {
  stats: () => api.get('/admin/stats'),

  usage: (page = 1, perPage = 20) =>
    api.get('/admin/usage', { params: { page, per_page: perPage } }),

  models: () => api.get('/admin/models'),

  users: (page = 1, perPage = 20) =>
    api.get('/admin/users', { params: { page, per_page: perPage } }),
};
