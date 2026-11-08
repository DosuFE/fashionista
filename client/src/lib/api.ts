import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    'Content-Type': 'application/json',
  },

  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const accessToken =
        localStorage.getItem('accessToken');

      if (accessToken) {
        config.headers.Authorization =
          `Bearer ${accessToken}`;
      }
    }

    return config;
  },
);