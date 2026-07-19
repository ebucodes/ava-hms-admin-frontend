'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getAdminToken, getAdminExpiry, clearAdminAuth } from '@/src/lib/api/client';
import { adminLogin, adminLogout, adminProfile, adminRefresh } from '@/src/lib/api/admin';

const AdminAuthContext = createContext(null);

const EMPTY_STATE = { loading: true, token: null, admin: null };
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

/**
 * Platform system-admin auth provider. Completely separate from the tenant
 * AuthProvider — different token storage, different backend guard.
 */
export function AdminAuthProvider({ children }) {
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
    clearAdminAuth();
    setState({ loading: false, token: null, admin: null });
  }, [clearRefreshTimer]);

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer();
    const expiry = getAdminExpiry();
    if (!expiry) return;
    const delay = Math.max(expiry - Date.now() - REFRESH_BUFFER_MS, 0);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        await adminRefresh();
        setState((s) => ({ ...s, token: getAdminToken() }));
        scheduleRefresh();
      } catch {
        signOutLocally();
      }
    }, delay);
  }, [clearRefreshTimer, signOutLocally]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setState({ loading: false, token: null, admin: null });
      return undefined;
    }

    (async () => {
      try {
        const admin = await adminProfile();
        setState({ loading: false, token: getAdminToken(), admin });
        scheduleRefresh();
      } catch {
        signOutLocally();
      }
    })();

    return clearRefreshTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await adminLogin(email, password);
    setState({ loading: false, token: data.access_token, admin: data.admin });
    scheduleRefresh();
    return data;
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    clearRefreshTimer();
    try {
      await adminLogout();
    } catch {
      // token may already be invalid — clear local state regardless
    }
    setState({ loading: false, token: null, admin: null });
  }, [clearRefreshTimer]);

  return (
    <AdminAuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
