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

/*
 * Date & time display — the single source of truth for both apps.
 *
 * Every formatter is pinned to en-GB with a 12-hour clock, deliberately: passing
 * `undefined` as the locale (which most of these call sites used to do) formats
 * against whatever the viewer's browser is set to, so the same record read
 * "19/07/2026, 14:30" on one machine and "7/19/2026, 2:30 PM" on the next. In a
 * clinical record an ambiguous date is a safety problem, not just an inconsistency —
 * so the day-month order and the "21 Aug 2026" month name are fixed here.
 *
 * Times render lowercase ("6:41 pm") rather than the "PM" Intl emits, and use a thin
 * no-break space so a time never wraps across the space before its meridiem.
 */

const DATE_OPTS = { day: "2-digit", month: "short", year: "numeric" };
const TIME_OPTS = { hour: "numeric", minute: "2-digit", hour12: true };
const LOCALE = "en-GB";

/** Parse to a Date, or null when the value is absent or unparseable. */
function parse(v) {
  if (v == null || v === "") return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * "6:41 PM" → "6:41 pm", joined with a narrow no-break space (U+202F) so a time never wraps
 * across the gap before its meridiem. en-GB already lowercases; other engines do not,
 * so this normalises rather than assuming.
 */
function tidyTime(s) {
  return s.replace(/\s*(AM|PM|am|pm)$/, (_, m) => `\u202F${m.toLowerCase()}`);
}

/** Date only: "21 Aug 2026". Null/invalid → "—". */
export function date(v) {
  const d = parse(v);
  return d ? d.toLocaleDateString(LOCALE, DATE_OPTS) : "—";
}

/** Time only: "6:41 pm". Null/invalid → "—". */
export function time(v) {
  const d = parse(v);
  return d ? tidyTime(d.toLocaleTimeString(LOCALE, TIME_OPTS)) : "—";
}

/** Time with seconds: "6:41:48 pm". For the live header clock. */
export function timeWithSeconds(v) {
  const d = parse(v);
  return d ? tidyTime(d.toLocaleTimeString(LOCALE, { ...TIME_OPTS, second: "2-digit" })) : "—";
}

/** Date and time: "21 Aug 2026, 6:41 pm". Null/invalid → "—". */
export function dateTime(v) {
  const d = parse(v);
  return d ? `${date(d)}, ${time(d)}` : "—";
}

/**
 * Relative for the recent past, absolute once it stops being useful: "just now",
 * "5 min ago", "3 h ago", then the full date. Live queues and audit rows read better
 * relative; a two-week-old record does not.
 */
export function timeAgo(v) {
  const d = parse(v);
  if (!d) return "—";

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 0) return dateTime(d);
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} d ago`;
  return dateTime(d);
}

/**
 * Age in whole years from a date of birth: "34y". Null/invalid → "—".
 *
 * Counts calendar years rather than dividing by 365.25 days, which was off by one for
 * anyone within a day or so of their birthday.
 */
export function age(v) {
  const d = parse(v);
  if (!d) return "—";

  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const monthDelta = now.getMonth() - d.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < d.getDate())) years -= 1;

  return years >= 0 ? `${years}y` : "—";
}

/**
 * Time-of-day greeting: "Good morning" / "Good afternoon" / "Good evening".
 *
 * Boundaries are local to the viewer, which is what you want in a hospital — a night
 * shift reading "Good morning" at 2am would be wrong for the person actually on duty.
 */
export function greeting(v = new Date()) {
  const d = v instanceof Date ? v : new Date(v);
  const hour = Number.isNaN(d.getTime()) ? new Date().getHours() : d.getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** The part of a name to greet someone by: "Ada Adeyemi" → "Ada". */
export function firstName(name) {
  if (!name) return "there";
  return String(name).trim().split(/\s+/)[0];
}

/**
 * A waiting duration in seconds → "4m", "1h 12m". Under a minute reads "just now".
 *
 * Separate from timeAgo(): that answers "when did this happen" against the clock, this
 * answers "how long has this person been standing there" from a server-computed figure.
 * The server sends seconds precisely so this stays live rather than freezing at the
 * moment the payload was built.
 */
export function duration(seconds) {
  // Guard null/undefined/"" explicitly: Number(null) is 0, which would render a MISSING
  // wait as "just now" — a real-looking figure for data we do not have.
  if (seconds == null || seconds === "") return "—";

  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "—";
  if (s < 60) return "just now";

  const mins = Math.floor(s / 60);
  if (mins < 60) return `${mins}m`;

  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
