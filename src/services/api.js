import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getDoctors: () => api.get('/users/doctors'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
  updateSubscription: (id, plan) => api.put(`/users/${id}/subscription`, { plan }),
  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getHistory: (id) => api.get(`/patients/${id}/history`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getToday: () => api.get('/appointments/today'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  delete: (id) => api.delete(`/appointments/${id}`),
};

// ─── Prescriptions ────────────────────────────────────────────────────────────
export const prescriptionsAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  downloadPDF: (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' }),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  symptomChecker: (data) => api.post('/ai/symptom-checker', data),
  prescriptionExplanation: (data) => api.post('/ai/prescription-explanation', data),
  riskFlag: (data) => api.post('/ai/risk-flag', data),
  predictiveAnalytics: (data) => api.post('/ai/predictive-analytics', data),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getAdminStats: () => api.get('/analytics/admin'),
  getDoctorStats: () => api.get('/analytics/doctor'),
};

// ─── Diagnosis Logs ───────────────────────────────────────────────────────────
export const diagnosisAPI = {
  getAll: (params) => api.get('/diagnosis', { params }),
  create: (data) => api.post('/diagnosis', data),
  update: (id, data) => api.put(`/diagnosis/${id}`, data),
  getFlagged: () => api.get('/diagnosis/flagged'),
};

export default api;
