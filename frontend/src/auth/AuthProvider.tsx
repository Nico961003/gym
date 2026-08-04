import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { AuthUser, LoginPayload, RegisterPayload } from '../api/types';
import {
  AuthContext,
  TOKEN_STORAGE_KEY,
  type AuthContextValue,
} from './AuthContext';

/**
 * Estado de sesión de la aplicación.
 *
 * El token se guarda en localStorage. Es lo habitual cuando el frontend y la
 * API viven en dominios distintos, pero conviene saber el matiz: una cookie
 * httpOnly sería más resistente a XSS, a cambio de tener que configurar CORS
 * con credenciales y protección CSRF. Ver el README.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  );
  // Solo hay algo que comprobar si había un token guardado.
  const [loading, setLoading] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) !== null
  );

  // Al arrancar, si hay token guardado se valida contra /auth/me.
  useEffect(() => {
    const guardado = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!guardado) return;

    let cancelado = false;

    authApi
      .fetchProfile(guardado)
      .then((perfil) => {
        if (!cancelado) setUser(perfil);
      })
      .catch(() => {
        // Token caducado o inválido: se descarta.
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (!cancelado) setToken(null);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: perfil, token: nuevo } = await authApi.login(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, nuevo);
    setToken(nuevo);
    setUser(perfil);
    return perfil;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: perfil, token: nuevo } = await authApi.register(payload);
    localStorage.setItem(TOKEN_STORAGE_KEY, nuevo);
    setToken(nuevo);
    setUser(perfil);
    return perfil;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.rol === 'ADMIN',
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
