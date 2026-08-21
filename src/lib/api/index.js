/**
 * Barrel for the API layer. Complete on purpose: `tenant.js` used to be missing here,
 * which meant tenant fetchers had to be deep-imported while everything else could come
 * from the barrel — a difference that looked like a rule and wasn't.
 *
 * Deep imports (`@/src/lib/api/tenant.js`) stay perfectly valid and are what the existing
 * views use; this only means neither style is a trap.
 *
 * Re-exporting admin and tenant calls side by side does NOT soften the privilege
 * boundary between them: that boundary is the token each function sends (`getAdminToken()`
 * for platform calls, the act-as tenant token for `tenantRequest`) and the separate
 * localStorage keys they live in — not which file the import came from.
 */
export * from "./client";
export * from "./admin";
export * from "./companies";
export * from "./tenant";
