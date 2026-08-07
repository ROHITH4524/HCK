import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('routemind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const routeAPI = {
  optimize: (vehicle_ids = null) => api.post('/optimize-route', { vehicle_ids, enforce_indian_constraints: true }),
  getRoutes: () => api.get('/routes'),
  getRouteById: (id) => api.get(`/routes/${id}`),
  replan: (replanData) => api.post('/replan', replanData),
  getHistory: () => api.get('/history'),
};

export const vehicleAPI = {
  getVehicles: () => api.get('/vehicles'),
  updateLocation: (id, lat, lng) => api.post(`/vehicles/${id}/location`, null, { params: { lat, lng } }),
};

export const supervisorAPI = {
  getPending: () => api.get('/pending-approvals'),
  approveDecision: (decision_id, approve, notes = '') => api.post('/approve', { decision_id, approve, notes }),
};

export const analyticsAPI = {
  getDashboardKPIs: () => api.get('/dashboard'),
  getAnalytics: () => api.get('/analytics'),
  getBenchmark: () => api.get('/benchmark'),
};

export default api;
