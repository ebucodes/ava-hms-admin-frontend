'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '@/src/theme/tokens.js';

/**
 * Reusable pager for the admin console. Feed it the backend's `pagination` block
 * ({ total, per_page, current_page, last_page }) and an onPage(nextPage) handler.
 * Renders nothing when there's no data.
 */
export default function Pagination({ pagination, onPage, disabled = false }) {
  const total = pagination?.total ?? 0;
  if (!total) return null;

  const page = pagination.current_page ?? 1;
  const last = pagination.last_page ?? 1;
  const perPage = pagination.per_page ?? total;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const btn = (enabled) => ({
    display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 9,
    border: `1px solid ${C.border}`, background: C.surface,
    color: enabled ? C.ink2 : C.ink3, cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.5,
  });
  const canPrev = page > 1 && !disabled;
  const canNext = page < last && !disabled;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 4px 2px', flexWrap: 'wrap' }}>
      <div style={{ fontSize: 12.5, color: C.ink3 }}>
        Showing <strong style={{ color: C.ink2 }}>{from}–{to}</strong> of <strong style={{ color: C.ink2 }}>{total}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button aria-label="Previous page" disabled={!canPrev} onClick={() => canPrev && onPage(page - 1)} style={btn(canPrev)}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 12.5, color: C.ink2, fontWeight: 600, minWidth: 82, textAlign: 'center' }}>Page {page} of {last}</span>
        <button aria-label="Next page" disabled={!canNext} onClick={() => canNext && onPage(page + 1)} style={btn(canNext)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
