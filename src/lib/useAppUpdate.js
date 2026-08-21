'use client';

import { useCallback, useEffect, useState } from 'react';
import { BUILD_VERSION } from './buildVersion.js';

/**
 * Detects that a newer build has been deployed while this tab was open.
 *
 * Both apps are static exports served straight off disk, so there is no runtime to
 * push a notice — the tab has to look. It polls `/version.json` (written at build time
 * next to the bundle) and compares it against BUILD_VERSION, which is compiled into
 * this bundle. A mismatch means the server is serving a newer build than the one
 * running here.
 *
 * Comparing served-vs-compiled rather than served-vs-first-fetch matters: a tab that
 * loads a cached HTML shell *after* a deploy would take the already-new version as its
 * baseline and never notice it is running stale code.
 *
 * Polls on an interval, and again whenever the tab regains focus or the connection
 * comes back — a laptop reopened after hours should find out immediately, not after
 * one more interval. `cache: 'no-store'` plus a cache-busting param keeps intermediate
 * caches from serving the old stamp back.
 */
const POLL_MS = 5 * 60 * 1000;

export function useAppUpdate({ pollMs = POLL_MS } = {}) {
  const [updateReady, setUpdateReady] = useState(false);

  const check = useCallback(async () => {
    // In development the stamp is the committed "dev" placeholder, so every poll would
    // look like a mismatch. Nothing to detect locally anyway — Next hot-reloads.
    if (BUILD_VERSION === 'dev') return;

    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;

      const { version } = await res.json();
      // Only ever flip this ON. Once the user has been told, a transient fetch blip
      // must not quietly retract the notice.
      if (version && version !== BUILD_VERSION) setUpdateReady(true);
    } catch {
      // Offline or mid-deploy: not knowing is the normal case, so stay quiet.
    }
  }, []);

  useEffect(() => {
    check();

    const interval = setInterval(check, pollMs);
    const onFocus = () => {
      if (document.visibilityState === 'visible') check();
    };

    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('online', check);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('online', check);
    };
  }, [check, pollMs]);

  return updateReady;
}

export default useAppUpdate;
