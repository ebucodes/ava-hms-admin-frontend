'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getToken, getTokenExpiry, clearAuthStorage } from '@/src/lib/api/client';
import { login as apiLogin, logout as apiLogout, getProfile, refreshToken as apiRefreshToken } from '@/src/lib/api/auth';

const AuthContext = createContext(null);

const EMPTY_STATE = { loading: true, token: null, user: null };
const REFRESH_BUFFER_MS = 2 * 60 * 1000; // refresh 2 minutes before the token actually expires

/**
 * Tenant auth provider. Scoped to a single company: `slug` comes from the URL
 * (/{company}/...) via the tenant layout, and every tenant API call is made
 * against it. Mounting under a different slug re-validates against that tenant.
 */
export function AuthProvider({ slug, children }) {
  const [state, setState] = useState(EMPTY_STATE);
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const signOutLocally = useCallback(() => {
    clearRefreshTimer();
    clearAuthStorage();
    setState({ loading: false, token: null, user: null });
  }, [clearRefreshTimer]);

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer();
    const expiry = getTokenExpiry();
    if (!expiry) return;
    const delay = Math.max(expiry - Date.now() - REFRESH_BUFFER_MS, 0);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        await apiRefreshToken(slug);
        setState((s) => ({ ...s, token: getToken() }));
        scheduleRefresh();
      } catch {
        signOutLocally();
      }
    }, delay);
  }, [clearRefreshTimer, signOutLocally, slug]);

  useEffect(() => {
    const token = getToken();

    if (!token || !slug) {
      setState({ loading: false, token: null, user: null });
      return undefined;
    }

    (async () => {
      const expiry = getTokenExpiry();
      if (expiry && Date.now() >= expiry - REFRESH_BUFFER_MS) {
        try {
          await apiRefreshToken(slug);
        } catch {
          signOutLocally();
          return;
        }
      }
      try {
        const user = await getProfile(slug);
        setState({ loading: false, token: getToken(), user });
        scheduleRefresh();
      } catch {
        signOutLocally();
      }
    })();

    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const login = useCallback(async (email, password, remember = true) => {
    const data = await apiLogin(slug, { email, password }, remember);
    setState({ loading: false, token: data.access_token, user: data.user });
    scheduleRefresh();
    return data;
  }, [scheduleRefresh, slug]);

  const logout = useCallback(async () => {
    clearRefreshTimer();
    try {
      await apiLogout(slug);
    } catch {
      // token may already be invalid/expired — clear local state regardless
    }
    setState({ loading: false, token: null, user: null });
  }, [clearRefreshTimer, slug]);

  return (
    <AuthContext.Provider value={{ ...state, companySlug: slug, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
