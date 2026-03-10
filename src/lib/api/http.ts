type ApiErrorBody = {
  message?: string;
  error?: string;
};

export function buildApiUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const jsonBody = body as ApiErrorBody;
    const message =
      (jsonBody && (jsonBody.message || jsonBody.error)) ||
      (typeof body === 'string' && body) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = 15000
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

