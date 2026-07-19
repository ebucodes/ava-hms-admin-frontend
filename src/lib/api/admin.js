import {
  apiRequest,
  getAdminToken,
  setAdminToken,
  setAdminExpiry,
  clearAdminAuth,
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
