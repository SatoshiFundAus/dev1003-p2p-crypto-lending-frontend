// Centralized configuration for API base URL
// Uses Vite env when available; falls back to NODE_ENV

const mode = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE)
  || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV)
  || 'development';

export const BACKEND_URL = mode === 'production'
  ? 'https://dev1003-p2p-crypto-lending-backend.onrender.com'
  : 'http://localhost:8080';

