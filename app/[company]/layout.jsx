'use client';

import { use } from 'react';
import { AuthProvider } from '@/src/lib/auth/AuthContext.jsx';

/**
 * Tenant layout. The company slug is taken straight from the URL segment and
 * handed to the tenant AuthProvider, which scopes every API call to it.
 */
export default function CompanyLayout({ children, params }) {
  const { company } = use(params);

  return <AuthProvider slug={company}>{children}</AuthProvider>;
}
