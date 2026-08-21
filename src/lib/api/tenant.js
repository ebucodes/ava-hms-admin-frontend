import { tenantRequest, buildQueryString } from "./client";

/**
 * Read-only tenant fetchers for the admin console. They ride on the act-as
 * tenant token (see admin.js → actAs), so the admin views a hospital's own
 * phase 2–6 data through the exact tenant endpoints. Lists return `{ items }`.
 */

export function listPatients(slug, params = {}) {
  return tenantRequest(slug, `/patients${buildQueryString({ per_page: 15, ...params })}`);
}

// Write — register a patient for the hospital (rides the act-as token, so the
// audit trail attributes it to the system admin).
export function registerPatient(slug, payload) {
  return tenantRequest(slug, "/patients", { method: "POST", body: payload });
}

export function listStaff(slug, params = {}) {
  return tenantRequest(slug, `/users${buildQueryString({ per_page: 20, ...params })}`);
}

export function listQueue(slug, params = {}) {
  return tenantRequest(slug, `/queue${buildQueryString({ per_page: 50, ...params })}`);
}

export function listOrders(slug, params = {}) {
  return tenantRequest(slug, `/clinical/orders${buildQueryString({ per_page: 20, ...params })}`);
}

export function listStock(slug, params = {}) {
  return tenantRequest(slug, `/pharmacy/stock${buildQueryString({ per_page: 20, ...params })}`);
}

export function listBills(slug, params = {}) {
  return tenantRequest(slug, `/billing/bills${buildQueryString({ per_page: 20, ...params })}`);
}

export function listLabWorklist(slug, params = {}) {
  return tenantRequest(slug, `/lab/worklist${buildQueryString({ per_page: 20, ...params })}`);
}

export function listPayers(slug, params = {}) {
  return tenantRequest(slug, `/hmo/payers${buildQueryString({ per_page: 20, ...params })}`);
}

// ---- Phase 7–10 modules (admin parity build-out) ----

export function listAdmissions(slug, params = {}) {
  return tenantRequest(slug, `/ward/admissions${buildQueryString({ per_page: 20, ...params })}`);
}

export function wardCensus(slug) {
  return tenantRequest(slug, "/ward/beds/census");
}

export function listMarOrders(slug, params = {}) {
  return tenantRequest(slug, `/ward/mar/orders${buildQueryString({ per_page: 20, ...params })}`);
}

export function listJournalEntries(slug, params = {}) {
  return tenantRequest(slug, `/finance/ledger/entries${buildQueryString({ per_page: 20, ...params })}`);
}

export function verifyLedger(slug) {
  return tenantRequest(slug, "/finance/ledger/verify");
}

export function profitAndLoss(slug, params = {}) {
  return tenantRequest(slug, `/finance/reports/profit-loss${buildQueryString(params)}`);
}

export function listRoles(slug, params = {}) {
  return tenantRequest(slug, `/roles${buildQueryString({ per_page: 50, ...params })}`);
}

export function getSettings(slug) {
  return tenantRequest(slug, "/settings");
}

export function getDashboard(slug, key = "executive") {
  return tenantRequest(slug, `/analytics/dashboards/${key}`);
}

export function listSyncNodes(slug, params = {}) {
  return tenantRequest(slug, `/sync/nodes${buildQueryString({ per_page: 20, ...params })}`);
}

export function listSyncConflicts(slug, params = {}) {
  return tenantRequest(slug, `/sync/conflicts${buildQueryString({ per_page: 20, ...params })}`);
}

// ---- Audit trail (append-only; read-only endpoints by design) ----

export function listAuditLogs(slug, params = {}) {
  return tenantRequest(slug, `/audit-logs${buildQueryString({ per_page: 20, ...params })}`);
}
