'use client';

import { useEffect, useState } from 'react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { money } from '@/src/lib/format.js';
import { receivablesAging } from '@/src/lib/api/tenant.js';

// Bucket order is the backend's, oldest last — the shape of the tail is the story.
const BUCKETS = ['current', '1-30', '31-60', '61-90', '90+'];
const BUCKET_COLOR = { current: C.emerald, '1-30': C.blue, '31-60': C.amber, '61-90': C.amber, '90+': C.red };

/** HMO/corporate receivables by age — where a hospital's cash is actually stuck. */
export default function ReceivablesAgingOps({ slug }) {
  const [aging, setAging] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    setAging(null);
    setErrMsg(null);
    receivablesAging(slug)
      .then(setAging)
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's receivables.",
      ));
  }, [slug]);

  if (errMsg) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink2 }}>{errMsg}</div></Card>;
  if (!aging) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink3 }}>Loading receivables…</div></Card>;

  const buckets = aging.buckets || {};
  const payers = aging.payers || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card pad={18}>
        <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 600 }}>Total outstanding</div>
        <div style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 800, color: C.ink, lineHeight: 1.1, marginTop: 4 }}>
          {money(aging.total_outstanding)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginTop: 14 }}>
          {BUCKETS.map((b) => (
            <div key={b} style={{ padding: '10px 12px', borderRadius: 10, background: BUCKET_COLOR[b] + '0d', border: `1px solid ${BUCKET_COLOR[b]}33` }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', color: BUCKET_COLOR[b] }}>
                {b === 'current' ? 'CURRENT' : `${b} DAYS`}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 4 }}>{money(buckets[b])}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card pad={0}>
        <div style={{ padding: '15px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
          <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink }}>By payer</div>
          <div style={{ fontSize: 11.5, color: C.ink3 }}>Read-only · via act-as session</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>
              {['Payer', 'Outstanding', 'Invoices', 'Oldest', ''].map((c, i) => (
                <th key={c || i} style={{ textAlign: 'left', padding: '11px 18px', fontSize: 10.5, fontWeight: 700, color: C.ink3, letterSpacing: '.06em', borderBottom: `1px solid ${C.borderSoft}`, whiteSpace: 'nowrap' }}>{c.toUpperCase()}</th>
              ))}
            </tr></thead>
            <tbody>
              {payers.length === 0 && <tr><td style={{ padding: '13px 18px', color: C.ink3 }} colSpan={5}>Nothing outstanding.</td></tr>}
              {payers.map((p) => (
                <tr key={p.payer_id} className="ava-row">
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}`, fontWeight: 700, color: C.ink }}>{p.payer_name || '—'}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>{money(p.outstanding)}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>{p.invoice_count ?? 0}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}`, color: p.oldest_days > 90 ? C.red : C.ink2, fontWeight: p.oldest_days > 90 ? 700 : 400 }}>
                    {p.oldest_days ? `${p.oldest_days} days` : '—'}
                  </td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
                    {/* halt_credit is the hospital's own decision to stop extending cover
                        to this payer — the single most consequential flag on the row. */}
                    {p.halt_credit && <Badge color={C.red} bg={C.red + '14'} dot>CREDIT HALTED</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
