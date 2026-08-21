'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { C, FONT } from '@/src/theme/tokens.js';
import { td } from '@/src/components/ui/styles.js';
import TableShell from '@/src/components/data/TableShell.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { upper, titleCase, money } from '@/src/lib/format.js';
import StatusPill from '@/src/components/ui/StatusPill.jsx';
import { ApiError } from '@/src/lib/api/client.js';
import AddPatientModal from '@/src/admin/AddPatientModal.jsx';
import Pagination from '@/src/components/ui/Pagination.jsx';
import {
  listPatients, listStaff, listQueue, listOrders, listStock, listBills, listLabWorklist, listPayers,
  listAdmissions, listMarOrders, listJournalEntries, listRoles, listSyncNodes, listSyncConflicts,
  listAuditLogs, listAuthorizations, listTariffs, listPayerInvoices, listDunning,
  listPettyCash, budgetUtilisation, listSpecimens, listLabTests, listDispensingQueue,
  listBedBottlenecks, listOverdueDoses, listSyncBatches, listMpiAliases, syncCatalog,
  listBillingTokens,
} from '@/src/lib/api/tenant.js';
import AnalyticsOps from '@/src/admin/AnalyticsOps.jsx';
import FacilitiesOps from '@/src/admin/FacilitiesOps.jsx';
import LedgerHealthOps from '@/src/admin/LedgerHealthOps.jsx';
import ProfitLossOps from '@/src/admin/ProfitLossOps.jsx';
import ReceivablesAgingOps from '@/src/admin/ReceivablesAgingOps.jsx';
import BedCensusOps from '@/src/admin/BedCensusOps.jsx';
import MpiCandidatesOps from '@/src/admin/MpiCandidatesOps.jsx';
import SettingsOps from '@/src/admin/SettingsOps.jsx';

