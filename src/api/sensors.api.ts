import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(async (config) => {
  if (keycloak.isTokenExpired(30)) {
    await keycloak.updateToken(30);
    // updateToken(30) = refresh if expires within 30 seconds
  }

  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }

  return config;
});


export const sensorsApi = {

  // GET /sensors — fetch all readings with optional filters
  getAll: (params?: {
    pipelineId?: string;
    alertLevel?: string;
    limit?: number;
    skip?: number;
  }) => api.get('/sensors', { params }),

  // GET /sensors/:sensorId/latest — get latest reading for one sensor
  getLatest: (sensorId: string) =>
    api.get(`/sensors/${sensorId}/latest`),

  // GET /sensors/pipeline/:pipelineId/summary — dashboard stats
  getPipelineSummary: (pipelineId: string) =>
    api.get(`/sensors/pipeline/${pipelineId}/summary`),

  // POST /sensors — create a new sensor reading
  create: (data: any) => api.post('/sensors', data),

  // GET /sensors/health — public health check
  health: () => api.get('/sensors/health'),
};

export default api;