const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TOKEN_KEY = "ava_hms_token";
const SLUG_KEY = "ava_hms_company_slug";
const EXPIRY_KEY = "ava_hms_token_expiry";
const REMEMBER_KEY = "ava_hms_remember";
const SESSION_KEYS = [TOKEN_KEY, SLUG_KEY, EXPIRY_KEY];

// Platform system-admin session — kept in its OWN localStorage keys, entirely
// separate from the tenant session above, so admin and tenant auth never mix.
const ADMIN_TOKEN_KEY = "ava_hms_admin_token";
const ADMIN_EXPIRY_KEY = "ava_hms_admin_token_expiry";

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function getAdminExpiry() {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(ADMIN_EXPIRY_KEY);
  return v ? Number(v) : null;
}

export function setAdminExpiry(expiryMs) {
  if (typeof window === "undefined") return;
  if (expiryMs) {
    window.localStorage.setItem(ADMIN_EXPIRY_KEY, String(expiryMs));
  } else {
    window.localStorage.removeItem(ADMIN_EXPIRY_KEY);
  }
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_EXPIRY_KEY);
}

// "Remember me" preference. The flag itself always lives in localStorage so it
// survives a browser restart; it decides WHERE the session (token/slug/expiry)
// is kept: localStorage (persists across restarts) vs sessionStorage (cleared
// when the browser/tab closes).
export function getRemember() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(REMEMBER_KEY) !== "false";
}

export function setRemember(remember) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
}

// The storage the current session is read from / written to.
function authStorage() {
  if (typeof window === "undefined") return null;
  return getRemember() ? window.localStorage : window.sessionStorage;
}

// Apply a new "remember" choice and wipe any stale session from BOTH storages,
// so switching modes never leaves a lingering token behind. Call this at login
// time, before persisting the new session.
export function applyRememberPreference(remember) {
  if (typeof window === "undefined") return;
  setRemember(remember);
  [window.localStorage, window.sessionStorage].forEach((store) =>
    SESSION_KEYS.forEach((key) => store.removeItem(key))
  );
}

// Clear the session from BOTH storages (used on logout / forced sign-out).
export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  [window.localStorage, window.sessionStorage].forEach((store) =>
    SESSION_KEYS.forEach((key) => store.removeItem(key))
  );
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.errors = payload?.errors || null;
  }
}

export function getToken() {
  const store = authStorage();
  return store ? store.getItem(TOKEN_KEY) : null;
}

export function setToken(token) {
  const store = authStorage();
  if (!store) return;
  if (token) {
    store.setItem(TOKEN_KEY, token);
  } else {
    store.removeItem(TOKEN_KEY);
  }
}

export function getTokenExpiry() {
  const store = authStorage();
  const v = store ? store.getItem(EXPIRY_KEY) : null;
  return v ? Number(v) : null;
}

export function setTokenExpiry(expiryMs) {
  const store = authStorage();
  if (!store) return;
  if (expiryMs) {
    store.setItem(EXPIRY_KEY, String(expiryMs));
  } else {
    store.removeItem(EXPIRY_KEY);
  }
}

export function getCompanySlug() {
  const store = authStorage();
  return store ? store.getItem(SLUG_KEY) : null;
}

export function setCompanySlug(slug) {
  const store = authStorage();
  if (!store) return;
  if (slug) {
    store.setItem(SLUG_KEY, slug);
  } else {
    store.removeItem(SLUG_KEY);
  }
}

export function buildQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// Tenant-scoped request. The slug comes from the URL (/{company}/...) and MUST
// be passed explicitly by the caller — it is no longer read from storage.
export function tenantRequest(slug, path, options = {}) {
  if (!slug) {
    throw new ApiError("Missing company slug", 0, null);
  }
  return apiRequest(`/api/v1/${slug}${path}`, options);
}

export async function apiRequest(path, { method = "GET", body, headers = {}, auth = true, token } = {}) {
  // An explicit `token` (e.g. the admin session) wins; otherwise fall back to
  // the tenant token when the call is authenticated.
  const bearer = token ?? (auth ? getToken() : null);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(json?.message || res.statusText, res.status, json);
  }

  return json && typeof json === "object" && "data" in json ? json.data : json;
}
