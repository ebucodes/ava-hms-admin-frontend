'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import Modal from '@/src/components/ui/Modal.jsx';

const ConfirmContext = createContext(null);

/**
 * Promise-based confirmation gate for the admin console. Wrap the app once with
 * <ConfirmProvider>, then in any action:
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title, message, confirmLabel, tone: 'danger' }))) return;
 *
 * Resolves true when confirmed, false when cancelled/dismissed.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { options, resolve }

  const confirm = useCallback(
    (options = {}) => new Promise((resolve) => setState({ options, resolve })),
    [],
  );

  const settle = (result) => {
    setState((s) => {
      s?.resolve(result);
      return null;
    });
  };

  const o = state?.options || {};
  const danger = o.tone === 'danger';
  const warning = o.tone === 'warning';
  const accent = danger ? C.red : warning ? C.amber : C.blue;
  const confirmBg = danger ? C.red : warning ? C.amber : `linear-gradient(135deg, ${C.blue}, ${C.violet})`;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!state} onClose={() => settle(false)} title={o.title || 'Are you sure?'} width={o.width || 440}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: accent + '14', display: 'grid', placeItems: 'center' }}>
            <AlertTriangle size={19} color={accent} />
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: C.ink2, lineHeight: 1.55 }}>
            {o.message || 'Please confirm you want to proceed with this action.'}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button
            onClick={() => settle(false)}
            style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.ink, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
          >
            {o.cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={() => settle(true)}
            style={{
              padding: '9px 18px', borderRadius: 10, border: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#fff',
              fontFamily: FONT.body, background: confirmBg,
            }}
          >
            {o.confirmLabel || 'Confirm'}
          </button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
