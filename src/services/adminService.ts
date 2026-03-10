import { apiFetch } from '@/lib/api/client';

const CACHE_TTL_MS = 60 * 1000;
const apiCache = new Map<string, { data: any; expiresAt: number }>();

function getCacheKey(scope: string, token: string) {
  return `${scope}:${token}`;
}

function getCached<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt < Date.now()) {
    apiCache.delete(key);
    return null;
  }

  return cached.data as T;
}

function setCached(key: string, data: any, ttlMs = CACHE_TTL_MS) {
  apiCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export async function getDashboardStats(token: string, options: { force?: boolean } = {}) {
  const cacheKey = getCacheKey('dashboard', token);

  if (!options.force) {
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await apiFetch('/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  setCached(cacheKey, response);
  return response;
}

export function primeDashboardStats(token: string) {
  void getDashboardStats(token).catch(() => {
    // Best-effort prefetch; ignore failures.
  });
}

export async function getAllUsers(token: string, page = 1, limit = 10) {
  return apiFetch(`/admin/users?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUserRole(token: string, userId: string, role: string) {
  return apiFetch(`/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
}

export async function getAllReservations(token: string, filters: { page?: number, limit?: number, status?: string, startDate?: string, endDate?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const query = params.toString();
  return apiFetch(`/admin/reservations${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateReservationStatus(token: string, reservationId: string, status: string) {
  return apiFetch(`/reservations/${reservationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

// --- Vehicle Management ---
export async function createVehicle(token: string, vehicleData: FormData) {
  return apiFetch('/vehicles', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: vehicleData,
  });
}

export async function updateVehicle(token: string, vehicleId: string, vehicleData: FormData) {

  return apiFetch(`/vehicles/${vehicleId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: vehicleData,
  });
}

export async function deleteVehicle(token: string, vehicleId: string) {
  return apiFetch(`/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
