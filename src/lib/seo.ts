import { routing } from "@/i18n/routing";

// Single source of truth for the canonical origin. Set NEXT_PUBLIC_SITE_URL to
// the real domain on deploy; falls back to localhost for dev. No trailing slash.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

// Build the hreflang `languages` map for a locale-agnostic path (e.g. "/shop").
// Includes an x-default pointing at the default locale so Google has a fallback.
export function alternateLanguages(path: string): Record<string, string> {
  const clean = path === "/" ? "" : path;
  const langs: Record<string, string> = {};
  for (const locale of LOCALES) {
    langs[locale] = `${SITE_URL}/${locale}${clean}`;
  }
  langs["x-default"] = `${SITE_URL}/${DEFAULT_LOCALE}${clean}`;
  return langs;
}

// Absolute canonical URL for a given locale + path.
export function canonical(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  return `${SITE_URL}/${locale}${clean}`;
}
