'use client';

import { ToastProvider } from '@/src/components/ui/Toast.jsx';
import { ConfirmProvider } from '@/src/components/ui/Confirm.jsx';
import { AdminAuthProvider } from '@/src/lib/auth/AdminAuthContext.jsx';

/**
 * Client-only providers, split out so the root layout can stay a server
 * component (and thus export metadata / page titles). The admin console has a
 * single global auth provider — every page under the root domain is behind the
 * system-admin session.
 */
export default function Providers({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
