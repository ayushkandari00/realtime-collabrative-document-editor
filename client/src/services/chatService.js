import api from './api';

export const chatService = {
  // Conversations
  getConversations: () => api.get('/conversations'),
  getConversationById: (id) => api.get(`/conversations/${id}`),
  getOrCreateConversation: (participantId) =>
    api.post('/conversations', { participantId }),
  pinConversation: (id) => api.put(`/conversations/${id}/pin`),
  archiveConversation: (id) => api.put(`/conversations/${id}/archive`),

  // Messages
  getMessages: (conversationId, params = {}) =>
    api.get(`/messages/${conversationId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  editMessage: (id, content) => api.put(`/messages/${id}`, { content }),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  markAsRead: (conversationId) =>
    api.put(`/messages/${conversationId}/read`),
  addReaction: (id, emoji) => api.post(`/messages/${id}/reactions`, { emoji }),
  removeReaction: (id, emoji) =>
    api.delete(`/messages/${id}/reactions`, { data: { emoji } }),
};
