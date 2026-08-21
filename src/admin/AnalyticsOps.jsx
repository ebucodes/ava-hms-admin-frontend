'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { getDashboard } from '@/src/lib/api/tenant.js';

/**
 * The hospital's Executive analytics board, read through the act-as session.
 *
 * Rendered from the SAME backend preset the hospital's own portal uses, so the platform
 * team and the hospital are always looking at identical numbers — a parallel admin
 * aggregation could drift, and a support call about "your dashboard says X" would then
 * be about two different dashboards.
 */

/** Format by the unit the metric declares — the client never guesses. */
function formatValue(metric) {
  const v = metric.value;
  if (v == null) return '—';
  switch (metric.unit) {
    case 'currency': return `₦${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    case 'percent': return `${Number(v).toFixed(1)}%`;
    case 'minutes': return `${Number(v).toFixed(0)} min`;
    case 'hours': return `${Number(v).toFixed(1)} h`;
    case 'days': return `${Number(v).toFixed(1)} d`;
    default: return Number(v).toLocaleString();
  }
}

function Delta({ metric }) {
  // Snapshot metrics have no previous window — a comparison would be a fabrication.
  if (metric.is_snapshot || metric.previous == null) return null;
  const diff = Number(metric.value ?? 0) - Number(metric.previous);
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const color = diff > 0 ? C.emerald : diff < 0 ? C.red : C.ink3;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color }}>
      <Icon size={12} /> {diff === 0 ? 'flat' : `${diff > 0 ? '+' : ''}${Number(diff).toLocaleString()}`}
    </span>
  );
}

export default function AnalyticsOps({ slug }) {
  const [board, setBoard] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    setBoard(null);
    setErrMsg(null);
    getDashboard(slug, 'executive')
      .then(setBoard)
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's analytics.",
      ));
  }, [slug]);

  if (errMsg) {
    return <Card pad={18}><div style={{ fontSize: 13, color: C.ink2 }}>{errMsg}</div></Card>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12.5, color: C.ink3 }}>
        {board
          ? <>Executive overview · {board.from} → {board.to} · same preset the hospital sees</>
          : 'Loading analytics…'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
        {(board?.metrics || []).map((m) => (
          <Card key={m.key} pad={16}>
            <div style={{ fontSize: 11.5, color: C.ink3, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink, marginTop: 6, lineHeight: 1.1 }}>
              {formatValue(m)}
            </div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Delta metric={m} />
              {m.is_snapshot && <span style={{ fontSize: 10.5, color: C.ink3 }}>right now</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
