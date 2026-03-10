const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_IMAGE_BASE_URL = 'http://localhost:5000';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export function getClientApiBaseUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL);
}

export function getClientImageBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (explicit) return trimTrailingSlash(explicit);

  const apiBase = getClientApiBaseUrl();
  if (apiBase.endsWith('/api')) {
    return apiBase.slice(0, -4);
  }

  return trimTrailingSlash(DEFAULT_IMAGE_BASE_URL);
}

