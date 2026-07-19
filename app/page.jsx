'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { C, FONT } from '@/src/theme/tokens.js';
import { getCompanySlug } from '@/src/lib/api/client.js';

/**
 * Platform root. The app itself lives under /{company}. A returning tenant user
 * is redirected to their remembered hospital portal; otherwise we show a minimal
 * pointer (the system-admin login at /login lands in a later phase).
 */
export default function RootPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const slug = getCompanySlug();
    if (slug) {
      router.replace(`/${slug}`);
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${C.blue}20, ${C.violet}20)`,
        padding: 20,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 440,
          background: '#fff',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink, margin: 0 }}>
          AVA HMS
        </h1>
        <p style={{ fontSize: 14, color: C.ink3, lineHeight: 1.6, margin: '12px 0 0' }}>
          Access your hospital portal at{' '}
          <code style={{ color: C.ink, background: C.borderSoft, padding: '2px 6px', borderRadius: 6 }}>
            /your-hospital-id
          </code>
          . System-administrator sign-in is coming soon.
        </p>
      </div>
    </div>
  );
}
