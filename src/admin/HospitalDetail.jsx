'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft, Building2, Save, Power, PowerOff, ChevronRight,
  UserRound, Users, ClipboardList, Stethoscope, Pill, Receipt, FlaskConical, ShieldCheck,
} from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { useToast } from '@/src/components/ui/Toast.jsx';
import Card from '@/src/components/ui/Card.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { FormField, TextInput } from '@/src/components/ui/FormField.jsx';
import { STATUS_COLOR } from '@/src/admin/StatTiles.jsx';
import HospitalOps from '@/src/admin/HospitalOps.jsx';
import { upper } from '@/src/lib/format.js';
import { adminGetCompany, adminUpdateCompany, actAs } from '@/src/lib/api/admin.js';
import { ApiError } from '@/src/lib/api/client.js';

// Operational CTAs. `op` set → read-only view is wired; otherwise coming soon.
const CTAS = [
  { id: 'patients', label: 'Patients', icon: UserRound, op: 'patients' },
  { id: 'staff', label: 'Staff & Roles', icon: Users, op: 'staff' },
  { id: 'queue', label: 'Front Desk', icon: ClipboardList, op: 'queue' },
  { id: 'clinical', label: 'Clinical / EMR', icon: Stethoscope, op: 'clinical' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, op: 'pharmacy' },
  { id: 'billing', label: 'Billing', icon: Receipt, op: 'billing' },
  { id: 'lab', label: 'Laboratory', icon: FlaskConical, op: 'lab' },
  { id: 'hmo', label: 'HMO', icon: ShieldCheck, op: 'hmo' },
];

function statusBadge(status) {
  const color = STATUS_COLOR[status] || C.ink3;
  return <Badge color={color} bg={color + '14'} dot>{upper(status)}</Badge>;
}

/** Single-hospital detail: read the tenant, edit its profile, flip status, and
 *  launch read-only operational views (via an act-as session). */
