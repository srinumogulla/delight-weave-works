import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './client';
import type { ApiTemple, ApiPooja, CreatePoojaPayload, UpdatePoojaPayload, LinkPayload, TempleAnalytics } from './types';

export const getMyTempleProfile = () =>
  apiGet<ApiTemple>('/temples/me');

export const listTemplePoojas = () =>
  apiGet<ApiPooja[]>('/temples/poojas');

export const createTemplePooja = (data: CreatePoojaPayload) =>
  apiPost<ApiPooja>('/temples/poojas', data);

export const updateTemplePooja = (id: string, data: UpdatePoojaPayload) =>
  apiPut<ApiPooja>(`/temples/poojas/${id}`, data);

export const deleteTemplePooja = (id: string) =>
  apiDelete(`/temples/poojas/${id}`);

export const publishTemplePoojaLink = (id: string, data: LinkPayload) =>
  apiPatch<ApiPooja>(`/temples/poojas/${id}/link`, data);

export const getTempleAnalytics = () =>
  apiGet<TempleAnalytics>('/temples/analytics/overview');
