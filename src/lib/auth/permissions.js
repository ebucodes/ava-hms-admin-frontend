import { NAV } from "@/src/data/mockData.js";

/**
 * Maps each sidebar nav id to the permission prefix that grants access to it.
 * A user sees a module if they hold ANY permission under that prefix. The system
 * Admin role resolves to the full catalog, so it sees everything.
 *
 * Prefixes mirror App\Enums\PermissionEnum on the backend.
 */
export const NAV_PERMISSION_PREFIX = {
  dashboard: "analytics.dashboards",
  frontdesk: "queue",
  patients: "patients",
  emr: "clinical",
  pharmacy: "pharmacy",
  lab: "lab",
  billing: "billing",
  ward: "ward",
  hmo: "hmo",
  supply: "pharmacy.stock",
  finance: "finance",
  analytics: "analytics",
  reports: "analytics.reports",
  facilities: "company.settings",
  users: "users",
  settings: "company.settings",
};

function permissionsOf(user) {
  return Array.isArray(user?.permissions) ? user.permissions : [];
}

/** Whether the user may see the given nav id. */
export function canSeeNav(user, id) {
  const prefix = NAV_PERMISSION_PREFIX[id];
  if (!prefix) return false;
  return permissionsOf(user).some((p) => p === prefix || p.startsWith(`${prefix}.`) || p.startsWith(prefix));
}

/** The nav items (in NAV order) the user is allowed to see. */
export function navForUser(user) {
  return NAV.filter((n) => canSeeNav(user, n.id));
}

/** The first nav id the user is permitted to land on (their default view). */
export function firstPermittedNav(user) {
  return navForUser(user)[0]?.id ?? null;
}
