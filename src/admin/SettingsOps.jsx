'use client';

import { useEffect, useState } from 'react';
import { ToggleRight, ToggleLeft, Plug } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { getSettings } from '@/src/lib/api/tenant.js';
import { titleCase } from '@/src/lib/format.js';

// Mirrors ModuleEnum on the backend. Absent enabled_modules = everything on.
const ALL_MODULES = [
  'front_desk', 'clinical', 'pharmacy', 'laboratory', 'billing',
  'hmo', 'ward', 'finance', 'analytics', 'sync',
];

/**
 * Read-only view of a hospital's module toggles and integrations. Integration tokens
 * arrive MASKED from the API (••••1234) — the platform console never sees a live
 * credential, which is exactly the point of the masking convention.
 */
export default function SettingsOps({ slug }) {
  const [payload, setPayload] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    setPayload(null);
    setErrMsg(null);
    getSettings(slug)
      .then(setPayload)
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's settings.",
      ));
  }, [slug]);

  if (errMsg) {
    return <Card pad={18}><div style={{ fontSize: 13, color: C.ink2 }}>{errMsg}</div></Card>;
  }

  if (!payload) {
    return <Card pad={18}><div style={{ fontSize: 13, color: C.ink3 }}>Loading settings…</div></Card>;
  }

  const settings = payload.settings || {};
  const enabled = settings.enabled_modules ?? null; // null = all on by default
  const integrations = settings.integrations || {};
  const isOn = (m) => enabled === null || enabled.includes(m);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card pad={18}>
        <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Modules</div>
        <div style={{ fontSize: 12, color: C.ink3, marginBottom: 12 }}>
          {enabled === null ? 'No explicit list set — every module is on by default.' : 'Explicit module list set by the hospital.'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
          {ALL_MODULES.map((m) => (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: isOn(m) ? C.emerald + '0d' : C.surface2, border: `1px solid ${isOn(m) ? C.emerald + '33' : C.border}` }}>
              {isOn(m)
                ? <ToggleRight size={17} color={C.emerald} style={{ flexShrink: 0 }} />
                : <ToggleLeft size={17} color={C.ink3} style={{ flexShrink: 0 }} />}
              <span style={{ fontSize: 12.5, fontWeight: 600, color: isOn(m) ? C.ink : C.ink3 }}>
                {m === 'hmo' ? 'HMO' : titleCase(m)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card pad={18}>
        <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plug size={16} color={C.violet} /> Integrations
        </div>
        {Object.keys(integrations).length === 0 && (
          <div style={{ fontSize: 12.5, color: C.ink3 }}>No integrations configured.</div>
        )}
        {Object.entries(integrations).map(([module, cfg]) => (
          <div key={module} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '10px 0', borderTop: `1px solid ${C.borderSoft}` }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.ink, minWidth: 90 }}>{titleCase(module)}</span>
            <Badge color={cfg.enabled ? C.emerald : C.ink3} bg={(cfg.enabled ? C.emerald : C.ink3) + '14'} dot>
              {cfg.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            {cfg.url && <span style={{ fontFamily: FONT.mono, fontSize: 11.5, color: C.ink2 }}>{cfg.url}</span>}
            {/* Masked server-side — the console never holds a live credential. */}
            {cfg.token_set && <span style={{ fontFamily: FONT.mono, fontSize: 11.5, color: C.ink3 }}>token {cfg.token}</span>}
            {(cfg.events || []).map((e) => <Badge key={e} color={C.violet} bg={C.violet + '14'}>{e}</Badge>)}
          </div>
        ))}
      </Card>
    </div>
  );
}
