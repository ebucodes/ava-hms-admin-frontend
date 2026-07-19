'use client';

import { useEffect, useState } from 'react';
import { C, FONT } from '@/src/theme/tokens.js';
import { td } from '@/src/components/ui/styles.js';
import TableShell from '@/src/components/data/TableShell.jsx';
import Badge from '@/src/components/ui/Badge.jsx';
import { STATUS_COLOR } from '@/src/admin/StatTiles.jsx';
import { upper, titleCase } from '@/src/lib/format.js';
import { ApiError } from '@/src/lib/api/client.js';
import {
  listPatients, listStaff, listQueue, listOrders, listStock, listBills, listLabWorklist, listPayers,
} from '@/src/lib/api/tenant.js';

function statusCell(status) {
  const color = STATUS_COLOR[status] || C.violet;
  return <Badge color={color} bg={color + '14'} dot>{upper(status)}</Badge>;
}
const patientName = (r) => r?.patient?.full_name || r?.patient_name || r?.patient?.name || '—';
const money = (v) => (v == null || v === '' ? '—' : `₦${Number(v).toLocaleString()}`);

/** Config per operation: fetcher, columns, and a defensive read-only row. */
const OPS = {
  patients: {
    title: 'Patients', cols: ['Patient', 'Contact', 'Gender', 'Status'], fetch: listPatients,
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
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{patientName(q)}</div></td>
        <td style={td}>{q.facility?.name || '—'}</td>
        <td style={td}>{statusCell(q.status)}</td>
      </tr>
    ),
  },
  clinical: {
    title: 'Clinical Orders', cols: ['Order', 'Patient', 'Status'], fetch: listOrders,
    row: (o) => (
      <tr key={o.id} className="ava-row">
        <td style={td}><div style={{ fontWeight: 700, color: C.ink }}>{o.name || o.order_type || o.type || o.test_name || '—'}</div></td>
        <td style={td}>{patientName(o)}</td>
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
};

/** Read-only viewer for a hospital's tenant data (via the act-as token). */
export default function HospitalOps({ slug, op }) {
  const cfg = OPS[op];
  const [rows, setRows] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    if (!cfg) return;
    setRows(null);
    setErrMsg(null);
    cfg.fetch(slug)
      .then((data) => setRows(data?.items || (Array.isArray(data) ? data : [])))
      .catch((err) => {
        // A disabled module returns a friendly 403 message — surface it as-is.
        setErrMsg(err instanceof ApiError && err.status === 403 ? err.message : `Couldn't load this hospital's ${cfg.title.toLowerCase()}.`);
      });
  }, [slug, op]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cfg) return null;
  const loading = rows === null && !errMsg;
  const n = cfg.cols.length;

  return (
    <TableShell
      title={cfg.title}
      sub="Read-only · via act-as session"
      cols={cfg.cols}
      right={<span style={{ fontSize: 11.5, color: C.ink3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Read only</span>}
    >
      {loading && <tr><td style={{ ...td, color: C.ink3 }} colSpan={n}>Loading…</td></tr>}
      {errMsg && <tr><td style={{ ...td, color: C.ink2 }} colSpan={n}>{errMsg}</td></tr>}
      {!loading && !errMsg && rows.length === 0 && <tr><td style={{ ...td, color: C.ink3 }} colSpan={n}>Nothing here yet.</td></tr>}
      {!loading && !errMsg && rows.map((r) => cfg.row(r))}
    </TableShell>
  );
}
