import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env['VITE_PUBLIC_BASE_URL'] || 'http://localhost:3000',
  basePath: '/api/v1/auth',
});