export default function HospitalDetail({ slug, onBack, onChanged }) {
  const { showToast } = useToast();
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [busyStatus, setBusyStatus] = useState(false);
  const [op, setOp] = useState(null); // active read-only operation
  const [opBusy, setOpBusy] = useState(null); // cta id currently starting a session

  const load = () => {
    setError(false);
    adminGetCompany(slug)
      .then((res) => {
        const c = res.data || res;
        setCompany(c);
        setForm({ name: c.name || '', email: c.email || '', phone: c.phone || '' });
      })
      .catch(() => setError(true));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const apply = async (payload) => {
    const res = await adminUpdateCompany(slug, payload);
    setCompany(res.data || res);
    onChanged?.();
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apply({ name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null });
      showToast('Hospital updated', 'success', 2500);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Update failed. Please try again.', 'error', 4000);
    } finally { setSaving(false); }
  };

  const toggleStatus = async () => {
    const next = company.status === 'active' ? 'suspended' : 'active';
    setBusyStatus(true);
    try {
      await apply({ status: next });
      showToast(next === 'active' ? 'Hospital reactivated' : 'Hospital suspended', 'success', 2500);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Update failed. Please try again.', 'error', 4000);
    } finally { setBusyStatus(false); }
  };

  const openOp = async (cta) => {
    if (!cta.op) { showToast(`${cta.label} — read-only view coming soon`, 'success', 2500); return; }
    setOpBusy(cta.id);
    try {
      await actAs(slug); // mint the tenant session for this hospital
      setOp(cta.op);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not open this hospital.', 'error', 4000);
    } finally { setOpBusy(null); }
  };

  // ---- Read-only operational view (after act-as) ----
  if (op && company) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button onClick={() => setOp(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', background: 'none', border: 'none', color: C.ink3, fontSize: 13, cursor: 'pointer' }}>
          <ArrowLeft size={15} /> Back to {company.name}
        </button>
        <div style={{ fontSize: 12.5, color: C.ink3 }}>
          Viewing <strong style={{ color: C.ink }}>{company.name}</strong> · <code style={{ background: C.borderSoft, padding: '2px 6px', borderRadius: 6 }}>{company.slug}</code>
        </div>
        <HospitalOps slug={slug} op={op} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', background: 'none', border: 'none', color: C.ink3, fontSize: 13, cursor: 'pointer' }}>
        <ArrowLeft size={15} /> Back to hospitals
      </button>

      {error ? (
        <Card><div style={{ textAlign: 'center', padding: 16 }}>
          <p style={{ color: C.red, margin: '0 0 12px', fontSize: 13.5 }}>Couldn't load this hospital.</p>
          <button onClick={load} style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
        </div></Card>
      ) : !company ? (
        <div style={{ color: C.ink3, fontSize: 13.5, padding: 8 }}>Loading…</div>
      ) : (
        <>
          {/* Header */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: C.blueSoft, display: 'grid', placeItems: 'center' }}>
                <Building2 size={22} color={C.blue} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink }}>{company.name}</div>
                <div style={{ fontSize: 12.5, color: C.ink3, marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <code style={{ background: C.borderSoft, padding: '2px 6px', borderRadius: 6 }}>{company.slug}</code>
                  {statusBadge(company.status)}
                </div>
              </div>
              <button
                onClick={toggleStatus}
                disabled={busyStatus}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 10,
                  border: `1px solid ${company.status === 'active' ? C.red : C.emerald}`, background: 'transparent',
                  color: company.status === 'active' ? C.red : C.emerald, fontSize: 13, fontWeight: 600,
                  cursor: busyStatus ? 'default' : 'pointer', opacity: busyStatus ? 0.6 : 1,
                }}
              >
                {company.status === 'active' ? <PowerOff size={15} /> : <Power size={15} />}
                {company.status === 'active' ? 'Suspend' : 'Reactivate'}
              </button>
            </div>
          </Card>

          {/* Operations CTAs */}
          <Card>
            <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Operations</div>
            <div style={{ fontSize: 12, color: C.ink3, marginBottom: 14 }}>Open this hospital's records (read-only).</div>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              {CTAS.map((cta) => {
                const soon = !cta.op;
                const busy = opBusy === cta.id;
                return (
                  <button
                    key={cta.id}
                    onClick={() => openOp(cta)}
                    disabled={busy}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12,
                      border: `1px solid ${C.border}`, background: C.surface, cursor: busy ? 'default' : 'pointer',
                      textAlign: 'left', opacity: soon ? 0.62 : 1,
                    }}
                    onMouseEnter={(e) => { if (!busy) e.currentTarget.style.background = C.surface2; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: C.blueSoft, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <cta.icon size={17} color={C.blue} />
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.ink }}>{cta.label}</span>
                    {soon ? (
                      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: C.ink3, background: C.borderSoft, padding: '2px 6px', borderRadius: 6 }}>SOON</span>
                    ) : (
                      <ChevronRight size={15} color={C.ink3} />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Counts */}
          <div className="ava-grid-2" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            {[['Facilities', company.facilities_count ?? (company.facilities?.length ?? 0)], ['Staff', company.users_count ?? 0]].map(([label, value]) => (
              <Card key={label} pad={16}>
                <div style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 800, color: C.ink }}>{value}</div>
                <div style={{ fontSize: 12, color: C.ink3, marginTop: 4 }}>{label}</div>
              </Card>
            ))}
          </div>

          {/* Edit profile */}
          <Card>
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink }}>Profile</div>
              <FormField label="Hospital name"><TextInput value={form.name} onChange={set('name')} required /></FormField>
              <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <FormField label="Email"><TextInput type="email" value={form.email} onChange={set('email')} placeholder="info@hospital.com" /></FormField>
                <FormField label="Phone"><TextInput value={form.phone} onChange={set('phone')} placeholder="+234…" /></FormField>
              </div>
              <button
                type="submit"
                disabled={saving}
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
