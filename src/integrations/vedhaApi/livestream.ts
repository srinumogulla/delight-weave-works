import { apiGet, apiPost } from './client';
import type { LiveStreamResponse, LiveStream } from './types';

export const startStream = (poojaId: string) =>
  apiPost<LiveStreamResponse>(`/live-streams/poojas/${poojaId}/start`);

export const stopStream = (poojaId: string) =>
  apiPost(`/live-streams/poojas/${poojaId}/stop`);

export const getMyStreams = () =>
  apiGet<LiveStream[]>('/live-streams/my');
