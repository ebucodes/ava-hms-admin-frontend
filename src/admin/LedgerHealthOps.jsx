'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Scale } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { money, titleCase } from '@/src/lib/format.js';
import { verifyLedger, trialBalance } from '@/src/lib/api/tenant.js';

/**
 * Ledger integrity: the hash-chain verification and the trial balance, together,
 * because they answer one question — is this hospital's ledger sound?
 *
 * A broken chain is a FRAUD SIGNAL, not a validation warning: every entry hashes the
 * one before it, so a break means a posted entry was altered or removed after the fact.
 * That is why the first break is rendered loudly and by entry number — a support call
 * about it starts with "which entry", and burying it in a green panel would lose the
 * one fact that matters.
 */
export default function LedgerHealthOps({ slug }) {
  const [verify, setVerify] = useState(null);
  const [balance, setBalance] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    setVerify(null);
    setBalance(null);
    setErrMsg(null);
    Promise.all([verifyLedger(slug), trialBalance(slug)])
      .then(([v, b]) => { setVerify(v); setBalance(b); })
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's ledger.",
      ));
  }, [slug]);

  if (errMsg) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink2 }}>{errMsg}</div></Card>;
  if (!verify || !balance) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink3 }}>Verifying ledger…</div></Card>;

  const intact = verify.is_intact;
  const breaks = verify.broken_at || [];
  const first = breaks[0];
  const tone = intact ? C.emerald : C.red;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hash-chain verdict */}
      <Card pad={18}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: tone + '15', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {intact ? <ShieldCheck size={20} color={tone} /> : <ShieldAlert size={20} color={tone} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: tone }}>
              {intact ? 'Ledger chain intact' : 'LEDGER CHAIN BROKEN'}
            </div>
            <div style={{ fontSize: 12.5, color: C.ink2, marginTop: 3 }}>
              {verify.entries_checked} {verify.entries_checked === 1 ? 'entry' : 'entries'} checked.
              {intact
                ? ' Every entry still hashes to the one before it.'
                : ' An entry was altered or removed after posting — escalate, do not resolve in the console.'}
            </div>

            {!intact && first && (
              <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 11, background: C.red + '0d', border: `1px solid ${C.red}33` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: C.red }}>FIRST BREAK</div>
                <div style={{ fontFamily: FONT.mono, fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 4 }}>
                  {first.entry_number || first.entry_id}
                </div>
                {first.entry_date && <div style={{ fontSize: 12, color: C.ink2, marginTop: 2 }}>{first.entry_date}</div>}
                {breaks.length > 1 && (
                  <div style={{ fontSize: 12, color: C.ink2, marginTop: 8 }}>
                    …and {breaks.length - 1} further {breaks.length - 1 === 1 ? 'break' : 'breaks'} after it:{' '}
                    <span style={{ fontFamily: FONT.mono }}>
                      {breaks.slice(1, 6).map((b) => b.entry_number || b.entry_id).join(', ')}
                      {breaks.length > 6 ? ' …' : ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Trial balance */}
      <Card pad={0}>
        <div style={{ padding: '15px 18px', borderBottom: `1px solid ${C.borderSoft}`, display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: C.blueSoft, display: 'grid', placeItems: 'center' }}>
            <Scale size={16} color={C.blue} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink }}>Trial balance</div>
            <div style={{ fontSize: 11.5, color: C.ink3 }}>Read-only · via act-as session</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: balance.is_balanced ? C.emerald : C.red }}>
            {balance.is_balanced ? 'BALANCED' : 'OUT OF BALANCE'}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>
              {['Account', 'Type', 'Debit', 'Credit', 'Balance'].map((c) => (
                <th key={c} style={{ textAlign: 'left', padding: '11px 18px', fontSize: 10.5, fontWeight: 700, color: C.ink3, letterSpacing: '.06em', borderBottom: `1px solid ${C.borderSoft}`, whiteSpace: 'nowrap' }}>{c.toUpperCase()}</th>
              ))}
            </tr></thead>
            <tbody>
              {(balance.rows || []).length === 0 && (
                <tr><td style={{ padding: '13px 18px', color: C.ink3 }} colSpan={5}>Nothing posted yet.</td></tr>
              )}
              {(balance.rows || []).map((r) => (
                <tr key={r.code} className="ava-row">
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>
                    <div style={{ fontWeight: 700, color: C.ink }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{r.code}</div>
                  </td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>{titleCase(r.type)}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>{money(r.debit)}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}` }}>{money(r.credit)}</td>
                  <td style={{ padding: '13px 18px', borderBottom: `1px solid ${C.borderSoft}`, fontWeight: 700, color: C.ink }}>{money(r.balance)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '13px 18px', fontWeight: 800, color: C.ink }} colSpan={2}>Total</td>
                <td style={{ padding: '13px 18px', fontWeight: 800, color: C.ink }}>{money(balance.total_debit)}</td>
                <td style={{ padding: '13px 18px', fontWeight: 800, color: C.ink }}>{money(balance.total_credit)}</td>
                <td style={{ padding: '13px 18px' }} />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
