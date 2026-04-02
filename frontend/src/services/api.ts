import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const campaignsApi = {
  list: () => apiClient.get('/campaigns/'),
  create: (data: any) => apiClient.post('/campaigns/create', data),
  start: (id: string) => apiClient.post(`/campaigns/${id}/start`),
  pause: (id: string) => apiClient.post(`/campaigns/${id}/pause`),
  stats: (id: string) => apiClient.get(`/campaigns/${id}/stats`),
};

export const templatesApi = {
  list: () => apiClient.get('/templates/'),
  create: (data: any) => apiClient.post('/templates/create', data),
  delete: (id: string) => apiClient.delete(`/templates/${id}`),
};

export const sendersApi = {
  list: () => apiClient.get('/senders/'),
  add: (data: any) => apiClient.post('/senders/add', data),
  disable: (id: string) => apiClient.patch(`/senders/${id}/disable`),
};

export const datasetsApi = {
  upload: (campaignId: string, file: File) => {
    const formData = new FormData();
    formData.append('campaign_id', campaignId);
    formData.append('file', file);
    return apiClient.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default apiClient;