const statusCell = (status) => <StatusPill status={status} />;
const patientName = (r) => r?.patient?.full_name || r?.patient_name || r?.patient?.name || '—';

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
  // ---- HMO ----
  preauth: {
    title: 'Pre-authorisation Queue', cols: ['Item', 'Patient', 'Payer', 'Estimate', 'Status'], fetch: listAuthorizations,
    // Pending is the default because this feed exists to show the bottleneck — an
    // authorisation nobody has decided is what holds a patient at the desk.
    filters: [{ key: 'status', label: 'All decisions', type: 'select', default: 'pending', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved_hmo', label: 'Approved (HMO)' },
      { value: 'approved_internal', label: 'Approved (internal override)' },
      { value: 'deferred', label: 'Deferred' },
      { value: 'denied', label: 'Denied' },
      { value: 'excluded', label: 'Excluded' },
    ] }],
    row: (a) => (
      <tr key={a.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink }}>{a.description || a.item_code || '—'}</div>
          <div style={{ fontSize: 11, color: C.ink3 }}>{titleCase(a.item_type)}{a.is_blocking ? ' · blocking' : ''}</div>
        </td>
        <td style={td}>{a.patient?.full_name || '—'}</td>
        <td style={td}>{a.payer?.name || '—'}</td>
        <td style={td}>{money(a.estimated_amount)}</td>
        <td style={td}>{statusCell(a.status)}</td>
      </tr>
    ),
  },
  tariffs: {
    title: 'Tariffs & Price Books', cols: ['Item', 'Payer', 'Class', 'Price', 'Status'], fetch: listTariffs,
    // Contract-confidential by design (PRD 7.6): only admin-level permissions reach this,
    // which is why front desk sees payers but never their negotiated prices.
    row: (t) => (
      <tr key={t.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink }}>{t.description || t.item_code || '—'}</div>
          <div style={{ fontSize: 11, color: C.ink3 }}>{titleCase(t.item_type)}{t.requires_authorization ? ' · needs pre-auth' : ''}{t.is_excluded ? ' · excluded' : ''}</div>
        </td>
        <td style={td}>{t.payer?.name || '—'}</td>
        <td style={td}>{titleCase(t.item_class) || '—'}</td>
        <td style={td}>{money(t.price)}{t.discount_percent ? <span style={{ fontSize: 11, color: C.ink3 }}> −{t.discount_percent}%</span> : null}</td>
        <td style={td}>{statusCell(t.status)}</td>
      </tr>
    ),
  },

  // ---- Finance ----
  invoices: {
    title: 'Payer Invoices', cols: ['Invoice', 'Payer', 'Total', 'Balance', 'Status'], fetch: listPayerInvoices,
    row: (i) => (
      <tr key={i.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{i.invoice_number || '—'}</div>
          <div style={{ fontSize: 11, color: C.ink3 }}>{i.period_start} → {i.period_end}</div>
        </td>
        <td style={td}>{i.payer?.name || '—'}</td>
        <td style={td}>{money(i.total)}</td>
        <td style={td}>
          {money(i.balance)}
          {i.days_overdue > 0 && <div style={{ fontSize: 11, color: C.red, fontWeight: 700 }}>{i.days_overdue}d overdue · {i.aging_bucket}</div>}
        </td>
        <td style={td}>{statusCell(i.status)}</td>
      </tr>
    ),
  },
  dunning: {
    title: 'Dunning (Overdue Invoices)', cols: ['Invoice', 'Payer', 'Due', 'Balance', 'Status'], fetch: listDunning,
    row: (i) => (
      <tr key={i.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{i.invoice_number || '—'}</div></td>
        <td style={td}>{i.payer?.name || '—'}</td>
        <td style={td}>
          <div>{i.due_on || '—'}</div>
          {i.days_overdue > 0 && <div style={{ fontSize: 11, color: C.red, fontWeight: 700 }}>{i.days_overdue} days late</div>}
        </td>
        <td style={td}>{money(i.balance)}</td>
        <td style={td}>{statusCell(i.status)}</td>
      </tr>
    ),
  },
  pettycash: {
    title: 'Petty Cash', cols: ['Request', 'Purpose', 'Amount', 'Requested by', 'Status'], fetch: listPettyCash,
    row: (r) => (
      <tr key={r.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{r.request_number || '—'}</div>
          <div style={{ fontSize: 11, color: C.ink3 }}>{r.facility?.name || r.facility || ''}</div>
        </td>
        <td style={td}>{r.purpose || '—'}</td>
        <td style={td}>{money(r.amount)}</td>
        <td style={td}>{r.requested_by?.name || '—'}</td>
        <td style={td}>{statusCell(r.status)}</td>
      </tr>
    ),
  },
  budgets: {
    title: 'Budget Utilisation', cols: ['Budget', 'Period', 'Allocated', 'Utilised', 'Used'], fetch: budgetUtilisation,
    row: (b) => {
      const pct = Number(b.utilisation_percent ?? 0);
      const bar = b.over_budget ? C.red : pct >= 80 ? C.amber : C.emerald;
      return (
        <tr key={b.id} className="ava-row">
          <td style={td}>
            <div style={{ fontWeight: 700, color: C.ink }}>{b.name || '—'}</div>
            <div style={{ fontSize: 11, color: C.ink3 }}>{b.facility || 'All branches'}{b.hard_stop ? ' · hard stop' : ''}</div>
          </td>
          <td style={td}>{b.period_start} → {b.period_end}</td>
          <td style={td}>{money(b.allocated)}</td>
          <td style={td}>{money(b.utilised)}</td>
          <td style={td}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 60, height: 6, borderRadius: 4, background: C.borderSoft, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: bar }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: bar }}>{pct}%</span>
            </div>
          </td>
        </tr>
      );
    },
  },

  // ---- Laboratory ----
  specimens: {
    title: 'Specimens', cols: ['Accession', 'Patient', 'Type', 'Collected', 'Status'], fetch: listSpecimens,
    row: (s) => (
      <tr key={s.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{s.accession_number || '—'}</div>
          {s.rejection_reason && <div style={{ fontSize: 11, color: C.red }}>{s.rejection_reason}</div>}
        </td>
        <td style={td}>{patientName(s)}</td>
        <td style={td}>{titleCase(s.specimen_type) || '—'}</td>
        <td style={td}>{s.collected_at ? new Date(s.collected_at).toLocaleString() : '—'}</td>
        <td style={td}>{statusCell(s.status)}</td>
      </tr>
    ),
  },
  labtests: {
    title: 'Test Catalog', cols: ['Code', 'Test', 'Specimen', 'Analytes', 'Price', 'Status'], fetch: listLabTests,
    row: (t) => (
      <tr key={t.id} className="ava-row">
        <td style={td}><span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: C.ink }}>{t.code || '—'}</span></td>
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{t.name || '—'}</div></td>
        <td style={td}>{titleCase(t.specimen_type) || '—'}</td>
        <td style={td}>{Array.isArray(t.analytes) ? t.analytes.length : '—'}</td>
        <td style={td}>{money(t.price)}</td>
        <td style={td}>{statusCell(t.status)}</td>
      </tr>
    ),
  },

  // ---- Pharmacy ----
  dispensing: {
    title: 'Dispensing Queue', cols: ['Prescription', 'Prescriber', 'Items', 'Raised', 'Status'], fetch: listDispensingQueue,
    // PrescriptionResource carries patient_id but no patient object, so this shows the
    // prescription rather than inventing a name the API never sent.
    row: (p) => (
      <tr key={p.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono }}>{String(p.id).slice(0, 8)}</div>
          {p.notes && <div style={{ fontSize: 11, color: C.ink3 }}>{p.notes}</div>}
        </td>
        <td style={td}>{p.prescriber?.name || '—'}</td>
        <td style={td}>{Array.isArray(p.items) ? p.items.length : '—'}</td>
        <td style={td}>{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</td>
        <td style={td}>{statusCell(p.status)}</td>
      </tr>
    ),
  },

  // ---- Ward ----
  bottlenecks: {
    title: 'Bed Bottlenecks', cols: ['Bed', 'Ward', 'Stuck since', 'Waiting', 'Status'], fetch: listBedBottlenecks,
    row: (b) => (
      <tr key={b.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink }}>{b.bed_number || '—'}</div>
          {b.room_number && <div style={{ fontSize: 11, color: C.ink3 }}>Room {b.room_number}</div>}
        </td>
        <td style={td}>{b.ward?.name || '—'}</td>
        <td style={td}>{b.status_changed_at ? new Date(b.status_changed_at).toLocaleString() : '—'}</td>
        <td style={td}>
          {b.turnover_minutes != null
            ? <span style={{ fontWeight: 700, color: C.amber }}>{b.turnover_minutes} min</span>
            : '—'}
        </td>
        <td style={td}>{statusCell(b.status)}</td>
      </tr>
    ),
  },
  overduedoses: {
    title: 'Overdue Doses (MAR)', cols: ['Drug', 'Scheduled', 'Overdue by', 'Admission', 'Status'], fetch: listOverdueDoses,
    row: (d) => (
      <tr key={d.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{d.order?.drug_name || '—'}</div></td>
        <td style={td}>{d.scheduled_at ? new Date(d.scheduled_at).toLocaleString() : '—'}</td>
        <td style={td}>
          {d.overdue_minutes != null
            ? <span style={{ fontWeight: 700, color: C.red }}>{d.overdue_minutes} min</span>
            : '—'}
        </td>
        <td style={td}>{d.admission?.admission_number || '—'}</td>
        <td style={td}>{statusCell(d.status)}</td>
      </tr>
    ),
  },

  // ---- Offline & Sync ----
  batches: {
    title: 'Sync Batches', cols: ['Batch', 'Node', 'Direction', 'Changes', 'Status'], fetch: listSyncBatches,
    row: (b) => (
      <tr key={b.id} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink, fontFamily: FONT.mono, fontSize: 12 }}>{String(b.batch_uuid || '').slice(0, 8) || '—'}</div>
          {b.error && <div style={{ fontSize: 11, color: C.red }}>{b.error}</div>}
        </td>
        <td style={td}>{b.node?.name || '—'}</td>
        <td style={td}><Badge color={C.violet} bg={C.violet + '14'}>{upper(b.direction)}</Badge></td>
        <td style={td}>
          <span>{b.applied_count ?? 0}/{b.change_count ?? 0} applied</span>
          {(b.conflict_count > 0 || b.rejected_count > 0) && (
            <div style={{ fontSize: 11, color: C.amber, fontWeight: 700 }}>
              {b.conflict_count || 0} conflicts · {b.rejected_count || 0} rejected
            </div>
          )}
        </td>
        <td style={td}>{statusCell(b.status)}</td>
      </tr>
    ),
  },
  aliases: {
    title: 'MPI Aliases (Merged Records)', cols: ['Merged record', 'Survivor', 'Reason', 'Merged by', 'When'], fetch: listMpiAliases,
    row: (a) => (
      <tr key={a.id} className="ava-row">
        <td style={td}><span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: C.ink }}>{a.alias_patient_number || '—'}</span></td>
        <td style={td}>{a.patient?.full_name || '—'}</td>
        <td style={td}>{titleCase(a.match_reason) || '—'}</td>
        <td style={td}>{a.merged_by?.name || '—'}</td>
        <td style={td}>{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</td>
      </tr>
    ),
  },
  catalog: {
    title: 'Sync Catalog (Whitelist)', cols: ['Entity', 'Module', 'Conflict policy', 'Push', 'Columns'], fetch: syncCatalog,
    // This one names its collection `entities`, not `items`.
    pick: (d) => d?.entities || [],
    // The whitelist IS the safety boundary: an entity absent here cannot be pushed by an
    // edge node at all, so this view answers "what can a node actually write offline?".
    row: (e) => (
      <tr key={e.entity_type} className="ava-row">
        <td style={td}>
          <div style={{ fontWeight: 700, color: C.ink }}>{e.label || titleCase(e.entity_type)}</div>
          <div style={{ fontSize: 11, color: C.ink3, fontFamily: FONT.mono }}>{e.entity_type}</div>
        </td>
        <td style={td}>{e.module === 'hmo' ? 'HMO' : titleCase(e.module)}</td>
        <td style={td}>{e.conflict_policy_label || titleCase(e.conflict_policy)}</td>
        <td style={td}>{e.accepts_push
          ? <Badge color={C.emerald} bg={C.emerald + '14'} dot>ACCEPTS PUSH</Badge>
          : <Badge color={C.ink3} bg={C.ink3 + '14'}>PULL ONLY</Badge>}
          {e.branch_scoped && <div style={{ fontSize: 11, color: C.ink3, marginTop: 3 }}>branch-scoped</div>}
        </td>
        <td style={td}>{Array.isArray(e.columns) ? e.columns.length : '—'}</td>
      </tr>
    ),
  },

  // ---- Billing ----
  tokens: {
    title: 'Offline Billing Tokens', cols: ['Token', 'Patient', 'Amount', 'Expires', 'Status'], fetch: listBillingTokens,
    row: (t) => (
      <tr key={t.id} className="ava-row">
        <td style={td}><span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: C.ink }}>{t.token_code || '—'}</span></td>
        <td style={td}>{patientName(t)}</td>
        <td style={td}>
          {t.amount_formatted || money(t.amount)}
          {t.redeemed_amount != null && <div style={{ fontSize: 11, color: C.ink3 }}>redeemed {money(t.redeemed_amount)}</div>}
        </td>
        <td style={td}>
          {t.expires_at ? new Date(t.expires_at).toLocaleString() : '—'}
          {/* is_expired is DERIVED server-side from expires_at — there is no `expired`
              status case, so the pill alone would read `active` past expiry. */}
          {t.is_expired && <div style={{ fontSize: 11, color: C.red, fontWeight: 700 }}>expired</div>}
        </td>
        <td style={td}>{statusCell(t.status)}</td>
      </tr>
    ),
  },
};

