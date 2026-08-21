'use client';

import { Hospital, CheckCircle2, Network, Users } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';

/** Overview stat tiles — same template as the customer Dashboard tiles. Prefers
 *  the platform-wide `summary` (whole platform); falls back to the current page. */
export default function StatTiles({ companies, summary, loading, error }) {
  const list = Array.isArray(companies) ? companies : [];
  const tiles = summary
    ? [
        ['Hospitals', summary.hospitals, C.blue, Hospital],
        ['Active', summary.active, C.emerald, CheckCircle2],
        ['Facilities', summary.facilities, C.violet, Network],
        ['Staff', summary.staff, C.amber, Users],
      ]
    : [
        ['Hospitals', list.length, C.blue, Hospital],
        ['Active', list.filter((c) => c.status === 'active').length, C.emerald, CheckCircle2],
        ['Facilities', list.reduce((n, c) => n + (c.facilities_count ?? 0), 0), C.violet, Network],
        ['Staff', list.reduce((n, c) => n + (c.users_count ?? 0), 0), C.amber, Users],
      ];

  return (
    <div className="ava-grid-4" style={{ display: 'grid', gap: 14 }}>
      {tiles.map(([label, value, color, Icon], i) => (
        <Card key={label} delay={i * 50} pad={15}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: color + '15', display: 'grid', placeItems: 'center' }}>
              <Icon size={15} color={color} />
            </div>
            <span style={{ fontSize: 12, color: C.ink3, fontWeight: 600 }}>{label}</span>
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 800, color: C.ink }}>
            {loading || error ? '—' : value}
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Status pill colours, keyed on the backend's shared StatusEnum. One map for every
 * module because the backend has one enum: a per-viewer palette would drift the moment
 * a status is reused (and StatusEnum reuses plenty — `pending`, `cancelled`, `received`).
 *
 * Read the colour as a verdict, not a category: green = settled or a good outcome,
 * amber = waiting on someone, blue = in flight, red = refused/broken, grey = dormant.
 * Anything unmapped falls back to violet at the call site, which is the signal that a
 * new StatusEnum case landed and belongs here.
 */
export const STATUS_COLOR = {
  // Entity lifecycle
  active: C.emerald, inactive: C.ink3, suspended: C.red,
  // Encounter / queue
  open: C.blue, closed: C.ink3,
  waiting: C.amber, vitals: C.blue, consulting: C.blue,
  completed: C.emerald, cancelled: C.ink3,
  // Clinical notes & orders
  draft: C.ink3, final: C.emerald,
  pending: C.amber, in_progress: C.blue,
  // Billing
  unpaid: C.red, partially_paid: C.amber, paid: C.emerald,
  // HMO authorization gateway
  approved_hmo: C.emerald, approved_internal: C.violet,
  deferred: C.amber, denied: C.red, excluded: C.ink3,
  // Lab specimens
  collected: C.blue, received: C.blue, rejected: C.red,
  // Admissions
  cleared: C.emerald, pending_admission: C.amber,
  admitted: C.blue, discharged: C.ink3,
  // Drug chart (MAR)
  scheduled: C.blue, administered: C.emerald, not_administered: C.red,
  // Medication returns & finance
  confirmed: C.emerald, posted: C.emerald, approved: C.emerald,
  reimbursed: C.emerald, overdue: C.red,
  // Beds
  ready: C.emerald, occupied: C.blue,
  awaiting_cleaning: C.amber, pending_inspection: C.amber,
  // Sync
  applied: C.emerald, quarantined: C.red, resolved: C.emerald,
  // Billing tokens
  redeemed: C.emerald,
};
