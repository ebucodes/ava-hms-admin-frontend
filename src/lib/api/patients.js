import { tenantRequest, buildQueryString } from "./client";

export function listPatients(slug, params = {}) {
  return tenantRequest(slug, `/patients${buildQueryString({ per_page: 15, ...params })}`);
}

export function registerPatient(slug, payload) {
  return tenantRequest(slug, "/patients", { method: "POST", body: payload });
}

export function getPatient(slug, patientId) {
  return tenantRequest(slug, `/patients/${patientId}`);
}

export function updatePatient(slug, patientId, payload) {
  return tenantRequest(slug, `/patients/${patientId}`, { method: "POST", body: payload });
}

export function checkInPatient(slug, patientId, payload) {
  return tenantRequest(slug, `/patients/${patientId}/check-in`, { method: "POST", body: payload });
}
