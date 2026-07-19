'use client';

import { AdminAuthProvider } from '@/src/lib/auth/AdminAuthContext.jsx';

export default function AdminLayout({ children }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
