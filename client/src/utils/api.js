const DEFAULT_PROD_API_URL = 'https://biolink-api.qsp7mdjbcy.workers.dev/api';
const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalUrl = (value) => /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\/api\/?$/i.test(value || '');
const isRelativeUrl = (value) => String(value || '').startsWith('/');

const API_URL = import.meta.env.DEV
  ? (envApiUrl || '/api')
  : (envApiUrl && !isLocalUrl(envApiUrl) && !isRelativeUrl(envApiUrl)
      ? envApiUrl
      : DEFAULT_PROD_API_URL);

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('bio_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Profile
  getMyProfile: () => request('/profile/me'),
  updateProfile: (body) => request('/profile/me', { method: 'PUT', body: JSON.stringify(body) }),
  getPublicProfile: (username) => request(`/profile/${username}`),
  checkUsername: (username) => request(`/profile/check/${username}`),

  // Links
  getLinks: () => request('/links'),
  createLink: (body) => request('/links', { method: 'POST', body: JSON.stringify(body) }),
  updateLink: (id, body) => request(`/links/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLink: (id) => request(`/links/${id}`, { method: 'DELETE' }),
  reorderLinks: (linkIds) => request('/links/reorder', { method: 'POST', body: JSON.stringify({ linkIds }) }),
  trackClick: (id) => request(`/links/${id}/click`, { method: 'POST' }),

  // Stats
  getStats: () => request('/stats/me'),

  // Templates
  getTemplates: () => request('/templates'),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params) => request(`/admin/users?${new URLSearchParams(params)}`),
  getAdminUser: (id) => request(`/admin/users/${id}`),
  updateAdminUser: (id, body) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminVisits: () => request('/admin/visits'),
  resetAdminUserPassword: (id, body) => request(`/admin/users/${id}/password`, { method: 'PUT', body: JSON.stringify(body) }),
  getAdminSettings: () => request('/admin/settings'),
  updateAdminSettings: (body) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),
};

export default api;
