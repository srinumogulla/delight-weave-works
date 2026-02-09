import { apiGet, apiPost } from './client';
import type { ApiNotification, UnreadCountResponse } from './types';

export const getNotifications = () =>
  apiGet<ApiNotification[]>('/notifications/me');

export const getUnreadCount = () =>
  apiGet<UnreadCountResponse>('/notifications/me/unread-count');

export const markRead = (notificationId: string) =>
  apiPost(`/notifications/${notificationId}/read`);

export const markAllRead = () =>
  apiPost('/notifications/read-all');
