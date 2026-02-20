import { invokeEdgeFunction } from '@/lib/lovableEdgeFunctions';
import type { KundaliRequest, KundaliApiResponse, KundaliMatchingRequest, KundaliMatchingApiResponse } from './types';

export async function generateKundali(data: KundaliRequest): Promise<KundaliApiResponse> {
  return invokeEdgeFunction('astrology', { action: 'kundali', ...data });
}

export async function getKundaliMatching(data: KundaliMatchingRequest): Promise<KundaliMatchingApiResponse> {
  return invokeEdgeFunction('astrology', { action: 'kundali-matching', ...data });
}
