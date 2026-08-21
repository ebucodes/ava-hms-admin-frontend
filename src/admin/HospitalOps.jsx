'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { td } from '@/src/components/ui/styles.js';
import TableShell from '@/src/components/data/TableShell.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { STATUS_COLOR } from '@/src/admin/StatTiles.jsx';
import { upper, titleCase } from '@/src/lib/format.js';
import { ApiError } from '@/src/lib/api/client.js';
import AddPatientModal from '@/src/admin/AddPatientModal.jsx';
import Pagination from '@/src/components/ui/Pagination.jsx';
import {
  listPatients, listStaff, listQueue, listOrders, listStock, listBills, listLabWorklist, listPayers,
  listAdmissions, listMarOrders, listJournalEntries, listRoles, listSyncNodes, listSyncConflicts,
  listAuditLogs,
} from '@/src/lib/api/tenant.js';
import AnalyticsOps from '@/src/admin/AnalyticsOps.jsx';
import SettingsOps from '@/src/admin/SettingsOps.jsx';

function statusCell(status) {
  const color = STATUS_COLOR[status] || C.violet;
  return <Badge color={color} bg={color + '14'} dot>{upper(status)}</Badge>;
}
const patientName = (r) => r?.patient?.full_name || r?.patient_name || r?.patient?.name || '—';
const money = (v) => (v == null || v === '' ? '—' : `₦${Number(v).toLocaleString()}`);

