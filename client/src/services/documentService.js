import api from './api';

export const documentService = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  share: (data) => api.post('/documents/share', data),
  removeCollaborator: (docId, userId) =>
    api.delete(`/documents/${docId}/collaborators/${userId}`),
  getHistory: (id) => api.get(`/documents/${id}/history`),
  restoreVersion: (id, version) => api.post(`/documents/${id}/restore/${version}`),
};
