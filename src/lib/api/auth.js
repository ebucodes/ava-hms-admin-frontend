import {
  apiRequest,
  tenantRequest,
  setToken,
  setCompanySlug,
  setTokenExpiry,
  applyRememberPreference,
  clearAuthStorage,
} from "./client";

function persistSession(data) {
  if (data?.access_token) {
    setToken(data.access_token);
    setTokenExpiry(Date.now() + (data.expires_in || 3600) * 1000);
  }
}

export async function login(slug, { email, password }, remember = true) {
  const data = await tenantRequest(slug, "/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  // Set the storage target (and wipe any stale session) BEFORE persisting, so
  // token/expiry land in the chosen storage. The slug is remembered ONLY so a
  // bare "/" can redirect a returning user back to /{slug} — API calls always
  // take the slug from the URL, never from storage.
  applyRememberPreference(remember);
  setCompanySlug(slug);
  persistSession(data);
  return data;
}

export function getProfile(slug) {
  return tenantRequest(slug, "/auth/me");
}

export async function refreshToken(slug) {
  const data = await tenantRequest(slug, "/auth/refresh", { method: "POST" });
  persistSession(data);
  return data;
}

export async function logout(slug) {
  const data = await tenantRequest(slug, "/auth/logout", { method: "POST" });
  clearAuthStorage();
  return data;
}

// Platform-level (no tenant): email a reset link for any account matching the address.
export function forgotPassword(email) {
  return apiRequest("/api/v1/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

// Platform-level (no tenant): consume the emailed token and set a new password.
export function resetPassword({ email, token, password, password_confirmation }) {
  return apiRequest("/api/v1/auth/reset-password", {
    method: "POST",
    body: { email, token, password, password_confirmation },
    auth: false,
  });
}
