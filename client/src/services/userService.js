import api from './api';

export const userService = {
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  blockUser: (id) => api.put(`/users/${id}/block`),
  unblockUser: (id) => api.put(`/users/${id}/unblock`),
};
