import { apiRequest } from './client';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from './types';

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchProfile(token: string): Promise<AuthUser> {
  const { user } = await apiRequest<{ user: AuthUser }>('/auth/me', { token });
  return user;
}
