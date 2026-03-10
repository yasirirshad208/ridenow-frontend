import 'server-only';

import { getServerApiBaseUrl } from '@/lib/config/server';
import { buildApiUrl, fetchWithTimeout, parseApiResponse } from '@/lib/api/http';

type ServerApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

export async function serverApiFetch<T = any>(
  path: string,
  options: ServerApiFetchOptions = {}
) {
  const { timeoutMs = 15000, ...init } = options;
  const url = buildApiUrl(getServerApiBaseUrl(), path);
  const response = await fetchWithTimeout(
    url,
    {
      cache: 'no-store',
      ...init,
    },
    timeoutMs
  );
  return parseApiResponse<T>(response);
}

