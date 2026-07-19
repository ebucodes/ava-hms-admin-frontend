'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/src/lib/auth/AdminAuthContext.jsx';
import AdminShell from '@/src/admin/AdminShell.jsx';

/**
 * Admin console root (admin.xyz.com/). Auth guard around the app shell — the
 * sidebar, overview, and hospital management live in AdminShell. Unauthenticated
 * visitors are sent to /login.
 */
export default function AdminHome() {
  const router = useRouter();
  const { loading, token } = useAdminAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !token) {
      router.replace('/login');
    }
  }, [mounted, loading, token, router]);

  if (!mounted || loading || !token) return null;

  return <AdminShell />;
}
