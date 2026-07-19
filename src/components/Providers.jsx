'use client';

import { ToastProvider } from '@/src/components/ui/Toast.jsx';

/**
 * Client-only providers, split out so the root layout can stay a server
 * component (and thus export metadata / page titles).
 */
export default function Providers({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
