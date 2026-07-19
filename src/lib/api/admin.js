import {
  apiRequest,
  getAdminToken,
  setAdminToken,
  setAdminExpiry,
  clearAdminAuth,
  setToken,
  setTokenExpiry,
  setCompanySlug,
  buildQueryString,
} from "./client";

function persistAdminSession(data) {
  if (data?.access_token) {
    setAdminToken(data.access_token);
    setAdminExpiry(Date.now() + (data.expires_in || 3600) * 1000);
  }
}

// Platform system-admin auth (separate `admin` guard on the backend).
export async function adminLogin(email, password) {
  const data = await apiRequest("/api/v1/admin/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  persistAdminSession(data);
  return data;
}

export function adminProfile() {
  return apiRequest("/api/v1/admin/auth/me", { token: getAdminToken() });
}

// Platform overview — a page of hospitals (+ counts) plus platform-wide summary.
// Returns { items, pagination, summary }.
export function adminListCompanies(params = {}) {
  return apiRequest(`/api/v1/companies${buildQueryString(params)}`, { token: getAdminToken() });
}

// A single hospital (facilities + counts) for the detail view.
export function adminGetCompany(slug) {
  return apiRequest(`/api/v1/companies/${slug}`, { token: getAdminToken() });
}

// Update a hospital's core profile (name / email / phone / status).
export function adminUpdateCompany(slug, payload) {
  return apiRequest(`/api/v1/companies/${slug}`, {
    method: "POST",
    body: payload,
    token: getAdminToken(),
  });
}

// Start an "act-as" session for a hospital: mints a TENANT token so the console
// can read that hospital's phase 2–6 data. Stores the token + slug locally so
// tenantRequest() (see lib/api/tenant.js) picks it up automatically.
export async function actAs(slug) {
  const data = await apiRequest(`/api/v1/companies/${slug}/act-as`, {
    method: "POST",
    token: getAdminToken(),
  });
  if (data?.access_token) {
    setToken(data.access_token);
    setTokenExpiry(Date.now() + (data.expires_in || 3600) * 1000);
    setCompanySlug(data.company?.slug || slug);
  }
  return data;
}

export async function adminRefresh() {
  const data = await apiRequest("/api/v1/admin/auth/refresh", {
    method: "POST",
    token: getAdminToken(),
  });
  persistAdminSession(data);
  return data;
}

export async function adminLogout() {
  try {
    await apiRequest("/api/v1/admin/auth/logout", { method: "POST", token: getAdminToken() });
  } finally {
    clearAdminAuth();
  }
}

// Password reset (platform-level, no tenant). Both are unauthenticated.
export function adminForgotPassword(email) {
  return apiRequest("/api/v1/admin/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export function adminResetPassword({ email, token, password, password_confirmation }) {
  return apiRequest("/api/v1/admin/auth/reset-password", {
    method: "POST",
    body: { email, token, password, password_confirmation },
    auth: false,
  });
}