// Views that are not a paginated table — they render their own component.
const CUSTOM_OPS = {
  analytics: AnalyticsOps,
  settings: SettingsOps,
  facilities: FacilitiesOps,
  ledger: LedgerHealthOps,
  pnl: ProfitLossOps,
  aging: ReceivablesAgingOps,
  census: BedCensusOps,
  mpi: MpiCandidatesOps,
};

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
        // Most endpoints return { items, pagination } and several return a flat array —
        // `pick` covers the handful that name their collection something else.
        const list = cfg.pick ? cfg.pick(data) : (data?.items || (Array.isArray(data) ? data : []));
        setRows(Array.isArray(list) ? list : []);
        setMeta(data?.pagination || null);
      })
      .catch((err) => {
        // A disabled module returns a friendly 403 message — surface it as-is.
        setErrMsg(err instanceof ApiError && err.status === 403 ? err.message : `Couldn't load this hospital's ${cfg.title.toLowerCase()}.`);
      });
  };

  useEffect(() => {
    // A filter's `default` is the single source of truth for the opening query, so the
    // control always shows what the table is actually filtered by.
    const initial = Object.fromEntries(
      (cfg?.filters || []).filter((f) => f.default !== undefined).map((f) => [f.key, f.default]),
    );
    setFilters(initial);
    if (cfg && !CUSTOM_OPS[op]) reload(1, initial);
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
