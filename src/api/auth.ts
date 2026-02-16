import { apiPost, apiPostForm } from './client';
import type { SignupPayload, LoginPayload, MobileSendCodePayload, MobileVerifyPayload, AuthResponse } from './types';

export const signup = (data: SignupPayload) =>
  apiPost<AuthResponse>('/auth/signup', data);

export const login = (data: LoginPayload) =>
  apiPostForm<AuthResponse>('/auth/login', {
    username: data.email,
    password: data.password,
  });

export const sendMobileCode = (data: MobileSendCodePayload) =>
  apiPost<{ message: string }>('/auth/mobile/send-code', data);

export const verifyMobileCode = (data: MobileVerifyPayload) =>
  apiPost<AuthResponse>('/auth/mobile/verify', data);
