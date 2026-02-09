import { apiPost } from './client';
import type { SignupPayload, LoginPayload, MobileSendCodePayload, MobileVerifyPayload, AuthResponse } from './types';

export const signup = (data: SignupPayload) =>
  apiPost<AuthResponse>('/auth/signup', data);

export const login = (data: LoginPayload) =>
  apiPost<AuthResponse>('/auth/login', data);

export const sendMobileCode = (data: MobileSendCodePayload) =>
  apiPost<{ message: string }>('/auth/mobile/send-code', data);

export const verifyMobileCode = (data: MobileVerifyPayload) =>
  apiPost<AuthResponse>('/auth/mobile/verify', data);
