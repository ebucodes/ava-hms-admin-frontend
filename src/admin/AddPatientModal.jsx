'use client';

import { useState } from 'react';
import { C } from '@/src/theme/tokens.js';
import Modal from '@/src/components/ui/Modal.jsx';
import { FormField, TextInput, SelectInput } from '@/src/components/ui/FormField.jsx';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { useConfirm } from '@/src/components/ui/Confirm.jsx';
import { registerPatient } from '@/src/lib/api/tenant.js';
import { ApiError } from '@/src/lib/api/client.js';

const EMPTY = { first_name: '', last_name: '', gender: '', phone: '', email: '' };

/** Register a patient for a hospital, via the active act-as session. */
export default function AddPatientModal({ open, slug, onClose, onSaved }) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const ok = await confirm({
      title: 'Register patient?',
      message: `Add ${form.first_name || 'this patient'} ${form.last_name || ''} to this hospital's records?`,
      confirmLabel: 'Register',
    });
    if (!ok) return;
    setErrors({});
    setSaving(true);
    try {
      await registerPatient(slug, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        gender: form.gender || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      });
      showToast('Patient registered', 'success', 2500);
      setForm(EMPTY);
      onSaved?.();
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors) {
        setErrors(Object.fromEntries(Object.entries(err.data.errors).map(([k, v]) => [k, v[0]])));
      }
      showToast(err instanceof ApiError ? err.message : 'Could not register patient.', 'error', 4000);
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add patient" sub="Registered on the hospital's behalf">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <FormField label="First name" error={errors.first_name}><TextInput value={form.first_name} onChange={set('first_name')} required /></FormField>
          <FormField label="Last name" error={errors.last_name}><TextInput value={form.last_name} onChange={set('last_name')} required /></FormField>
        </div>
        <FormField label="Gender" error={errors.gender}>
          <SelectInput value={form.gender} onChange={set('gender')}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </SelectInput>
        </FormField>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <FormField label="Phone" error={errors.phone}><TextInput value={form.phone} onChange={set('phone')} placeholder="+234…" /></FormField>
          <FormField label="Email" error={errors.email}><TextInput type="email" value={form.email} onChange={set('email')} placeholder="patient@email.com" /></FormField>
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: 4, padding: '11px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Register patient'}
        </button>
      </form>
    </Modal>
  );
}
