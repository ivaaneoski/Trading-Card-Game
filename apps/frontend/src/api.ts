import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
};

export const usersApi = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  getLeaderboard: () => api.get('/users'),
};

export const cardsApi = {
  create: (data: any) => api.post('/cards', data),
  getMyCards: () => api.get('/cards/my'),
  getPublic: () => api.get('/cards'),
};

export const decksApi = {
  create: (data: any) => api.post('/decks', data),
  getMyDecks: () => api.get('/decks/my'),
  validate: (deckId: string) => api.post('/decks/validate', { deckId }),
};

export const uploadsApi = {
  requestPresignedUrl: (fileName: string, contentType: string) =>
    api.post('/uploads/request-upload', { fileName, contentType }),
  confirmUpload: (key: string) =>
    api.post('/uploads/confirm-upload', { key }),
};

export const matchesApi = {
  getHistory: () => api.get('/matches/history'),
  forfeit: (matchId: string) => api.post('/matches/forfeit', { matchId }),
};