/** Config per operation: fetcher, columns, and a defensive read-only row. */
const OPS = {
  patients: {
    title: 'Patients', cols: ['Patient', 'Contact', 'Gender', 'Status'], fetch: listPatients, canAdd: true,
    row: (p) => (
      <tr key={p.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{p.full_name || p.name || '—'}</div><div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{p.patient_number || ''}</div></td>
        <td style={td}>{p.phone || '—'}</td>
        <td style={td}>{titleCase(p.gender) || '—'}</td>
        <td style={td}>{statusCell(p.status)}</td>
      </tr>
    ),
  },
  staff: {
    title: 'Staff & Roles', cols: ['Name', 'Email', 'Roles', 'Status'], fetch: listStaff,
    row: (u) => (
      <tr key={u.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{u.name}</div></td>
        <td style={td}>{u.email}</td>
        <td style={td}><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(u.roles || []).map((r) => <Badge key={r.id || r} color={C.violet} bg={C.violet + '14'}>{r.label || titleCase(r.name || r)}</Badge>)}</div></td>
        <td style={td}>{statusCell(u.status)}</td>
      </tr>
    ),
  },
  queue: {
    title: 'Front-desk Queue', cols: ['Patient', 'Facility', 'Status'], fetch: listQueue,
    row: (q) => (
      <tr key={q.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{q.encounter?.patient?.full_name || '—'}</div></td>
        <td style={td}>{q.encounter?.facility?.name || '—'}</td>
        <td style={td}>{statusCell(q.status)}</td>
      </tr>
    ),
  },
  clinical: {
    title: 'Clinical Orders', cols: ['Order', 'Type', 'Patient', 'Priority', 'Status'], fetch: listOrders,
    row: (o) => (
      <tr key={o.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{o.item || '—'}</div>{o.result_notes && <div style={{ fontSize: 11, color: C.ink3 }}>{o.result_notes}</div>}</td>
        <td style={td}><Badge color={C.violet} bg={C.violet + '14'}>{upper(o.type)}</Badge></td>
        <td style={td}>{patientName(o)}</td>
        <td style={td}>{o.priority ? `P${o.priority}` : '—'}</td>
        <td style={td}>{statusCell(o.status)}</td>
      </tr>
    ),
  },
  pharmacy: {
    title: 'Pharmacy Stock', cols: ['Item', 'Quantity', 'Status'], fetch: listStock,
    row: (s) => (
      <tr key={s.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{s.name || s.drug_name || s.item_name || '—'}</div></td>
        <td style={td}>{s.quantity ?? s.on_hand ?? s.stock ?? '—'}</td>
        <td style={td}>{statusCell(s.status)}</td>
      </tr>
    ),
  },
  billing: {
    title: 'Bills', cols: ['Bill', 'Patient', 'Total', 'Status'], fetch: listBills,
    row: (b) => (
      <tr key={b.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{b.bill_number || b.number || b.reference || '—'}</div></td>
        <td style={td}>{patientName(b)}</td>
        <td style={td}>{money(b.total ?? b.total_amount ?? b.amount)}</td>
        <td style={td}>{statusCell(b.status)}</td>
      </tr>
    ),
  },
  lab: {
    title: 'Lab Worklist', cols: ['Test', 'Patient', 'Status'], fetch: listLabWorklist,
    row: (o) => (
      <tr key={o.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{o.test?.name || o.test_name || o.name || '—'}</div></td>
        <td style={td}>{patientName(o)}</td>
        <td style={td}>{statusCell(o.status)}</td>
      </tr>
    ),
  },
  hmo: {
    title: 'Payers (HMO)', cols: ['Payer', 'Type', 'Status'], fetch: listPayers,
    row: (p) => (
      <tr key={p.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{p.name || '—'}</div></td>
        <td style={td}>{titleCase(p.type || p.payer_type) || '—'}</td>
        <td style={td}>{statusCell(p.status)}</td>
      </tr>
    ),
  },
  ward: {
    title: 'Admissions (Ward)', cols: ['Admission', 'Patient', 'Ward category', 'Bed', 'Status'], fetch: listAdmissions,
    row: (a) => (
      <tr key={a.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{a.admission_number || '—'}</div></td>
        <td style={td}>{patientName(a)}</td>
        <td style={td}>{titleCase(a.recommended_ward_category) || '—'}</td>
        <td style={td}>{a.bed?.bed_number || '—'}</td>
        <td style={td}>{statusCell(a.status)}</td>
      </tr>
    ),
  },
  drugchart: {
    title: 'Drug Chart (MAR)', cols: ['Drug', 'Patient', 'Frequency', 'Verified', 'Status'], fetch: listMarOrders,
    row: (o) => (
      <tr key={o.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{o.drug_name || '—'}</div>{o.dosage && <div style={{ fontSize: 11, color: C.ink3 }}>{o.dosage}</div>}</td>
        <td style={td}>{patientName(o) !== '—' ? patientName(o) : (o.admission?.patient?.full_name || '—')}</td>
        <td style={td}>{o.frequency || '—'}</td>
        <td style={td}>{o.is_verified
          ? <Badge color={C.emerald} bg={C.emerald + '14'} dot>VERIFIED</Badge>
          : <Badge color={C.ink3} bg={C.ink3 + '14'}>PENDING</Badge>}</td>
        <td style={td}>{statusCell(o.status)}</td>
      </tr>
    ),
  },
  finance: {
    title: 'General Ledger', cols: ['Entry', 'Description', 'Debits', 'Status'], fetch: listJournalEntries,
    row: (e) => (
      <tr key={e.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{e.entry_number || '—'}</div><div style={{ fontSize: 11, color: C.ink3 }}>{e.entry_date || ''}</div></td>
        <td style={td}>{e.description || '—'}</td>
        <td style={td}>{money(e.total_debit)}</td>
        <td style={td}>{statusCell(e.status)}</td>
      </tr>
    ),
  },
  roles: {
    title: 'Roles & Permissions', cols: ['Role', 'Permissions', 'Staff', 'Type'], fetch: listRoles,
    row: (r) => (
      <tr key={r.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{r.label || titleCase(r.name)}</div>{r.description && <div style={{ fontSize: 11, color: C.ink3 }}>{r.description}</div>}</td>
        <td style={td}>{Array.isArray(r.permissions) ? r.permissions.length : '—'}</td>
        <td style={td}>{r.users_count ?? '—'}</td>
        <td style={td}>{r.is_system
          ? <Badge color={C.violet} bg={C.violet + '14'}>SYSTEM</Badge>
          : <Badge color={C.blue} bg={C.blue + '14'}>CUSTOM</Badge>}</td>
      </tr>
    ),
  },
  sync: {
    title: 'Edge Nodes (Offline & Sync)', cols: ['Node', 'Branch', 'Status', 'Pending', 'Last seen'], fetch: listSyncNodes,
    row: (n) => (
      <tr key={n.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{n.name}</div><div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{n.node_key}</div></td>
        <td style={td}>{n.facility?.name || '—'}</td>
        <td style={td}>{statusCell(n.status)}{n.status === 'active' && <span style={{ fontSize: 11, color: n.online ? C.emerald : C.amber, marginLeft: 6, fontWeight: 700 }}>{n.online ? 'online' : 'offline'}</span>}</td>
        <td style={td}>{n.backlog ?? 0}</td>
        <td style={td}>{n.last_seen_at ? new Date(n.last_seen_at).toLocaleString() : '—'}</td>
      </tr>
    ),
  },
  conflicts: {
    title: 'Sync Conflicts', cols: ['Record', 'Versions', 'From', 'Status'], fetch: listSyncConflicts,
    row: (cf) => (
      <tr key={cf.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{cf.entity_label || titleCase(cf.entity_type)}</div></td>
        <td style={td}><span style={{ fontFamily: FONT.mono, fontSize: 12 }}>v{cf.base_version} → v{cf.cloud_version}</span></td>
        <td style={td}>{cf.origin_node?.name || '—'}</td>
        <td style={td}>{statusCell(cf.status)}</td>
      </tr>
    ),
  },
  audit: {
    title: 'Audit Trail', cols: ['When', 'Action', 'Actor', 'Target', 'Source'], fetch: listAuditLogs,
    // The reason this viewer exists: `acting_system_admin_id` is recorded so an action the
    // platform team took through act-as is never indistinguishable from the hospital doing
    // it themselves. This filter is how the platform reviews its own footprint.
    filters: [{ key: 'platform_only', label: 'Platform actions only', type: 'toggle' }],
    row: (l) => (
      <tr key={l.id} className="ava-row">
        <td style={td}><span style={{ fontFamily: FONT.mono, fontSize: 12 }}>{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</span></td>
        <td style={td}><Badge color={C.violet} bg={C.violet + '14'}>{upper(l.action)}</Badge></td>
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink }}>{l.actor?.name || 'System'}</div>
          {l.actor?.email && <div style={{ fontSize: 11, color: C.ink3 }}>{l.actor.email}</div>}
        </td>
        <td style={td}>
          <div>{l.target?.type ? titleCase(l.target.type) : '—'}</div>
          {l.description && <div style={{ fontSize: 11, color: C.ink3 }}>{l.description}</div>}
        </td>
        <td style={td}>{l.performed_by_platform
          ? <Badge color={C.blue} bg={C.blue + '14'} dot>PLATFORM</Badge>
          : <Badge color={C.ink3} bg={C.ink3 + '14'}>HOSPITAL</Badge>}</td>
      </tr>
    ),
  },
};

// Views that are not a paginated table — they render their own component.
const CUSTOM_OPS = { analytics: AnalyticsOps, settings: SettingsOps };

/** Viewer for a hospital's tenant data (via the act-as token). Read-only, except
 *  where an operation exposes a write action (e.g. Patients → Add patient). */
export default function HospitalOps({ slug, op }) {
  const Custom = CUSTOM_OPS[op];
  const cfg = OPS[op];
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const [adding, setAdding] = useState(false);
  // Active values for the viewer's declared `filters`, keyed by filter key. Empty
  // string means "not applied" — buildQueryString drops it rather than sending it.
  const [filters, setFilters] = useState({});

  const reload = (page = 1, active = filters) => {
    setRows(null);
    setErrMsg(null);
    cfg.fetch(slug, { page, ...active })
      .then((data) => {
        setRows(data?.items || (Array.isArray(data) ? data : []));
        setMeta(data?.pagination || null);
      })
      .catch((err) => {
        // A disabled module returns a friendly 403 message — surface it as-is.
        setErrMsg(err instanceof ApiError && err.status === 403 ? err.message : `Couldn't load this hospital's ${cfg.title.toLowerCase()}.`);
      });
  };

  useEffect(() => {
    setFilters({});
    if (cfg && !CUSTOM_OPS[op]) reload(1, {});
  }, [slug, op]); // eslint-disable-line react-hooks/exhaustive-deps

  // Applying a filter restarts at page 1 — page 3 of the unfiltered list is not
  // page 3 of the filtered one.
  const applyFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    reload(1, next);
  };

  if (Custom) return <Custom slug={slug} />;
  if (!cfg) return null;
  const loading = rows === null && !errMsg;
  const n = cfg.cols.length;

  const filterControls = (cfg.filters || []).map((f) => (
    f.type === 'toggle' ? (
      <label key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.ink2, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={!!filters[f.key]}
          onChange={(e) => applyFilter(f.key, e.target.checked ? 1 : '')}
          style={{ accentColor: C.blue, cursor: 'pointer' }}
        />
        {f.label}
      </label>
    ) : (
      <select
        key={f.key}
        value={filters[f.key] ?? ''}
        onChange={(e) => applyFilter(f.key, e.target.value)}
        style={{ padding: '6px 9px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', fontSize: 12, color: C.ink2, cursor: 'pointer' }}
      >
        <option value="">{f.label}</option>
        {(f.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    )
  ));

  const right = cfg.canAdd ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {filterControls}
      <button
        onClick={() => setAdding(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
      >
        <Plus size={14} /> Add patient
      </button>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {filterControls}
      <span style={{ fontSize: 11.5, color: C.ink3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Read only</span>
    </div>
  );

  return (
    <>
      <TableShell
        title={cfg.title}
        sub={cfg.canAdd ? 'Via act-as session' : 'Read-only · via act-as session'}
        cols={cfg.cols}
        right={right}
      >
        {loading && <tr><td style={{ ...td, color: C.ink3 }} colSpan={n}>Loading…</td></tr>}
        {errMsg && <tr><td style={{ ...td, color: C.ink2 }} colSpan={n}>{errMsg}</td></tr>}
        {!loading && !errMsg && rows.length === 0 && <tr><td style={{ ...td, color: C.ink3 }} colSpan={n}>Nothing here yet.</td></tr>}
        {!loading && !errMsg && rows.map((r) => cfg.row(r))}
      </TableShell>

      {!errMsg && <Pagination pagination={meta} onPage={(page) => reload(page)} disabled={loading} />}

      {op === 'patients' && (
        <AddPatientModal
          open={adding}
          slug={slug}
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); reload(); }}
        />
      )}
    </>
  );
}
