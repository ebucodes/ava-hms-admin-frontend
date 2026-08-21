'use client';

import { useEffect, useState } from 'react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { money } from '@/src/lib/format.js';
import { profitAndLoss } from '@/src/lib/api/tenant.js';

function Section({ title, rows, total, color }) {
  return (
    <Card pad={18}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink }}>{title}</div>
        <div style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color }}>{money(total)}</div>
      </div>
      {(rows || []).length === 0 && <div style={{ fontSize: 12.5, color: C.ink3 }}>Nothing posted in this period.</div>}
      {(rows || []).map((r) => (
        <div key={r.code} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: `1px solid ${C.borderSoft}` }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{r.code}</div>
          </div>
          <div style={{ fontSize: 13, color: C.ink2, whiteSpace: 'nowrap' }}>{money(r.balance)}</div>
        </div>
      ))}
    </Card>
  );
}

/** Profit & loss for the hospital, straight from its own ledger. */
export default function ProfitLossOps({ slug }) {
  const [pnl, setPnl] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    setPnl(null);
    setErrMsg(null);
    profitAndLoss(slug)
      .then(setPnl)
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's P&L.",
      ));
  }, [slug]);

  if (errMsg) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink2 }}>{errMsg}</div></Card>;
  if (!pnl) return <Card pad={18}><div style={{ fontSize: 13, color: C.ink3 }}>Loading profit &amp; loss…</div></Card>;

  const net = Number(pnl.net ?? 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12.5, color: C.ink3 }}>
        {pnl.from || 'Since inception'}{pnl.to ? ` → ${pnl.to}` : ''} ·{' '}
        {pnl.is_consolidated ? 'All branches (consolidated)' : 'Single branch'}
      </div>

      <Card pad={18}>
        <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 600 }}>Net</div>
        <div style={{ fontFamily: FONT.display, fontSize: 30, fontWeight: 800, color: net < 0 ? C.red : C.emerald, lineHeight: 1.1, marginTop: 4 }}>
          {money(pnl.net)}
        </div>
        <div style={{ fontSize: 12, color: C.ink3, marginTop: 6 }}>
          {money(pnl.revenue_total)} revenue − {money(pnl.expense_total)} expenses
        </div>
      </Card>

      <div className="ava-grid-2" style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Section title="Revenue" rows={pnl.revenue} total={pnl.revenue_total} color={C.emerald} />
        <Section title="Expenses" rows={pnl.expenses} total={pnl.expense_total} color={C.red} />
      </div>
    </div>
  );
}
