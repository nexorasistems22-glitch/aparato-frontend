import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken: refresh });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────
export const authApi = {
  login: (email: string, password: string, slug: string) =>
    api.post('/auth/login', { email, password, slug }).then(r => r.data),
  register: (data: any) =>
    api.post('/auth/register', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

// ─── Dashboard ────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard').then(r => r.data),
};

// ─── Appointments ─────────────────────
export const appointmentsApi = {
  list: (params?: any) => api.get('/appointments', { params }).then(r => r.data),
  get: (id: string) => api.get(`/appointments/${id}`).then(r => r.data),
  availability: (params: any) => api.get('/appointments/availability', { params }).then(r => r.data),
  create: (data: any) => api.post('/appointments', data).then(r => r.data),
  updateStatus: (id: string, status: string, cancelReason?: string) =>
    api.patch(`/appointments/${id}/status`, { status, cancelReason }).then(r => r.data),
  delete: (id: string) => api.delete(`/appointments/${id}`).then(r => r.data),
};

// ─── Clients ──────────────────────────
export const clientsApi = {
  list: (params?: any) => api.get('/clients', { params }).then(r => r.data),
  get: (id: string) => api.get(`/clients/${id}`).then(r => r.data),
  birthdays: () => api.get('/clients/birthdays').then(r => r.data),
  create: (data: any) => api.post('/clients', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/clients/${id}`).then(r => r.data),
};

// ─── Professionals ────────────────────
export const professionalsApi = {
  list: () => api.get('/professionals').then(r => r.data),
  create: (data: any) => api.post('/professionals', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/professionals/${id}`, data).then(r => r.data),
};

// ─── Services ─────────────────────────
export const servicesApi = {
  list: () => api.get('/services').then(r => r.data),
  create: (data: any) => api.post('/services', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/services/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/services/${id}`).then(r => r.data),
};

// ─── Cash Flow ────────────────────────
export const cashFlowApi = {
  list: (params?: any) => api.get('/cashflow', { params }).then(r => r.data),
  create: (data: any) => api.post('/cashflow', data).then(r => r.data),
};

// ─── Products ─────────────────────────
export const productsApi = {
  list: () => api.get('/products').then(r => r.data),
  lowStock: () => api.get('/products/low-stock').then(r => r.data),
};

// ─── Campaigns ────────────────────────
export const campaignsApi = {
  list: () => api.get('/campaigns').then(r => r.data),
  create: (data: any) => api.post('/campaigns', data).then(r => r.data),
};

// ─── Tenant ───────────────────────────
export const tenantApi = {
  get: () => api.get('/tenant').then(r => r.data),
  update: (data: any) => api.put('/tenant', data).then(r => r.data),
};
