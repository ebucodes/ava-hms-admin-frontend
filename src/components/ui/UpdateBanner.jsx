'use client';

import { useState } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { C, FONT, shadow } from '../../theme/tokens.js';
import { useAppUpdate } from '../../lib/useAppUpdate.js';

/**
 * Bottom-centred notice shown when a newer build has been deployed while this tab was
 * open, replacing "please hard-reload" as a support instruction.
 *
 * Deliberately NOT routed through ToastProvider: those are transient, auto-dismissing
 * and bottom-RIGHT, and this one has to persist until the user acts on it. It also
 * sits above the toast stack's z-index so a burst of toasts cannot bury it.
 *
 * Dismiss hides it for this tab only. It is not a "never show again" — the tab really
 * is running stale code, so the next full load surfaces it again if still relevant.
 */
function UpdateBanner() {
  const updateReady = useAppUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateReady || dismissed) return null;

  return (
    // Centred by a full-width flex row rather than translateX(-50%): the .ava-rise
    // keyframe animates `transform`, which would overwrite the centering mid-animation
    // and slide the notice out of place. The row itself ignores pointer events so it
    // cannot swallow clicks on whatever sits behind it.
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 0,
        right: 0,
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        pointerEvents: 'none',
      }}
    >
      <div
        role="status"
        aria-live="polite"
        className="ava-rise"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 14px 12px 18px',
          borderRadius: 14,
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: shadow.pop,
          maxWidth: '100%',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 9, background: C.violetSoft,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}
        >
          <Sparkles size={16} color={C.violet} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, fontFamily: FONT.body }}>
            A new version of AVA HMS is available
          </div>
          <div style={{ fontSize: 12, color: C.ink3, marginTop: 1 }}>
            Reload to get the latest updates.
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
            borderRadius: 9, border: 'none', background: C.blue, color: '#fff',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <RefreshCw size={13} /> Reload
        </button>

        <button
          onClick={() => setDismissed(true)}
          title="Dismiss"
          aria-label="Dismiss update notice"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            display: 'grid', placeItems: 'center', color: C.ink3, flexShrink: 0,
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default UpdateBanner;
