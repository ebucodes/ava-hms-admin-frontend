'use client';

import { ChevronRight } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import StatTiles, { STATUS_COLOR } from '@/src/admin/StatTiles.jsx';
import { upper } from '@/src/lib/format.js';

/** Landing view: greeting hero, stat tiles, and a recent-hospitals list. */
export default function Overview({ admin, companies, summary, loading, error, onOpen, onSeeAll }) {
  const list = Array.isArray(companies) ? companies : [];
  const recent = list.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* hero */}
      <div style={{ borderRadius: 18, padding: '26px 28px', background: `linear-gradient(135deg, ${C.ink}, ${C.violet})`, color: '#fff' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', opacity: 0.75 }}>PLATFORM CONSOLE</div>
        <h1 style={{ fontFamily: FONT.display, fontSize: 27, fontWeight: 800, margin: '12px 0 4px', letterSpacing: '-.03em' }}>
          Welcome{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', margin: 0 }}>Operations across every hospital on the platform.</p>
      </div>

      <StatTiles companies={companies} summary={summary} loading={loading} error={error} />

      <Card pad={0}>
        <div style={{ padding: '15px 18px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink }}>Recent hospitals</div>
          {list.length > 0 && (
            <button onClick={onSeeAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: C.blue, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              See all <ChevronRight size={14} />
            </button>
          )}
        </div>
        {error ? (
          <div style={{ padding: 22, color: C.red, fontSize: 13 }}>Couldn't load hospitals.</div>
        ) : loading ? (
          <div style={{ padding: 22, color: C.ink3, fontSize: 13 }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div style={{ padding: 22, color: C.ink3, fontSize: 13 }}>No hospitals yet — onboard one to get started.</div>
        ) : (
          recent.map((c) => (
            <button
              key={c.id}
              onClick={() => onOpen(c.slug)}
              className="ava-row"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}`, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{c.name}</span>
                <Badge color={STATUS_COLOR[c.status] || C.ink3} bg={(STATUS_COLOR[c.status] || C.ink3) + '14'} dot>{upper(c.status)}</Badge>
              </span>
              <ChevronRight size={16} color={C.ink3} />
            </button>
          ))
        )}
      </Card>
    </div>
  );
}
