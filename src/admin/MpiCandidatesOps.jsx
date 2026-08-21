'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { titleCase, date } from '@/src/lib/format.js';
import { listMpiCandidates } from '@/src/lib/api/tenant.js';

/**
 * Duplicate-patient candidates from the Master Patient Index — records that look like
 * the same person arriving through two branches or two offline nodes.
 *
 * READ ONLY here on purpose. Merging welds two clinical histories together and is gated
 * on `sync.mpi.manage`; the platform console surfaces the candidates so support can see
 * what a hospital is facing, but the hospital decides who is who.
 */
export default function MpiCandidatesOps({ slug }) {
  const [groups, setGroups] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    setGroups(null);
    setErrMsg(null);
    listMpiCandidates(slug)
      .then((data) => setGroups(data?.groups || []))
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's duplicate candidates.",
      ));
  }, [slug]);

  if (errMsg) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink2 }}>{errMsg}</div></Card>;
  if (!groups) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink3 }}>Looking for duplicates…</div></Card>;

  if (groups.length === 0) {
    return <Card pad={18}><div style={{ fontSize: 13, color: C.ink3 }}>No duplicate candidates — every patient record looks distinct.</div></Card>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12.5, color: C.ink3 }}>
        {groups.length} possible {groups.length === 1 ? 'duplicate' : 'duplicates'} · read-only — merging is the hospital&apos;s call
      </div>
      {groups.map((g, i) => (
        <Card key={`${g.match_reason}-${i}`} pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.amber + '15', display: 'grid', placeItems: 'center' }}>
              <Users size={15} color={C.amber} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
              Matched on {titleCase(String(g.match_reason || '').replace(/^match_/, ''))}
            </div>
            <Badge color={C.amber} bg={C.amber + '14'}>{(g.patients || []).length} RECORDS</Badge>
          </div>
          {(g.patients || []).map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '9px 0', borderTop: `1px solid ${C.borderSoft}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{p.full_name || '—'}</div>
                <div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{p.patient_number || p.id}</div>
              </div>
              <div style={{ fontSize: 12, color: C.ink2, textAlign: 'right' }}>
                <div>{p.phone || '—'}</div>
                {p.date_of_birth && <div style={{ fontSize: 11, color: C.ink3 }}>{date(p.date_of_birth)}</div>}
              </div>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}
