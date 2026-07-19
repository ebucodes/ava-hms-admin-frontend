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

export const STATUS_COLOR = { active: C.emerald, suspended: C.red, inactive: C.ink3 };
