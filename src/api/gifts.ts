import { apiGet, apiPost, apiDelete } from './client';
import type { GiftOverview, GiftOccasion, PresignedUploadResponse } from './types';

export const getGiftsOverview = () =>
  apiGet<GiftOverview>('/gifts/overview');

export const getGiftOccasions = () =>
  apiGet<GiftOccasion[]>('/gifts/occasions');

export const addPoojaOccasion = (poojaId: string, occasion: string) =>
  apiPost(`/gifts/poojas/${poojaId}/occasions`, { occasion });

export const removePoojaOccasion = (poojaId: string, occasion: string) =>
  apiDelete(`/gifts/poojas/${poojaId}/occasions/${occasion}`);

export const getPresignedUploadUrl = () =>
  apiPost<PresignedUploadResponse>('/gifts/uploads/presign');
