'use client';

import { useEffect, useState } from 'react';
import { BedDouble } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { titleCase } from '@/src/lib/format.js';
import { STATUS_COLOR } from '@/src/admin/StatTiles.jsx';
import { wardCensus } from '@/src/lib/api/tenant.js';

/** Live bed census — occupancy now, and where the beds actually are in the turnover loop. */
export default function BedCensusOps({ slug }) {
  const [census, setCensus] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    setCensus(null);
    setErrMsg(null);
    wardCensus(slug)
      .then(setCensus)
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's bed census.",
      ));
  }, [slug]);

  if (errMsg) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink2 }}>{errMsg}</div></Card>;
  if (!census) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink3 }}>Loading census…</div></Card>;

  const rate = Number(census.occupancy_rate ?? 0);
  const tiles = [
    ['Total beds', census.total_beds, C.blue],
    ['Available', census.available, C.emerald],
    ['Occupied', census.occupied, C.violet],
    ['Occupancy', `${rate}%`, rate >= 90 ? C.red : rate >= 75 ? C.amber : C.emerald],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="ava-grid-4" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {tiles.map(([label, value, color]) => (
          <Card key={label} pad={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '15', display: 'grid', placeItems: 'center' }}>
                <BedDouble size={14} color={color} />
              </div>
              <span style={{ fontSize: 12, color: C.ink3, fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink }}>{value ?? '—'}</div>
          </Card>
        ))}
      </div>

      <Card pad={18}>
        <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 3 }}>By bed status</div>
        <div style={{ fontSize: 12, color: C.ink3, marginBottom: 12 }}>
          The three turnover states are the clean-room loop — beds sitting there are capacity nobody can book.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 9 }}>
          {Object.entries(census.by_status || {}).map(([status, count]) => {
            const color = STATUS_COLOR[status] || C.violet;
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', borderRadius: 10, background: color + '0d', border: `1px solid ${color}33` }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink2 }}>{titleCase(status)}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color }}>{count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {(census.by_category || []).length > 0 && (
        <Card pad={18}>
          <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12 }}>By ward category</div>
          {(census.by_category || []).map((c) => (
            <div key={c.category || c.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: `1px solid ${C.borderSoft}` }}>
              <span style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{titleCase(c.category || c.name)}</span>
              <span style={{ fontSize: 13, color: C.ink2 }}>{c.occupied ?? 0} / {c.total ?? c.total_beds ?? 0} occupied</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
