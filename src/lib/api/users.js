import { tenantRequest, buildQueryString } from "./client";

export function listUsers(slug, params = {}) {
  return tenantRequest(slug, `/users${buildQueryString({ per_page: 15, ...params })}`);
}

export function createUser(slug, payload) {
  return tenantRequest(slug, "/users", { method: "POST", body: payload });
}

export function getUser(slug, userId) {
  return tenantRequest(slug, `/users/${userId}`);
}

export function updateUser(slug, userId, payload) {
  return tenantRequest(slug, `/users/${userId}`, { method: "POST", body: payload });
}

export function deleteUser(slug, userId) {
  return tenantRequest(slug, `/users/${userId}`, { method: "DELETE" });
}
