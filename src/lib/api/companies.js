import { apiRequest, getAdminToken } from "./client";

// Onboarding is now a platform-owner action — authenticated with the admin token.
export function registerCompany(payload) {
  return apiRequest("/api/v1/companies", {
    method: "POST",
    body: payload,
    token: getAdminToken(),
  });
}
