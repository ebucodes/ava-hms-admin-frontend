'use client';

import { useEffect, useState } from 'react';
import { ToggleRight, ToggleLeft, Plug } from 'lucide-react';
import { C, FONT, alpha } from '@/src/theme/tokens.js';
import Card from '@/src/components/ui/Card.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import { getSettings } from '@/src/lib/api/tenant.js';
import { titleCase } from '@/src/lib/format.js';

// No local module list. The one that lived here claimed to mirror ModuleEnum and did
// not: it omitted `supply`, so a hospital running Supply Chain appeared in this console
// not to have the module at all. The list now arrives with the settings payload
// (ModuleEnum::catalog) along with the hospital's resolved enabled set.

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
  // `settings.enabled_modules` is the raw stored value and may be absent; the top-level
  // `enabled_modules` has the "absent means all on" rule already applied server-side.
  const explicit = settings.enabled_modules ?? null;
  const enabled = payload.enabled_modules || [];
  const catalog = payload.module_catalog || [];
  const integrations = settings.integrations || {};
  const isOn = (m) => enabled.includes(m);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card pad={18}>
        <div style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Modules</div>
        <div style={{ fontSize: 12, color: C.ink3, marginBottom: 12 }}>
          {explicit === null ? 'No explicit list set — every module is on by default.' : 'Explicit module list set by the hospital.'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
          {/* alpha(), not string concatenation: the tokens are `var(--ava-*)` strings, so
              appending a hex alpha byte produced the literal "var(--ava-emerald)0d" and
              the whole tint was dropped as invalid. */}
          {catalog.map(({ value, label }) => (
            <div key={value} title={value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: isOn(value) ? alpha(C.emerald, 5) : C.surface2, border: `1px solid ${isOn(value) ? alpha(C.emerald, 20) : C.border}` }}>
              {isOn(value)
                ? <ToggleRight size={17} color={C.emerald} style={{ flexShrink: 0 }} />
                : <ToggleLeft size={17} color={C.ink3} style={{ flexShrink: 0 }} />}
              {/* The label is the server's too, so the console and the hospital's own
                  Settings screen call each module the same thing. */}
              <span style={{ fontSize: 12.5, fontWeight: 600, color: isOn(value) ? C.ink : C.ink3 }}>{label}</span>
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
            {(cfg.events || []).map((e) => <Badge key={e} color={C.violet} bg={alpha(C.violet, 8)}>{e}</Badge>)}
          </div>
        ))}
      </Card>
    </div>
  );
}
