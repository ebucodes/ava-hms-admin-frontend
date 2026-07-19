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
