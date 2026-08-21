'use client';

import { useEffect, useState } from 'react';
import { Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { td } from '@/src/components/ui/styles.js';
import TableShell from '@/src/components/data/TableShell.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import Modal from '@/src/components/ui/Modal.jsx';
import { FormField, TextInput, SelectInput } from '@/src/components/ui/FormField.jsx';
import { useToast } from '@/src/components/ui/Toast.jsx';
import { useConfirm } from '@/src/components/ui/Confirm.jsx';
import StatusPill from '@/src/components/ui/StatusPill.jsx';
import { titleCase } from '@/src/lib/format.js';
import { ApiError } from '@/src/lib/api/client.js';
import {
  listFacilities, createFacility, updateFacility, deleteFacility,
} from '@/src/lib/api/tenant.js';

// TypeEnum::facilityTypes() on the backend.
const TYPES = ['main', 'clinic', 'sphcb', 'pharmacy', 'laboratory', 'diagnostic'];
const STATUSES = ['active', 'inactive', 'suspended'];
const EMPTY = { name: '', type: 'clinic', email: '', phone: '', address: '', status: 'active' };

const iconBtn = (color) => ({
  display: 'inline-grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8,
  border: `1px solid ${C.border}`, background: C.surface, color, cursor: 'pointer',
});

/**
 * Branch management — the console's only full CRUD surface, so it is a component
 * rather than an OPS table entry (rows carry actions, not just cells).
 *
 * The two backend invariants are surfaced rather than duplicated: promotion is a
 * single action (the API demotes the incumbent), and a refused delete renders the
 * server's own message plus the blocking counts it returns, so the console never
 * has to guess why. Re-deriving either rule here would just let it drift.
 */
export default function FacilitiesOps({ slug }) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const [editing, setEditing] = useState(null); // facility being edited, or EMPTY for a new one
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const reload = () => {
    setRows(null);
    setErrMsg(null);
    listFacilities(slug)
      .then((data) => setRows(data?.items || (Array.isArray(data) ? data : [])))
      .catch((err) => setErrMsg(
        err instanceof ApiError && err.status === 403 ? err.message : "Couldn't load this hospital's branches.",
      ));
  };

  useEffect(reload, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => { setForm(EMPTY); setErrors({}); setEditing('new'); };
  const openEdit = (f) => {
    setForm({
      name: f.name || '', type: f.type || 'clinic', email: f.email || '',
      phone: f.phone || '', address: f.address || '', status: f.status || 'active',
    });
    setErrors({});
    setEditing(f);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      type: form.type,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      status: form.status,
    };
    try {
      if (editing === 'new') {
        await createFacility(slug, payload);
        showToast('Branch created', 'success', 2500);
      } else {
        await updateFacility(slug, editing.id, payload);
        showToast('Branch updated', 'success', 2500);
      }
      setEditing(null);
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.data?.errors) {
        setErrors(Object.fromEntries(Object.entries(err.data.errors).map(([k, v]) => [k, v[0]])));
      }
      showToast(err instanceof ApiError ? err.message : 'Could not save the branch.', 'error', 4000);
    } finally { setSaving(false); }
  };

  const promote = async (f) => {
    const ok = await confirm({
      title: 'Make this the main branch?',
      message: `${f.name} becomes the main branch, and the current main is demoted. A company always has exactly one.`,
      confirmLabel: 'Promote',
    });
    if (!ok) return;
    setBusyId(f.id);
    try {
      await updateFacility(slug, f.id, { is_main: true });
      showToast(`${f.name} is now the main branch`, 'success', 2500);
      reload();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not promote the branch.', 'error', 4000);
    } finally { setBusyId(null); }
  };

  const remove = async (f) => {
    const ok = await confirm({
      title: 'Remove branch?',
      message: `${f.name} will be removed from this hospital. Branches with staff, patients or other records attached cannot be removed.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!ok) return;
    setBusyId(f.id);
    try {
      await deleteFacility(slug, f.id);
      showToast('Branch removed', 'success', 2500);
      reload();
    } catch (err) {
      // The API returns WHY, and for an in-use branch also WHAT is blocking it —
      // far more useful than "could not delete".
      const blocking = err instanceof ApiError && err.data?.dependents
        ? ' (' + Object.entries(err.data.dependents).map(([k, n]) => `${n} ${titleCase(k).toLowerCase()}`).join(', ') + ')'
        : '';
      showToast((err instanceof ApiError ? err.message : 'Could not remove the branch.') + blocking, 'error', 6000);
    } finally { setBusyId(null); }
  };

  const cols = ['Branch', 'Type', 'Contact', 'Status', ''];
  const loading = rows === null && !errMsg;

  const right = (
    <button
      onClick={openNew}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
    >
      <Plus size={14} /> Add branch
    </button>
  );

  return (
    <>
      <TableShell title="Branches" sub="Via act-as session" cols={cols} right={right}>
        {loading && <tr><td style={{ ...td, color: C.ink3 }} colSpan={cols.length}>Loading…</td></tr>}
        {errMsg && <tr><td style={{ ...td, color: C.ink2 }} colSpan={cols.length}>{errMsg}</td></tr>}
        {!loading && !errMsg && rows.length === 0 && <tr><td style={{ ...td, color: C.ink3 }} colSpan={cols.length}>No branches yet.</td></tr>}
        {!loading && !errMsg && rows.map((f) => (
            <tr key={f.id} className="ava-row">
              <td style={td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontWeight: 700, color: C.ink }}>{f.name}</span>
                  {f.is_main && <Badge color={C.amber} bg={C.amber + '14'} dot>MAIN</Badge>}
                </div>
                <div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{f.slug}</div>
                {f.address && <div style={{ fontSize: 11, color: C.ink3 }}>{f.address}</div>}
              </td>
              <td style={td}>{titleCase(f.type)}</td>
              <td style={td}>
                <div>{f.phone || '—'}</div>
                {f.email && <div style={{ fontSize: 11, color: C.ink3 }}>{f.email}</div>}
              </td>
              <td style={td}><StatusPill status={f.status} /></td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {/* The main branch is promoted away, never deleted — so it offers no
                      promote and no remove, matching what the API will accept. */}
                  {!f.is_main && (
                    <button title="Make main branch" disabled={busyId === f.id} onClick={() => promote(f)} style={iconBtn(C.amber)}>
                      <Star size={14} />
                    </button>
                  )}
                  <button title="Edit branch" disabled={busyId === f.id} onClick={() => openEdit(f)} style={iconBtn(C.ink2)}>
                    <Pencil size={14} />
                  </button>
                  {!f.is_main && (
                    <button title="Remove branch" disabled={busyId === f.id} onClick={() => remove(f)} style={iconBtn(C.red)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
        ))}
      </TableShell>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add branch' : 'Edit branch'}
        sub="Changed on the hospital's behalf"
      >
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Branch name" error={errors.name}>
            <TextInput value={form.name} onChange={set('name')} required placeholder="Ikeja Annexe" />
          </FormField>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <FormField label="Type" error={errors.type}>
              <SelectInput value={form.type} onChange={set('type')}>
                {TYPES.map((t) => <option key={t} value={t}>{t === 'sphcb' ? 'SPHCB' : titleCase(t)}</option>)}
              </SelectInput>
            </FormField>
            <FormField label="Status" error={errors.status}>
              <SelectInput value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
              </SelectInput>
            </FormField>
          </div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <FormField label="Phone" error={errors.phone}><TextInput value={form.phone} onChange={set('phone')} placeholder="+234…" /></FormField>
            <FormField label="Email" error={errors.email}><TextInput type="email" value={form.email} onChange={set('email')} placeholder="branch@hospital.com" /></FormField>
          </div>
          <FormField label="Address" error={errors.address}>
            <TextInput value={form.address} onChange={set('address')} placeholder="12 Allen Avenue, Ikeja" />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            style={{ marginTop: 4, padding: '11px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : editing === 'new' ? 'Create branch' : 'Save changes'}
          </button>
        </form>
      </Modal>
    </>
  );
}
