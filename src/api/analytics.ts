import { apiGet, apiPost } from './client';
import type { TrackEventPayload, AnalyticsEvent } from './types';

export const trackEvent = (data: TrackEventPayload) =>
  apiPost('/analytics/events', data);

export const listEvents = () =>
  apiGet<AnalyticsEvent[]>('/analytics/events');
