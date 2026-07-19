'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, LogOut, ShieldCheck } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { useAdminAuth } from '@/src/lib/auth/AdminAuthContext.jsx';

export default function AdminPortalPage() {
  const router = useRouter();
  const { loading, token, admin, logout } = useAdminAuth();
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

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.bg}, ${C.bgGrad})`, padding: '32px 20px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${C.ink}, ${C.violet})`, display: 'grid', placeItems: 'center', color: '#fff' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 800, color: C.ink, margin: 0 }}>
                System Administration
              </h1>
              <p style={{ fontSize: 13, color: C.ink3, margin: '2px 0 0' }}>
                {admin?.name} · {admin?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 10, border: `1px solid ${C.border}`, background: '#fff', color: C.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <LogOut size={15} /> Sign out
          </button>
        </header>

        <div className="ava-grid-2" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <Link href="/admin/onboard" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.blueSoft, display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                <Building2 size={20} color={C.blue} />
              </div>
              <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 700, color: C.ink }}>Onboard a Hospital</div>
              <p style={{ fontSize: 13, color: C.ink3, margin: '6px 0 0', lineHeight: 1.5 }}>
                Create a new tenant hospital and its first administrator account.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
