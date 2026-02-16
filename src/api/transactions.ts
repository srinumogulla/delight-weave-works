import { apiGet, apiPost } from './client';
import type { CreateTransactionPayload, ApiTransaction } from './types';

export const createTransaction = (data: CreateTransactionPayload) =>
  apiPost<ApiTransaction>('/transactions/', data);

export const getMyTransactions = () =>
  apiGet<ApiTransaction[]>('/transactions/me');
