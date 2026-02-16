import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type {
  ApiUser, ApiTemple, ApiPooja, CreatePoojaPayload, UpdatePoojaPayload,
  DoshaTag, Mahavidya, GiftTemplate, ApiTransaction, AdminAnalytics
} from './types';

// Users
export const getAdminUsers = () =>
  apiGet<ApiUser[]>('/jambalakadipamba/users');

// Temples
export const getAdminTemples = () =>
  apiGet<ApiTemple[]>('/jambalakadipamba/temples');

export const createAdminTemple = (data: Partial<ApiTemple>) =>
  apiPost<ApiTemple>('/jambalakadipamba/temples', data);

export const updateAdminTemple = (id: string, data: Partial<ApiTemple>) =>
  apiPut<ApiTemple>(`/jambalakadipamba/temples/${id}`, data);

export const deleteAdminTemple = (id: string) =>
  apiDelete(`/jambalakadipamba/temples/${id}`);

// Poojas
export const getAdminPoojas = () =>
  apiGet<ApiPooja[]>('/jambalakadipamba/poojas');

export const createAdminPooja = (data: CreatePoojaPayload) =>
  apiPost<ApiPooja>('/jambalakadipamba/poojas', data);

export const updateAdminPooja = (id: string, data: UpdatePoojaPayload) =>
  apiPut<ApiPooja>(`/jambalakadipamba/poojas/${id}`, data);

export const deleteAdminPooja = (id: string) =>
  apiDelete(`/jambalakadipamba/poojas/${id}`);

// Dosha Tags
export const getDoshaTags = () =>
  apiGet<DoshaTag[]>('/jambalakadipamba/dosha-tags');

export const createDoshaTag = (data: Partial<DoshaTag>) =>
  apiPost<DoshaTag>('/jambalakadipamba/dosha-tags', data);

export const updateDoshaTag = (id: string, data: Partial<DoshaTag>) =>
  apiPut<DoshaTag>(`/jambalakadipamba/dosha-tags/${id}`, data);

export const deleteDoshaTag = (id: string) =>
  apiDelete(`/jambalakadipamba/dosha-tags/${id}`);

// Mahavidyas
export const getMahavidyas = () =>
  apiGet<Mahavidya[]>('/jambalakadipamba/mahavidyas');

export const createMahavidya = (data: Partial<Mahavidya>) =>
  apiPost<Mahavidya>('/jambalakadipamba/mahavidyas', data);

export const updateMahavidya = (id: string, data: Partial<Mahavidya>) =>
  apiPut<Mahavidya>(`/jambalakadipamba/mahavidyas/${id}`, data);

export const deleteMahavidya = (id: string) =>
  apiDelete(`/jambalakadipamba/mahavidyas/${id}`);

// Gift Templates
export const getGiftTemplates = () =>
  apiGet<GiftTemplate[]>('/jambalakadipamba/gift-templates');

export const createGiftTemplate = (data: Partial<GiftTemplate>) =>
  apiPost<GiftTemplate>('/jambalakadipamba/gift-templates', data);

export const updateGiftTemplate = (id: string, data: Partial<GiftTemplate>) =>
  apiPut<GiftTemplate>(`/jambalakadipamba/gift-templates/${id}`, data);

export const deleteGiftTemplate = (id: string) =>
  apiDelete(`/jambalakadipamba/gift-templates/${id}`);

// Transactions
export const getAdminTransactions = () =>
  apiGet<ApiTransaction[]>('/jambalakadipamba/transactions');

// Analytics
export const getAdminAnalytics = () =>
  apiGet<AdminAnalytics>('/jambalakadipamba/analytics/overview');

export const getAdminAnalyticsRevenue = () =>
  apiGet('/jambalakadipamba/analytics/revenue');

export const getAdminAnalyticsUsers = () =>
  apiGet('/jambalakadipamba/analytics/users');
