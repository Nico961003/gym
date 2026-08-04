import { createContext } from 'react';
import type { AuthUser, LoginPayload, RegisterPayload } from '../api/types';

export interface AuthContextValue {
  user: AuthUser | null;
  /** Token JWT en curso; lo necesitan las llamadas protegidas. */
  token: string | null;
  /** true mientras se comprueba el token guardado al arrancar. */
  loading: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const TOKEN_STORAGE_KEY = 'rg.auth.token';
