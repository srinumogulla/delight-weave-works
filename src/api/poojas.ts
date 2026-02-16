import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiUpload } from './client';
import type { ApiPooja, CreatePoojaPayload, UpdatePoojaPayload, SchedulePayload, LinkPayload, PoojaRegistration } from './types';

export const listPoojas = () => apiGet<ApiPooja[]>('/content/poojas');

export const createPooja = (data: CreatePoojaPayload) =>
  apiPost<ApiPooja>('/content/poojas', data);

export const updatePooja = (id: string, data: UpdatePoojaPayload) =>
  apiPut<ApiPooja>(`/content/poojas/${id}`, data);

export const deletePooja = (id: string) =>
  apiDelete(`/content/poojas/${id}`);

export const uploadPoojaImage = (id: string, file: File) =>
  apiUpload<{ image_url: string }>(`/content/poojas/${id}/image`, file, 'image');

export const reschedulePooja = (id: string, data: SchedulePayload) =>
  apiPatch<ApiPooja>(`/content/poojas/${id}/schedule`, data);

export const publishPoojaLink = (id: string, data: LinkPayload) =>
  apiPatch<ApiPooja>(`/content/poojas/${id}/link`, data);

export const notifyPoojaLink = (id: string) =>
  apiPost(`/content/poojas/${id}/link/notify`);

export const getPoojaRegistrations = (id: string) =>
  apiGet<PoojaRegistration[]>(`/content/poojas/${id}/registrations`);
