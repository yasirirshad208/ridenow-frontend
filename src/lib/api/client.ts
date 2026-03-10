import { getClientApiBaseUrl } from '@/lib/config/client';
import { buildApiUrl, fetchWithTimeout, parseApiResponse } from '@/lib/api/http';

type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

export async function apiFetch<T = any>(path: string, options: ApiFetchOptions = {}) {
  const { timeoutMs = 15000, ...init } = options;
  const url = buildApiUrl(getClientApiBaseUrl(), path);
  const response = await fetchWithTimeout(url, init, timeoutMs);
  return parseApiResponse<T>(response);
}

