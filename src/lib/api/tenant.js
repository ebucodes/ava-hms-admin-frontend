import { tenantRequest, buildQueryString } from "./client";

/**
 * Read-only tenant fetchers for the admin console. They ride on the act-as
 * tenant token (see admin.js → actAs), so the admin views a hospital's own
 * phase 2–6 data through the exact tenant endpoints. Lists return `{ items }`.
 */

export function listPatients(slug, params = {}) {
  return tenantRequest(slug, `/patients${buildQueryString({ per_page: 15, ...params })}`);
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
