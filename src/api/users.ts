import { apiGet } from './client';
import type { ApiUser } from './types';

export const getMe = () => apiGet<ApiUser>('/users/me');
