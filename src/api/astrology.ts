import { apiPost } from './client';
import type { KundaliRequest, KundaliApiResponse, KundaliMatchingRequest, KundaliMatchingApiResponse } from './types';

export function generateKundali(data: KundaliRequest): Promise<KundaliApiResponse> {
  return apiPost<KundaliApiResponse>('/astrology/kundali', data);
}

export function getKundaliMatching(data: KundaliMatchingRequest): Promise<KundaliMatchingApiResponse> {
  return apiPost<KundaliMatchingApiResponse>('/astrology/kundali-matching', data);
}
