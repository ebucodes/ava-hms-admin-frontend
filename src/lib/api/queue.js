import { tenantRequest, buildQueryString } from "./client";

export function listQueue(slug, params = {}) {
  return tenantRequest(slug, `/queue${buildQueryString({ per_page: 50, ...params })}`);
}

export function updateQueueStatus(slug, queueItemId, status) {
  return tenantRequest(slug, `/queue/${queueItemId}/status`, { method: "POST", body: { status } });
}
