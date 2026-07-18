import api from './api';

export const uploadService = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
