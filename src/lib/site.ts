export const DEFAULT_SITE_URL = 'https://promptpad-4yp.pages.dev';

export function getSiteUrl(site?: string | URL | null): string {
  const value = site?.toString() ?? DEFAULT_SITE_URL;
  return value.replace(/\/$/, '');
}

export function buildAbsoluteUrl(path: string, site?: string | URL | null): string {
  return new URL(path, `${getSiteUrl(site)}/`).toString();
}
