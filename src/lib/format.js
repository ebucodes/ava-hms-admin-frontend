/** Display formatting helpers for the admin console. */

/** UPPERCASE a value for status pills etc. */
export const upper = (s) => (s == null ? "" : String(s).toUpperCase());

/** Title Case a slug/enum value: "super_admin" → "Super Admin". */
export const titleCase = (s) =>
  s == null
    ? ""
    : String(s)
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (m) => m.toUpperCase());

/** Naira amount for display. Null/empty renders an em dash, never ₦0 — a missing
 *  figure and a zero figure mean different things on a bill. */
export const money = (v) => (v == null || v === "" ? "—" : `₦${Number(v).toLocaleString()}`);
