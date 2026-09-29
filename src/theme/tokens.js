/**
 * Design tokens.
 *
 * Every value here is a CSS custom property reference, not a hex string. The palette
 * itself lives in `app/globals.css` under `:root` and `[data-theme="dark"]`, so switching
 * theme is one attribute on `<html>` — no re-render, no context threading, and no chance
 * of a stale colour.
 *
 * That last point is why it is done this way rather than by swapping a JS object at
 * runtime: dozens of components capture colours in module-level constants
 * (`const STATUS = { paid: C.emerald }`), which are evaluated once at import. A mutable
 * palette would leave every one of them showing yesterday's theme. A `var()` string is
 * constant, so those captures stay correct for free.
 *
 * The consequence is that you can no longer concatenate an alpha suffix onto a token —
 * `C.blue + "14"` would produce `var(--ava-blue)14`, which is not a colour. Use `alpha()`.
 */
export const C = {
  bg: "var(--ava-bg)",
  bgGrad: "var(--ava-bg-grad)",
  surface: "var(--ava-surface)",
  surface2: "var(--ava-surface-2)",
  border: "var(--ava-border)",
  borderSoft: "var(--ava-border-soft)",

  ink: "var(--ava-ink)",
  ink2: "var(--ava-ink-2)",
  ink3: "var(--ava-ink-3)",
  ink4: "var(--ava-ink-4)",

  blue: "var(--ava-blue)",
  blueDeep: "var(--ava-blue-deep)",
  blueSoft: "var(--ava-blue-soft)",
  blueMid: "var(--ava-blue-mid)",

  emerald: "var(--ava-emerald)",
  emeraldSoft: "var(--ava-emerald-soft)",

  amber: "var(--ava-amber)",
  amberSoft: "var(--ava-amber-soft)",

  red: "var(--ava-red)",
  redSoft: "var(--ava-red-soft)",

  violet: "var(--ava-violet)",
  violetSoft: "var(--ava-violet-soft)",

  cyan: "var(--ava-cyan)",
  cyanSoft: "var(--ava-cyan-soft)",

  pink: "var(--ava-pink)",

  /**
   * Text that sits ON a saturated fill (a blue button, a red badge).
   *
   * Not `#fff` any more: in dark mode the accent colours are lightened, and white text on
   * a light accent is the one combination that fails to read. This token flips with the
   * theme so a filled button stays legible in both.
   */
  onAccent: "var(--ava-on-accent)",
};

/**
 * A token at partial opacity — the tinted swatch behind an icon, a soft badge background.
 *
 * Replaces the old `C.blue + "14"` idiom, which relied on the token being a hex string.
 * `color-mix` keeps the blend in CSS, so it re-resolves when the theme changes rather than
 * baking in whatever the colour was at render time.
 *
 * @param {string} color  a token from `C`, or any CSS colour
 * @param {number} pct    0–100, the opacity of `color` over transparent
 */
export function alpha(color, pct) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

export const FONT = {
  display: "'Schibsted Grotesk', sans-serif",
  body: "'Hanken Grotesk', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

/**
 * Shadows are theme-aware too.
 *
 * A shadow is a light-source effect: on a dark surface the same soft grey glow reads as
 * grime rather than depth, so the dark palette deepens and tightens them instead of
 * reusing these.
 */
export const shadow = {
  card: "var(--ava-shadow-card)",
  raised: "var(--ava-shadow-raised)",
  pop: "var(--ava-shadow-pop)",
  glass: "var(--ava-shadow-glass)",
};
