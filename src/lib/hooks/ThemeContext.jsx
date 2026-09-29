'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Light / dark / follow-the-system.
 *
 * The whole mechanism is one attribute on `<html>`: the palette lives in CSS custom
 * properties (see `app/globals.css`) and every token in `theme/tokens.js` is a `var()`
 * reference, so setting `data-theme` repaints the entire portal with no re-render and no
 * component knowing anything about it.
 *
 * Three states, not two. "System" is the default and is genuinely distinct from light: a
 * user who has their laptop on auto expects the app to follow it at dusk, and collapsing
 * that to a remembered "light" would break that expectation the first time it got dark.
 * Choosing light or dark explicitly pins it and stops following.
 */

const STORAGE_KEY = "ava.theme";
const MODES = ["system", "light", "dark"];

const ThemeContext = createContext(null);

/**
 * Written to `<html>` before React hydrates, from `app/layout.jsx`.
 *
 * Without this the first paint is always the light palette, and a dark-mode user gets a
 * white flash on every page load — the one bug that makes people turn dark mode off again.
 * Kept as a string because it has to run as a blocking inline script, before any bundle.
 */
export const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var mode = localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || 'system';
    var dark = mode === 'dark' || (mode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (mode !== 'system') document.documentElement.setAttribute('data-theme', mode);
    else if (dark) document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("system");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (MODES.includes(saved)) setMode(saved);
    } catch {
      // A blocked or corrupt store just means the system default.
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);

    // Listened to, not read once: a user on auto changes theme at dusk without reloading.
    const onChange = (e) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const apply = useCallback((next) => {
    const root = document.documentElement;

    // `system` REMOVES the attribute rather than setting a value, which hands control back
    // to the `prefers-color-scheme` media query in the stylesheet. Setting data-theme to
    // the resolved value instead would silently pin it at whatever it was at that moment.
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
  }, []);

  useEffect(() => {
    apply(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Private browsing. The theme still works for this session.
    }
  }, [mode, apply]);

  const value = useMemo(() => ({
    mode,
    setMode: (next) => setMode(MODES.includes(next) ? next : "system"),
    /** What is actually on screen right now, which is what an icon should reflect. */
    resolved: mode === "system" ? (systemDark ? "dark" : "light") : mode,
    modes: MODES,
  }), [mode, systemDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Safe outside the provider — falls back to the system default rather than throwing. */
export function useTheme() {
  return useContext(ThemeContext) ?? {
    mode: "system",
    setMode: () => {},
    resolved: "light",
    modes: MODES,
  };
}
