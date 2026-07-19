'use client';

import { Building2, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { C, FONT } from '@/src/theme/tokens.js';
import { td } from '@/src/components/ui/styles.js';
import TableShell from '@/src/components/data/TableShell.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import Pagination from '@/src/components/ui/Pagination.jsx';
import StatTiles, { STATUS_COLOR } from '@/src/admin/StatTiles.jsx';
import { upper } from '@/src/lib/format.js';

/** Hospitals section: stat tiles + the tenant table (rows open detail). */
export default function HospitalsView({ companies, summary, meta, loading, error, onOpen, onRetry, onPage }) {
  const list = Array.isArray(companies) ? companies : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <StatTiles companies={companies} summary={summary} loading={loading} error={error} />

      <TableShell
        title="Hospitals"
        sub={!loading && !error ? `${list.length} on the platform` : 'Tenant hospitals'}
        icon={Building2}
        cols={['Hospital', 'Status', 'Facilities', 'Staff', '']}
        right={<span />}
      >
        {loading && <tr><td style={{ ...td, color: C.ink3 }} colSpan={5}>Loading…</td></tr>}
        {!loading && error && (
          <tr><td style={{ ...td, color: C.red }} colSpan={5}>Couldn't load hospitals. <button onClick={onRetry} style={{ color: C.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button></td></tr>
        )}
        {!loading && !error && list.length === 0 && (
          <tr><td style={{ ...td, color: C.ink3 }} colSpan={5}>
            No hospitals onboarded yet. <Link href="/onboard" style={{ color: C.blue, fontWeight: 600, textDecoration: 'none' }}><Plus size={12} style={{ verticalAlign: '-2px' }} /> Onboard one</Link>
          </td></tr>
        )}
        {!loading && !error && list.map((c) => (
          <tr key={c.id} className="ava-row" onClick={() => onOpen(c.slug)} style={{ cursor: 'pointer' }}>
            <td style={td}>
              <div style={{ fontWeight: 700, color: C.ink }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: C.ink3, fontFamily: FONT.mono, marginTop: 2 }}>{c.slug}</div>
            </td>
            <td style={td}><Badge color={STATUS_COLOR[c.status] || C.ink3} bg={(STATUS_COLOR[c.status] || C.ink3) + '14'} dot>{upper(c.status)}</Badge></td>
            <td style={td}>{c.facilities_count ?? '—'}</td>
            <td style={td}>{c.users_count ?? '—'}</td>
            <td style={{ ...td, textAlign: 'right' }}><ChevronRight size={16} color={C.ink3} /></td>
          </tr>
        ))}
      </TableShell>

      {!error && <Pagination pagination={meta} onPage={onPage} disabled={loading} />}
    </div>
  );
}
