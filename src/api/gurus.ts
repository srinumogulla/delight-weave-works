import { apiGet, apiPost } from './client';
import type { ApiGuru, CreateGuruPayload, GuruAnalytics, GuruEarnings } from './types';

export const createGuruProfile = (data: CreateGuruPayload) =>
  apiPost<ApiGuru>('/gurus/profile', data);

export const getMyGuruProfile = () =>
  apiGet<ApiGuru>('/gurus/me');

export const getGuruAnalytics = () =>
  apiGet<GuruAnalytics>('/gurus/analytics');

export const getGuruEarnings = () =>
  apiGet<GuruEarnings>('/gurus/earnings');

export const listGurus = () =>
  apiGet<ApiGuru[]>('/gurus');
